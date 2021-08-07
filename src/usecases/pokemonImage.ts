import { readFile, writeFile } from 'fs/promises'

import { getRequest } from '../utils/http';

// Partial response from the pokemon API, full object available in docs
// Ref: https://pokeapi.co/
type PokemonApiResponse = {
  sprites: {
    front_default: string
  }
}

export const getPokemonImageFromId = async (id: string, pokemonImageApiUrl: string): Promise<Buffer> => {
  try {
    const existingPokemonImage = await readFile(`./cache/pokemon/${id}`);

    console.debug(`Cache hit for pokemon number: ${id}`);

    return existingPokemonImage;
  } catch {
    console.debug(`Cache miss for pokemon number: ${id}, fetching image from API...`);

    return getPokemonImageFromApi(id, pokemonImageApiUrl);
  }
}

const getPokemonImageFromApi = async (id: string, pokemonImageApiUrl: string) => {
  try {
    const pokemonData = await getRequest(`${pokemonImageApiUrl}/${id}`) as PokemonApiResponse;
    const pokemonImage = await getRequest(pokemonData.sprites.front_default) as Buffer;

    await writeFile(`./cache/pokemon/${id}`, pokemonImage);

    return pokemonImage;
  } catch (error) {
    console.debug('Error: Failed to get Pokemon image');

    throw new Error(error.message);
  }
};
