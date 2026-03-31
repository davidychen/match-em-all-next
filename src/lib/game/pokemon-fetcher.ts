import { SupabaseClient } from "@supabase/supabase-js";
import axios from "axios";
import { LEGENDARY_IDS, MYTHICAL_IDS, MAX_POKEMON_ID } from "./constants";
import type { PokemonInfo } from "./types";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

function extractEnglishName(names: { name: string; language: { name: string } }[]): string {
  return names.find((n) => n.language.name === "en")?.name ?? "Unknown";
}

function extractEvolutions(chain: any): { pokemonId: number; name: string }[] {
  const results: { pokemonId: number; name: string }[] = [];
  function walk(node: any) {
    if (!node) return;
    for (const evo of node.evolves_to ?? []) {
      const url: string = evo.species?.url ?? "";
      const idMatch = url.match(/\/pokemon-species\/(\d+)\//);
      if (idMatch) {
        results.push({ pokemonId: parseInt(idMatch[1]), name: evo.species.name });
      }
      walk(evo);
    }
  }
  walk(chain);
  return results;
}

function findEvolvesTo(chain: any, pokemonId: number): { pokemonId: number; name: string }[] {
  function search(node: any): { pokemonId: number; name: string }[] | null {
    const url: string = node.species?.url ?? "";
    const idMatch = url.match(/\/pokemon-species\/(\d+)\//);
    const nodeId = idMatch ? parseInt(idMatch[1]) : 0;

    if (nodeId === pokemonId) {
      return (node.evolves_to ?? []).map((evo: any) => {
        const evoUrl: string = evo.species?.url ?? "";
        const evoMatch = evoUrl.match(/\/pokemon-species\/(\d+)\//);
        return {
          pokemonId: evoMatch ? parseInt(evoMatch[1]) : 0,
          name: evo.species?.name ?? "unknown",
        };
      });
    }

    for (const evo of node.evolves_to ?? []) {
      const found = search(evo);
      if (found) return found;
    }
    return null;
  }
  return search(chain) ?? [];
}

export async function fetchPokemonInfo(
  supabase: SupabaseClient,
  pokemonId: number
): Promise<PokemonInfo> {
  // Check cache first
  const { data: cached } = await supabase
    .from("pokemon_cache")
    .select("*")
    .eq("pokemon_id", pokemonId)
    .single();

  if (cached) {
    return buildPokemonInfo(pokemonId, cached.species_data, cached.type_data, cached.evolution_data);
  }

  // Fetch from PokeAPI
  const [speciesRes, pokemonRes] = await Promise.all([
    axios.get(`${POKEAPI_BASE}/pokemon-species/${pokemonId}`),
    axios.get(`${POKEAPI_BASE}/pokemon/${pokemonId}`),
  ]);

  const speciesData = speciesRes.data;
  const typeData = pokemonRes.data;

  const chainUrl = speciesData.evolution_chain?.url;
  let evolutionData: any = { chain: {} };
  if (chainUrl) {
    const evoRes = await axios.get(chainUrl);
    evolutionData = evoRes.data;
  }

  // Cache it
  await supabase.from("pokemon_cache").upsert({
    pokemon_id: pokemonId,
    species_data: speciesData,
    type_data: typeData,
    evolution_data: evolutionData,
    cached_at: new Date().toISOString(),
  });

  return buildPokemonInfo(pokemonId, speciesData, typeData, evolutionData);
}

function buildPokemonInfo(
  pokemonId: number,
  speciesData: any,
  typeData: any,
  evolutionData: any
): PokemonInfo {
  const nameEn = extractEnglishName(speciesData.names ?? []);
  const color = speciesData.color?.name ?? "unknown";
  const rate = speciesData.capture_rate ?? 128;
  const types = (typeData.types ?? []).map((t: any) => t.type?.name).filter(Boolean);
  const isLegendary = LEGENDARY_IDS.has(pokemonId) || MYTHICAL_IDS.has(pokemonId) ||
    speciesData.is_legendary || speciesData.is_mythical;
  const evolvesTo = findEvolvesTo(evolutionData.chain, pokemonId);

  return {
    pokemonId,
    name: speciesData.name ?? `pokemon-${pokemonId}`,
    nameEn,
    color,
    types,
    rate,
    isLegendary,
    evolvesTo,
  };
}

export async function fetchRandomPokemon(supabase: SupabaseClient): Promise<PokemonInfo> {
  // Pick 3 random IDs, fetch all, return the rarest (lowest capture_rate)
  const ids = Array.from({ length: 3 }, () => Math.floor(Math.random() * MAX_POKEMON_ID) + 1);

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        return await fetchPokemonInfo(supabase, id);
      } catch {
        return null;
      }
    })
  );

  const valid = results.filter((r): r is PokemonInfo => r !== null);
  if (valid.length === 0) {
    // Fallback to Pikachu
    return fetchPokemonInfo(supabase, 25);
  }

  // Return the rarest (lowest capture rate)
  return valid.reduce((a, b) => (a.rate <= b.rate ? a : b));
}
