const POKEMON_IMAGE_API_URL = 'https://pokeapi.co/api/v2/pokemon';
const CAT_IMAGE_API_URL = 'https://api.thecatapi.com/v1/images/search?mime_types=png';

const { DEBUG_MODE, DISABLE_LOGS } = process.env;

export const config = Object.freeze({
  catImageApiUrl: CAT_IMAGE_API_URL,
  pokemonImageApiUrl: POKEMON_IMAGE_API_URL,
  isDebugMode: DEBUG_MODE === 'true',
  disableLogs: DISABLE_LOGS,
});
