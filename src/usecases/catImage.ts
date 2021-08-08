import { writeFile } from 'fs/promises'
import { ImageProps } from '../types';

import { getFilesInFolder } from '../utils/folder';
import { getRequest } from '../utils/http';

// Partial response from the cat API, full object available in docs
// Ref: https://docs.thecatapi.com/api-reference/images/images-search
type CatApiResponse = {
  url: string,
  id: string,
}[]

const ONE_MINUTE_MS = 60000;

export const getCatImageProps = async (catImageApiUrl: string): Promise<ImageProps> => {
  let cachedImageProps: ImageProps | undefined;

  try {
    const executionTimestamp = Date.now();
    const filenames = await getFilesInFolder('./cache/cats');

    // Files are saved in the format TIMESTAMP-ID so slicing the last (-N) will
    // always result in the most recent files, the 1st element being the oldest
    const mostRecentFilenames = filenames.slice(-10);

    if (mostRecentFilenames[0] !== undefined) {
      // TODO: Extract quota logic to be reusable and dynamic
      const oldestFileCreationTimestamp = Number(mostRecentFilenames[0].split('-')[0]);
      const isOldestFileWithinInterval = oldestFileCreationTimestamp > (executionTimestamp - ONE_MINUTE_MS);
      const isQuotaExceeded = mostRecentFilenames.length >= 10 && isOldestFileWithinInterval;
      const randomCatIndex = Math.floor(Math.random() * filenames.length);
      const randomCatFilename = filenames[randomCatIndex];
      const randomCatId = randomCatFilename.substring(randomCatFilename.indexOf("-") + 1);
      cachedImageProps = {
        filePath: `./cache/cats/${filenames[randomCatIndex]}`,
        id: randomCatId,
      };

      if(isQuotaExceeded) {
        console.debug('Info: Quota limit exceeded, using a random cat image from cache...');

        return cachedImageProps
      }
    }

    return getCatImagePropsUsingApi(catImageApiUrl, executionTimestamp, cachedImageProps);
  } catch (error) {
    console.debug('Error: Failed to get cat image');

    throw new Error(error.message);
  }
};

const getCatImagePropsUsingApi = async (catImageApiUrl: string, timestamp: number, cachedImageProps?: ImageProps): Promise<ImageProps> => {
  try {
    // Image url comes inside the first Array object of the JSON response
    // Ref: https://docs.thecatapi.com/
    const [catData] = await getRequest(catImageApiUrl) as CatApiResponse;
    const catImage = await getRequest(catData.url) as Buffer;
    const filePath = `./cache/cats/${timestamp}-${catData.id}`

    await writeFile(filePath, catImage);

    return {
      filePath,
      id: catData.id,
    };
  } catch (error) {
    if (cachedImageProps !== undefined) {
      console.debug('Error: Failed to get image from API, using existing image', error.message);

      return cachedImageProps;
    }

    throw new Error(error.message)
  }
};
