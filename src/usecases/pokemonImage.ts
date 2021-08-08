import fs from 'fs'
import { writeFile } from 'fs/promises'

import { ImageProps } from '../types';
import { getRequest } from '../utils/http';
import { logger } from '../utils/log';

const log = logger('Pokemon image usecase');

// Partial response from the pokemon API, full object available in docs
// Ref: https://pokeapi.co/
type PokemonApiResponse = {
  sprites: {
    front_default: string
  }
}

export const getPokemonImageProps = async (id: string, pokemonImageApiUrl: string): Promise<ImageProps> => {
  const filePath = `./cache/pokemon/${id}`

  if (fs.existsSync(filePath)) {
    log.debug(`Cache hit for pokemon number: ${id}`);

    return {
      filePath,
      id,
    };
  } else {
    log.debug(`Cache miss for pokemon number: ${id}, fetching image from API...`);

    return getPokemonImagePropsUsingApi(id, pokemonImageApiUrl);
  }
}

export const getPokemonImagePropsUsingApi = async (id: string, pokemonImageApiUrl: string): Promise<ImageProps> => {
  try {
    const pokemonData = await getRequest(`${pokemonImageApiUrl}/${id}`) as PokemonApiResponse;
    const pokemonImage = await getRequest(pokemonData.sprites.front_default) as Buffer;
    const filePath = `./cache/pokemon/${id}`;

    await writeFile(filePath, pokemonImage);

    return {
      filePath,
      id,
    };
  } catch (error) {
    log.error('Failed to get Pokemon image from API');

    throw new Error(error.message);
  }
};
