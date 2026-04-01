import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { cleanupStaleFlips } from "@/lib/game/logic";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Clean up stale flips before returning state
  const admin = createAdminClient();
  await cleanupStaleFlips(admin);

  const { data: cards } = await admin
    .from("board_cards")
    .select("*")
    .order("index");

  return NextResponse.json({ cards: cards ?? [] });
}
