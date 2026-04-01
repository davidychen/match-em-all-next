import { SupabaseClient } from "@supabase/supabase-js";
import { TOTAL_CARDS, PAIRS_COUNT, FLIP_TIMEOUT_MS } from "./constants";
import { fetchRandomPokemon } from "./pokemon-fetcher";
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

/* ─── Throttled cleanup: at most once per 10 seconds ─── */
let lastCleanupTime = 0;
const CLEANUP_THROTTLE_MS = 10_000;

async function maybeCleanupStaleFlips(supabase: SupabaseClient): Promise<void> {
  const now = Date.now();
  if (now - lastCleanupTime > CLEANUP_THROTTLE_MS) {
    lastCleanupTime = now;
    await cleanupStaleFlips(supabase);
  }
}

/* ─── Helper: upsert match player score ─── */
async function upsertMatchPlayer(
  supabase: SupabaseClient,
  userId: string,
  pokemonName: string,
  now: string
): Promise<void> {
  const { data: player } = await supabase
    .from("match_players")
    .select("count")
    .eq("owner_id", userId)
    .single();

  if (player) {
    await supabase
      .from("match_players")
      .update({ count: player.count + 1, last_pokemon_name: pokemonName, matched_at: now })
      .eq("owner_id", userId);
  } else {
    await supabase.from("match_players").insert({
      owner_id: userId,
      count: 1,
      last_pokemon_name: pokemonName,
      matched_at: now,
    });
  }
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

  // Throttled cleanup — at most once per 10s instead of every flip
  await maybeCleanupStaleFlips(supabase);

  // ── Parallel batch: fetch card, user's existing flips, and pokemon map ──
  const [cardResult, existingFlipsResult, stateResult] = await Promise.all([
    supabase.from("board_cards").select("*").eq("index", index).single(),
    supabase.from("board_cards").select("*").eq("owner_id", userId).eq("is_matched", false),
    supabase.from("board_state").select("pokemon_map").eq("id", 1).single(),
  ]);

  const card = cardResult.data;
  if (!card) return { status: "error", message: "Card not found" };
  if (card.is_matched) return { status: "error", message: "Card already matched" };
  if (card.owner_id) return { status: "error", message: "Card already flipped" };

  const state = stateResult.data;
  if (!state) return { status: "error", message: "Board not initialized" };

  const myFlippedCards = existingFlipsResult.data ?? [];

  // If user already has 2+ unmatched cards, flip them ALL back first
  if (myFlippedCards.length >= 2) {
    const indices = myFlippedCards.map((c) => c.index);
    await supabase
      .from("board_cards")
      .update({ owner_id: null, owner_name: null, pokemon: null, flipped_at: null })
      .in("index", indices)
      .eq("is_matched", false);
  }

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

  // ── Compute match state from known data (no re-SELECT needed) ──
  // If we cleared 2+ cards above, we only have the newly claimed card
  // If we had 1 card before, we now have 2 → check match
  // If we had 0, we only have the newly claimed card
  const previousFlips = myFlippedCards.length >= 2 ? [] : myFlippedCards;
  const otherCards = previousFlips.filter((c) => c.index !== index);

  if (otherCards.length === 0) {
    return { status: "waiting", pokemon };
  }

  if (otherCards.length === 1) {
    const otherCard = otherCards[0];
    const otherPokemon: PokemonInfo | null = otherCard.pokemon;

    if (otherPokemon && otherPokemon.pokemonId === pokemon.pokemonId) {
      // MATCH! — parallel: mark matched + add to collection + update score
      const now = new Date().toISOString();

      await Promise.all([
        supabase
          .from("board_cards")
          .update({ is_matched: true, matched_at: now })
          .in("index", [index, otherCard.index]),
        addToCollection(supabase, userId, pokemon),
        upsertMatchPlayer(supabase, userId, pokemon.nameEn, now),
      ]);

      // Check if all cards matched → reset board (must be after the update commits)
      const { count } = await supabase
        .from("board_cards")
        .select("*", { count: "exact", head: true })
        .eq("is_matched", true);

      if (count === TOTAL_CARDS) {
        await initBoard(supabase);
      }

      return { status: "matched", pokemon, matchedPokemon: pokemon };
    } else {
      return { status: "no_match", pokemon };
    }
  }

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
