export const TOTAL_CARDS = 36;
export const PAIRS_COUNT = TOTAL_CARDS / 2;
export const MAX_POKEMON_ID = 807;
export const FLIP_TIMEOUT_MS = 5000;

export const LEGENDARY_IDS = new Set([
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382,
  383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641,
  642, 643, 644, 645, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790,
  791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805,
  806, 807,
]);

export const MYTHICAL_IDS = new Set([
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720,
  721,
]);

export function getSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

export function getAnimatedSpriteUrl(name: string): string {
  return `https://www.smogon.com/dex/media/sprites/xy/${name.toLowerCase()}.gif`;
}
