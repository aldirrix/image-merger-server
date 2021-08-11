import { writeFile, rm } from 'fs/promises';
import fs from 'fs';

import * as catImage from './catImage';
import * as httpUtils from '../utils/http';
import { createCacheFolders } from '../utils/filesystem';

const generateRandomString = () => Math.random().toString(36).substring(2, 5);

const EXECUTION_TIMESTAMP = Date.now();
const IMAGE_ID = generateRandomString();
const BASE_CACHE_PATH = './cache';
const CACHE_PATH = `${BASE_CACHE_PATH}/cats`;
const CAT_API_URL = 'https://api.thecatapi.com/v1/images/search?mime_types=png';
const IMAGE_PROPS = {
  id: IMAGE_ID,
  filePath: `${CACHE_PATH}/${EXECUTION_TIMESTAMP}-${IMAGE_ID}`,
};
const CAT_API_RESPONSE = [
  {
    url: 'https://cdn2.thecatapi.com/images/abcde.png',
    id: 'abcde',
  },
];
const CAT_QUOTA_PROPERTIES = {
  executionTimestamp: EXECUTION_TIMESTAMP,
  timeReferenceMs: 60000,
  maxRequests: 10,
  referenceFolder: CACHE_PATH,
};
const CAT_USECASE_PROPS = {
  apiUrl: CAT_API_URL,
  cacheFolder: CACHE_PATH,
};

beforeAll(async () => {
  await rm(CACHE_PATH, { recursive: true, force: true });
  createCacheFolders([BASE_CACHE_PATH, CACHE_PATH]);
});

afterEach(async () => {
  await rm(CACHE_PATH, { recursive: true, force: true });
  createCacheFolders([BASE_CACHE_PATH, CACHE_PATH]);
  jest.restoreAllMocks();
});

afterAll(async () => {
  await rm(CACHE_PATH, { recursive: true, force: true });
});

describe('Cat image usecase', () => {
  describe('When trying to get cat image properties', () => {
    const { getCatImageProps } = catImage;

    describe('When cache folder is empty', () => {
      it('tries to get cat image properties using external API and no fallback image is provided', async () => {
        const imagePropsUsingApiSpy = jest
          .spyOn(catImage, 'getCatImagePropsUsingApi')
          .mockResolvedValueOnce(IMAGE_PROPS);

        await getCatImageProps(CAT_USECASE_PROPS, CAT_QUOTA_PROPERTIES);

        expect(imagePropsUsingApiSpy).toHaveBeenCalledWith(CAT_USECASE_PROPS, expect.any(Number), undefined);
      });
    });

    describe('When cache folder is not empty', () => {
      it('uses cache when request quota is exceeded and skips external API call', async () => {
        const writeFilePromises = [...Array(10).keys()].map(() =>
          writeFile(`${CACHE_PATH}/${EXECUTION_TIMESTAMP}-${generateRandomString()}`, 'EMPTY_FILE')
        );

        await Promise.all(writeFilePromises);

        const imagePropsUsingApiSpy = jest.spyOn(catImage, 'getCatImagePropsUsingApi');
        await getCatImageProps(CAT_USECASE_PROPS, CAT_QUOTA_PROPERTIES);

        expect(imagePropsUsingApiSpy).not.toHaveBeenCalled();
      });
    });

    it('tries to get cat image properties using external API when quota is not exceeded and fallback image provided', async () => {
      const writeFilePromises = [...Array(9).keys()].map(() =>
        writeFile(`${CACHE_PATH}/${EXECUTION_TIMESTAMP}-${generateRandomString()}`, 'EMPTY_FILE')
      );

      await Promise.all(writeFilePromises);

      const imagePropsUsingApiSpy = jest.spyOn(catImage, 'getCatImagePropsUsingApi').mockResolvedValueOnce(IMAGE_PROPS);
      await getCatImageProps(CAT_USECASE_PROPS, CAT_QUOTA_PROPERTIES);

      expect(imagePropsUsingApiSpy).toHaveBeenCalledWith(CAT_USECASE_PROPS, expect.any(Number), expect.any(Object));
    });
  });

  describe('When trying to get cat image properties using external API', () => {
    it('writes new file to the cache after fetching it using cat API', async () => {
      const { getCatImagePropsUsingApi } = catImage;

      jest
        .spyOn(httpUtils, 'getRequest')
        .mockResolvedValueOnce(CAT_API_RESPONSE)
        .mockResolvedValueOnce(Buffer.from('EMPTY_FILE'));

      await getCatImagePropsUsingApi(CAT_USECASE_PROPS, EXECUTION_TIMESTAMP);

      expect(fs.existsSync(`${CACHE_PATH}/${EXECUTION_TIMESTAMP}-abcde`)).toBeTruthy();
    });

    it('uses fallback image when async requests fail when provided', async () => {
      const { getCatImagePropsUsingApi } = catImage;

      jest
        .spyOn(httpUtils, 'getRequest')
        .mockResolvedValueOnce(CAT_API_RESPONSE)
        .mockRejectedValueOnce({ message: 'Service Unavailable' });

      await expect(
        getCatImagePropsUsingApi(CAT_USECASE_PROPS, EXECUTION_TIMESTAMP, IMAGE_PROPS)
      ).resolves.toMatchObject(IMAGE_PROPS);
    });

    it('handles async requests failures gracefully ', async () => {
      const { getCatImagePropsUsingApi } = catImage;

      jest
        .spyOn(httpUtils, 'getRequest')
        .mockResolvedValueOnce(CAT_API_RESPONSE)
        .mockRejectedValueOnce({ message: 'Service Unavailable' });

      await expect(getCatImagePropsUsingApi(CAT_USECASE_PROPS, EXECUTION_TIMESTAMP)).rejects.toThrow(
        'Service Unavailable'
      );
    });
  });
});
