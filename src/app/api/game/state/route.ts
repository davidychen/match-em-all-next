import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cards } = await supabase
    .from("board_cards")
    .select("*")
    .order("index");

  return NextResponse.json({ cards: cards ?? [] });
}
