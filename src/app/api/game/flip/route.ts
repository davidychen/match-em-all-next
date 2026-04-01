import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { flipCard } from "@/lib/game/logic";
import { rateLimit } from "@/lib/rate-limit";

// Per-user mutex to prevent concurrent flip race conditions
const userLocks = new Map<string, Promise<unknown>>();

function withUserLock<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  const prev = userLocks.get(userId) ?? Promise.resolve();
  const next = prev.then(fn, fn); // run even if previous errored
  userLocks.set(userId, next);
  // Cleanup after completion
  next.finally(() => {
    if (userLocks.get(userId) === next) {
      userLocks.delete(userId);
    }
  });
  return next;
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`flip:${user.id}`, 5, 1000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Slow down!" }, { status: 429 });
  }

  const { index } = await request.json();

  if (typeof index !== "number" || index < 0 || index > 35) {
    return NextResponse.json({ error: "Invalid card index" }, { status: 400 });
  }

  // Serialize flips per user — prevents race conditions from fast clicks
  const result = await withUserLock(user.id, async () => {
    const admin = createAdminClient();
    const username = user.user_metadata?.username ?? "Player";
    return flipCard(admin, user.id, username, index);
  });

  if (result.status === "error") {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json(result);
}
