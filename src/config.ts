const POKEMON_IMAGE_API_URL = 'https://pokeapi.co/api/v2/pokemon';
const CAT_IMAGE_API_URL = 'https://api.thecatapi.com/v1/images/search?mime_types=png';
const ONE_MINUTE_MS = 60000;
const BASE_CACHE_FOLDER = './cache';
const CAT_CACHE_FOLDER = `${BASE_CACHE_FOLDER}/cats`;
const POKEMON_CACHE_FOLDER = `${BASE_CACHE_FOLDER}/pokemon`;
const OVERLAY_CACHE_FOLDER = `${BASE_CACHE_FOLDER}/overlays`;

const { DEBUG_MODE, DISABLE_LOGS } = process.env;

export const config = Object.freeze({
  catImageApiUrl: CAT_IMAGE_API_URL,
  pokemonImageApiUrl: POKEMON_IMAGE_API_URL,
  isDebugMode: DEBUG_MODE === 'true',
  disableLogs: DISABLE_LOGS === 'true',
  catImageCacheFolder: CAT_CACHE_FOLDER,
  pokemonImageCacheFolder: POKEMON_CACHE_FOLDER,
  overlayImageCacheFolder: OVERLAY_CACHE_FOLDER,
  catImageTimeReference: ONE_MINUTE_MS,
  catImageMaxRequests: 10,
  cacheFoldernames: [BASE_CACHE_FOLDER, CAT_CACHE_FOLDER, POKEMON_CACHE_FOLDER, OVERLAY_CACHE_FOLDER],
});
