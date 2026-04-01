import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // No more cleanupStaleFlips here — client-side handles UI cleanup,
  // server-side cleanup is throttled inside flipCard()
  const admin = createAdminClient();
  const { data: cards } = await admin
    .from("board_cards")
    .select("*")
    .order("index");

  return NextResponse.json({ cards: cards ?? [] });
}
