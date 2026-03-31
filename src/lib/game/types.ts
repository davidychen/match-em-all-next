export interface PokemonInfo {
  pokemonId: number;
  name: string;
  nameEn: string;
  color: string;
  types: string[];
  rate: number;
  isLegendary: boolean;
  evolvesTo: { pokemonId: number; name: string }[];
}

export interface BoardCard {
  index: number;
  owner_id: string | null;
  owner_name: string | null;
  pokemon: PokemonInfo | null;
  is_matched: boolean;
  matched_at: string | null;
  flipped_at: string | null;
}

export interface MatchPlayer {
  id: string;
  owner_id: string;
  count: number;
  last_pokemon_name: string | null;
  matched_at: string | null;
}

export interface OnlinePlayer {
  user_id: string;
  username: string;
  avatar_id: number | null;
}

export interface CollectionItem {
  id: string;
  owner_id: string;
  pokemon_id: number;
  name: string;
  name_en: string;
  color: string | null;
  type: string[];
  rate: number | null;
  is_legendary: boolean;
  evolves_to: { pokemonId: number; name: string }[] | null;
  count: number;
  first_at: string;
  last_at: string;
}

export interface FlipResult {
  status: "waiting" | "matched" | "no_match" | "error";
  pokemon?: PokemonInfo;
  matchedPokemon?: PokemonInfo;
  message?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_id: number | null;
  created_at: string;
}
