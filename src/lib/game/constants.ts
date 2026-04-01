export const TOTAL_CARDS = 36;
export const PAIRS_COUNT = TOTAL_CARDS / 2;
export const MAX_POKEMON_ID = 1025;
export const FLIP_TIMEOUT_MS = 5000;

export const LEGENDARY_IDS = new Set([
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382,
  383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641,
  642, 643, 644, 645, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790,
  791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805,
  806, 807, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 905, 1001, 1002,
  1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024, 1025,
]);

export const MYTHICAL_IDS = new Set([
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720,
  721, 801, 802, 807, 808, 809, 893, 1025,
]);

/** Default pixel sprite (96x96 PNG) — for game card backs, small thumbnails */
export function getSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

/** Animated showdown GIF — for game card reveals (animated pixel art) */
export function getAnimatedSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pokemonId}.gif`;
}

/** Official artwork (475x475 PNG) — for collection grid, profile avatar */
export function getOfficialArtworkUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

/** Back sprite (96x96 PNG) — for collection back view */
export function getBackSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`;
}
