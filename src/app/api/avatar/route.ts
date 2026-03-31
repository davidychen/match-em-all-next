import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pokemonId } = await request.json();
  const admin = createAdminClient();

  // Verify user owns this pokemon
  const { data: collection } = await admin
    .from("collections")
    .select("id")
    .eq("owner_id", user.id)
    .eq("pokemon_id", pokemonId)
    .single();

  if (!collection) {
    return NextResponse.json({ error: "You don't have this pokemon" }, { status: 400 });
  }

  await admin
    .from("profiles")
    .update({ avatar_id: pokemonId })
    .eq("id", user.id);

  return NextResponse.json({ success: true, avatarId: pokemonId });
}
