import { writeFile } from 'fs/promises'
import { ImageProps, ImageUsecaseProps, QuotaProps } from '../types';

import { getFilesInFolder } from '../utils/filesystem';
import { getRequest } from '../utils/http';
import { logger } from '../utils/log';
import { isQuotaExceeded } from '../utils/quota';

const log = logger('Cat image usecase');

// Partial response from the cat API, full object available in docs
// Ref: https://docs.thecatapi.com/api-reference/images/images-search
type CatApiResponse = {
  url: string,
  id: string,
}[]

export const getCatImageProps = async (usecaseProps: ImageUsecaseProps, quotaProps: QuotaProps): Promise<ImageProps> => {
  let cachedImageProps: ImageProps | undefined;
  const filenames = await getFilesInFolder(usecaseProps.cacheFolder);

  if (filenames.length) {
    const shouldUseCache = await isQuotaExceeded(quotaProps, filenames)
    const randomCatIndex = Math.floor(Math.random() * filenames.length);
    const randomCatFilename = filenames[randomCatIndex];
    const randomCatId = randomCatFilename.substring(randomCatFilename.indexOf("-") + 1);
    cachedImageProps = {
      filePath: `${usecaseProps.cacheFolder}/${filenames[randomCatIndex]}`,
      id: randomCatId,
    };

    if(shouldUseCache) {
      log.info('Quota limit exceeded, using a random cat image from cache...');

      return cachedImageProps
    }
  }

  return getCatImagePropsUsingApi(usecaseProps, quotaProps.executionTimestamp, cachedImageProps);
};

export const getCatImagePropsUsingApi = async (usecaseProps: ImageUsecaseProps, timestamp: number, cachedImageProps?: ImageProps): Promise<ImageProps> => {
  try {
    // Image url comes inside the first Array object of the JSON response
    // Ref: https://docs.thecatapi.com/
    const [catData] = await getRequest(usecaseProps.apiUrl) as CatApiResponse;
    const catImage = await getRequest(catData.url) as Buffer;
    const filePath = `${usecaseProps.cacheFolder}/${timestamp}-${catData.id}`

    await writeFile(filePath, catImage);

    return {
      filePath,
      id: catData.id,
    };
  } catch (error) {
    if (cachedImageProps !== undefined) {
      log.warn('Failed to get image from API, using existing image', error.message);

      return cachedImageProps;
    }

    log.error('Failed to get image from API and no cached image availble');

    throw new Error(error.message)
  }
};
