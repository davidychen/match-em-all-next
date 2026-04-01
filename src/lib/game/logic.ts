import { SupabaseClient } from "@supabase/supabase-js";
import { TOTAL_CARDS, PAIRS_COUNT, FLIP_TIMEOUT_MS } from "./constants";
import { fetchRandomPokemon, fetchPokemonInfo } from "./pokemon-fetcher";
import type { PokemonInfo, FlipResult } from "./types";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function initBoard(supabase: SupabaseClient): Promise<void> {
  // Fetch 18 unique random pokemon
  const pokemonSet: PokemonInfo[] = [];
  const usedIds = new Set<number>();

  for (let i = 0; i < PAIRS_COUNT; i++) {
    let pokemon: PokemonInfo;
    let attempts = 0;
    do {
      pokemon = await fetchRandomPokemon(supabase);
      attempts++;
    } while (usedIds.has(pokemon.pokemonId) && attempts < 10);
    usedIds.add(pokemon.pokemonId);
    pokemonSet.push(pokemon);
  }

  // Create pairs and shuffle
  const pokemonMap = shuffle([...pokemonSet, ...pokemonSet]);

  // Store secret mapping
  await supabase.from("board_state").upsert({
    id: 1,
    pokemon_map: pokemonMap,
    created_at: new Date().toISOString(),
  });

  // Reset all board cards
  const cards = Array.from({ length: TOTAL_CARDS }, (_, i) => ({
    index: i,
    owner_id: null,
    owner_name: null,
    pokemon: null,
    is_matched: false,
    matched_at: null,
    flipped_at: null,
  }));

  for (const card of cards) {
    await supabase.from("board_cards").upsert(card);
  }

  // Clear match players
  await supabase.from("match_players").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

export async function cleanupStaleFlips(supabase: SupabaseClient): Promise<void> {
  const cutoff = new Date(Date.now() - FLIP_TIMEOUT_MS).toISOString();
  await supabase
    .from("board_cards")
    .update({ owner_id: null, owner_name: null, pokemon: null, flipped_at: null })
    .eq("is_matched", false)
    .not("owner_id", "is", null)
    .lt("flipped_at", cutoff);
}

export async function flipCard(
  supabase: SupabaseClient,
  userId: string,
  username: string,
  index: number
): Promise<FlipResult> {
  if (index < 0 || index >= TOTAL_CARDS) {
    return { status: "error", message: "Invalid card index" };
  }

  // Cleanup stale flips (older than 5s)
  await cleanupStaleFlips(supabase);

  // Check card is available
  const { data: card } = await supabase
    .from("board_cards")
    .select("*")
    .eq("index", index)
    .single();

  if (!card) return { status: "error", message: "Card not found" };
  if (card.is_matched) return { status: "error", message: "Card already matched" };
  if (card.owner_id) return { status: "error", message: "Card already flipped" };

  // Check how many unmatched cards this user already has flipped
  const { data: existingFlips } = await supabase
    .from("board_cards")
    .select("*")
    .eq("owner_id", userId)
    .eq("is_matched", false);

  const myFlippedCards = existingFlips ?? [];

  // If user already has 2+ unmatched cards, flip them ALL back first
  if (myFlippedCards.length >= 2) {
    const indices = myFlippedCards.map((c) => c.index);
    await supabase
      .from("board_cards")
      .update({ owner_id: null, owner_name: null, pokemon: null, flipped_at: null })
      .in("index", indices)
      .eq("is_matched", false);
  }

  // Get secret pokemon mapping
  const { data: state } = await supabase
    .from("board_state")
    .select("pokemon_map")
    .eq("id", 1)
    .single();

  if (!state) return { status: "error", message: "Board not initialized" };

  const pokemonMap: PokemonInfo[] = state.pokemon_map;
  const pokemon = pokemonMap[index];

  // Claim the card
  const { error: claimError } = await supabase
    .from("board_cards")
    .update({
      owner_id: userId,
      owner_name: username,
      pokemon,
      flipped_at: new Date().toISOString(),
    })
    .eq("index", index)
    .is("owner_id", null)
    .eq("is_matched", false);

  if (claimError) return { status: "error", message: "Failed to claim card" };

  // Re-check: how many unmatched cards does this user now have? (should be 1 or 2)
  const { data: myCards } = await supabase
    .from("board_cards")
    .select("*")
    .eq("owner_id", userId)
    .eq("is_matched", false);

  const otherCards = (myCards ?? []).filter((c) => c.index !== index);

  // Only 1 card flipped (the one we just claimed) — wait for 2nd
  if (otherCards.length === 0) {
    return { status: "waiting", pokemon };
  }

  // 2 cards flipped — check for match
  if (otherCards.length === 1) {
    const otherCard = otherCards[0];
    const otherPokemon: PokemonInfo | null = otherCard.pokemon;

    if (otherPokemon && otherPokemon.pokemonId === pokemon.pokemonId) {
      // MATCH!
      const now = new Date().toISOString();
      await supabase
        .from("board_cards")
        .update({ is_matched: true, matched_at: now })
        .in("index", [index, otherCard.index]);

      // Add to collection
      await addToCollection(supabase, userId, pokemon);

      // Update match player score
      const { data: player } = await supabase
        .from("match_players")
        .select("count")
        .eq("owner_id", userId)
        .single();

      if (player) {
        await supabase
          .from("match_players")
          .update({ count: player.count + 1, last_pokemon_name: pokemon.nameEn, matched_at: now })
          .eq("owner_id", userId);
      } else {
        await supabase.from("match_players").insert({
          owner_id: userId,
          count: 1,
          last_pokemon_name: pokemon.nameEn,
          matched_at: now,
        });
      }

      // Check if all cards matched → reset board
      const { count } = await supabase
        .from("board_cards")
        .select("*", { count: "exact", head: true })
        .eq("is_matched", true);

      if (count === TOTAL_CARDS) {
        await initBoard(supabase);
      }

      return { status: "matched", pokemon, matchedPokemon: pokemon };
    } else {
      // No match — both cards stay visible for 5s, then auto-clear
      return { status: "no_match", pokemon };
    }
  }

  // Shouldn't happen (we cleared extras above), but just in case
  return { status: "waiting", pokemon };
}

export async function addToCollection(
  supabase: SupabaseClient,
  userId: string,
  pokemon: PokemonInfo
): Promise<void> {
  const { data: existing } = await supabase
    .from("collections")
    .select("id, count")
    .eq("owner_id", userId)
    .eq("pokemon_id", pokemon.pokemonId)
    .single();

  if (existing) {
    await supabase
      .from("collections")
      .update({ count: existing.count + 1, last_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("collections").insert({
      owner_id: userId,
      pokemon_id: pokemon.pokemonId,
      name: pokemon.name,
      name_en: pokemon.nameEn,
      color: pokemon.color,
      type: pokemon.types,
      rate: pokemon.rate,
      is_legendary: pokemon.isLegendary,
      evolves_to: pokemon.evolvesTo,
      count: 1,
    });
  }
}
