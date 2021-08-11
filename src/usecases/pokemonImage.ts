import fs from 'fs';
import { writeFile } from 'fs/promises';

import { ImageProps, ImageUsecaseProps } from '../types';
import { getRequest } from '../utils/http';
import { logger } from '../utils/log';

const log = logger('Pokemon image usecase');

// Partial response from the pokemon API, full object available in docs
// Ref: https://pokeapi.co/
type PokemonApiResponse = {
  sprites: {
    front_default: string;
  };
};

type PokemonUsecaseProps = ImageUsecaseProps & { id: string };

export const getPokemonImageProps = async (usecaseProps: PokemonUsecaseProps): Promise<ImageProps> => {
  const { id, cacheFolder } = usecaseProps;
  const filePath = `${cacheFolder}/${id}`;

  if (fs.existsSync(filePath)) {
    log.debug(`Cache hit for pokemon number: ${id}`);

    return {
      filePath,
      id,
    };
  } else {
    log.debug(`Cache miss for pokemon number: ${id}, fetching image from API...`);

    return getPokemonImagePropsUsingApi(usecaseProps);
  }
};

export const getPokemonImagePropsUsingApi = async (usecaseProps: PokemonUsecaseProps): Promise<ImageProps> => {
  const { apiUrl, id, cacheFolder } = usecaseProps;

  try {
    const pokemonData = (await getRequest(`${apiUrl}/${id}`)) as PokemonApiResponse;
    const pokemonImage = (await getRequest(pokemonData.sprites.front_default)) as Buffer;
    const filePath = `${cacheFolder}/${id}`;

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
