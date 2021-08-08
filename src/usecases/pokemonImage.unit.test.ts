import { writeFile, rm } from 'fs/promises'
import fs from 'fs'

import * as pokemonImage from './pokemonImage';
import * as httpUtils from '../utils/http';
import { createCacheFolders } from '../utils/folder';

const CACHED_POKEMON_ID = '9999';
const NOT_CACHED_POKEMON_ID = '7777';
const NEW_CACHED_POKEMON_ID = '55555';
const CACHE_PATH = './cache/pokemon';
const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon';
const IMAGE_PROPS = {
  id: NOT_CACHED_POKEMON_ID,
  filePath: `${CACHE_PATH}/${NOT_CACHED_POKEMON_ID}`,
};
const POKEMON_API_RESPONSE = {
  sprites: {
    front_default: 'https://pokeapi.co/api/v2/pokemon',
  },
};

beforeAll(async () => {
  createCacheFolders();
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
      const imagePropsUsingApiSpy = jest.spyOn(pokemonImage, 'getPokemonImagePropsUsingApi');
      await getPokemonImageProps(CACHED_POKEMON_ID, POKEMON_API_URL);

      expect(imagePropsUsingApiSpy).not.toHaveBeenCalled();
    });

    it('tries to get pokemon image properties using external API', async () => {
      const imagePropsUsingApiSpy = jest.spyOn(pokemonImage, 'getPokemonImagePropsUsingApi').mockResolvedValueOnce(IMAGE_PROPS);

      await getPokemonImageProps(NOT_CACHED_POKEMON_ID, POKEMON_API_URL);

      expect(imagePropsUsingApiSpy).toHaveBeenCalledWith(NOT_CACHED_POKEMON_ID, POKEMON_API_URL);
    });
  });

  describe('When trying to get pokemon image properties using external API', () => {
    it('writes new file to the cache after fetching it using pokemon API', async () => {
      const { getPokemonImagePropsUsingApi } = pokemonImage;

      jest.spyOn(httpUtils, 'getRequest')
          .mockResolvedValueOnce(POKEMON_API_RESPONSE)
          .mockResolvedValueOnce(Buffer.from('EMPTY_FILE'));

      await getPokemonImagePropsUsingApi(NEW_CACHED_POKEMON_ID, POKEMON_API_URL);

      expect(fs.existsSync(`${CACHE_PATH}/${NEW_CACHED_POKEMON_ID}`)).toBeTruthy();
    });

    it('handles async requests failures gracefully', async () => {
      const { getPokemonImagePropsUsingApi } = pokemonImage;

      jest.spyOn(httpUtils, 'getRequest')
          .mockResolvedValueOnce(POKEMON_API_RESPONSE)
          .mockRejectedValueOnce({message: 'Service Unavailable'});

      await expect(getPokemonImagePropsUsingApi(NEW_CACHED_POKEMON_ID, POKEMON_API_URL)).rejects.toThrow('Service Unavailable');
    });
  });
});
