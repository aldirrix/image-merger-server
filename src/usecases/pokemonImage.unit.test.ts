import { writeFile, rm } from 'fs/promises'
import fs from 'fs'

import * as pokemonImage from './pokemonImage';
import * as httpUtils from '../utils/http';
import { createCacheFolders } from '../utils/filesystem';

const CACHED_POKEMON_ID = '9999';
const NOT_CACHED_POKEMON_ID = '7777';
const NEW_CACHED_POKEMON_ID = '55555';
const BASE_CACHE_PATH = './cache';
const CACHE_PATH = `${BASE_CACHE_PATH}/pokemon`;
const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon';
const IMAGE_PROPS = {
  id: NOT_CACHED_POKEMON_ID,
  filePath: `${CACHE_PATH}/${NOT_CACHED_POKEMON_ID}`,
};
const POKEMON_API_RESPONSE = {
  sprites: {
    front_default: 'https://pokeapi.co/api/v2/pokemon/',
  },
};
const POKEMON_USECASE_PROPS = {
  apiUrl: POKEMON_API_URL,
  cacheFolder: CACHE_PATH,
}

beforeAll(async () => {
  createCacheFolders([BASE_CACHE_PATH, CACHE_PATH]);
  await writeFile(`${CACHE_PATH}/${CACHED_POKEMON_ID}`, 'EMPTY_FILE');
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await rm(CACHE_PATH, { recursive: true, force: true });
});

describe('Pokemon image usecase', () => {
  describe('When trying to get pokemon image properties', () => {
    const { getPokemonImageProps } = pokemonImage;

    it('uses cache when using existing image and skips external API call', async () => {
      const usecaseProps = {
        ...POKEMON_USECASE_PROPS,
        id: CACHED_POKEMON_ID,
      }
      const imagePropsUsingApiSpy = jest.spyOn(pokemonImage, 'getPokemonImagePropsUsingApi');
      await getPokemonImageProps(usecaseProps);

      expect(imagePropsUsingApiSpy).not.toHaveBeenCalled();
    });

    it('tries to get pokemon image properties using external API', async () => {
      const usecaseProps = {
        ...POKEMON_USECASE_PROPS,
        id: NOT_CACHED_POKEMON_ID,
      }
      const imagePropsUsingApiSpy = jest.spyOn(pokemonImage, 'getPokemonImagePropsUsingApi').mockResolvedValueOnce(IMAGE_PROPS);

      await getPokemonImageProps(usecaseProps);

      expect(imagePropsUsingApiSpy).toHaveBeenCalledWith(usecaseProps);
    });
  });

  describe('When trying to get pokemon image properties using external API', () => {
    const usecaseProps = {
      ...POKEMON_USECASE_PROPS,
      id: NEW_CACHED_POKEMON_ID,
    }

    it('writes new file to the cache after fetching it using pokemon API', async () => {
      const { getPokemonImagePropsUsingApi } = pokemonImage;

      jest.spyOn(httpUtils, 'getRequest')
          .mockResolvedValueOnce(POKEMON_API_RESPONSE)
          .mockResolvedValueOnce(Buffer.from('EMPTY_FILE'));

      await getPokemonImagePropsUsingApi(usecaseProps);

      expect(fs.existsSync(`${CACHE_PATH}/${NEW_CACHED_POKEMON_ID}`)).toBeTruthy();
    });

    it('handles async requests failures gracefully', async () => {
      const { getPokemonImagePropsUsingApi } = pokemonImage;

      jest.spyOn(httpUtils, 'getRequest')
          .mockResolvedValueOnce(POKEMON_API_RESPONSE)
          .mockRejectedValueOnce({message: 'Service Unavailable'});

      await expect(getPokemonImagePropsUsingApi(usecaseProps)).rejects.toThrow('Service Unavailable');
    });
  });
});
