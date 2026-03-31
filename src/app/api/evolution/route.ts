import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { fetchPokemonInfo } from "@/lib/game/pokemon-fetcher";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`evolve:${user.id}`, 5, 1000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { pokemonId } = await request.json();
  const admin = createAdminClient();

  // Get the pokemon from user's collection
  const { data: collection } = await admin
    .from("collections")
    .select("*")
    .eq("owner_id", user.id)
    .eq("pokemon_id", pokemonId)
    .single();

  if (!collection) {
    return NextResponse.json({ error: "Pokemon not in collection" }, { status: 404 });
  }

  if (collection.count < 3) {
    return NextResponse.json({ error: "Need at least 3 to evolve" }, { status: 400 });
  }

  const evolvesTo = collection.evolves_to as { pokemonId: number; name: string }[] | null;
  if (!evolvesTo || evolvesTo.length === 0) {
    return NextResponse.json({ error: "This pokemon cannot evolve" }, { status: 400 });
  }

  // Pick random evolution target
  const target = evolvesTo[Math.floor(Math.random() * evolvesTo.length)];

  // Decrement original by 3
  if (collection.count <= 3) {
    await admin.from("collections").delete().eq("id", collection.id);
  } else {
    await admin
      .from("collections")
      .update({ count: collection.count - 3 })
      .eq("id", collection.id);
  }

  // Fetch evolved pokemon info
  const evolvedInfo = await fetchPokemonInfo(admin, target.pokemonId);

  // Upsert evolved form
  const { data: existing } = await admin
    .from("collections")
    .select("id, count")
    .eq("owner_id", user.id)
    .eq("pokemon_id", target.pokemonId)
    .single();

  if (existing) {
    await admin
      .from("collections")
      .update({ count: existing.count + 1, last_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await admin.from("collections").insert({
      owner_id: user.id,
      pokemon_id: evolvedInfo.pokemonId,
      name: evolvedInfo.name,
      name_en: evolvedInfo.nameEn,
      color: evolvedInfo.color,
      type: evolvedInfo.types,
      rate: evolvedInfo.rate,
      is_legendary: evolvedInfo.isLegendary,
      evolves_to: evolvedInfo.evolvesTo,
      count: 1,
    });
  }

  return NextResponse.json({ evolved: evolvedInfo });
}
