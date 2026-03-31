export type {
  BoardCard,
  MatchPlayer,
  OnlinePlayer,
  CollectionItem,
  FlipResult,
  Profile,
  PokemonInfo,
} from "@/lib/game/types";

export interface CollectionResponse {
  data: import("@/lib/game/types").CollectionItem[];
  nextCursor: string | null;
}
