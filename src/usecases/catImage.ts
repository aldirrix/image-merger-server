import { writeFile } from 'fs/promises'

import { readFileFromFolder, getFilesInFolder } from '../utils/folder';
import { getRequest } from '../utils/http';

// Partial response from the cat API, full object available in docs
// Ref: https://docs.thecatapi.com/api-reference/images/images-search
type CatApiResponse = {
  url: string,
  id: string,
}[]

const ONE_MINUTE_MS = 60000;

export const getCatImage = async (catImageApiUrl: string) => {
  try {
    const executionTimestamp = Date.now();
    const filenames = await getFilesInFolder('./cache/cats');

    // Files are saved in the format TIMESTAMP-ID so slicing the last (-N) will
    // always result in the most recent files, the 1st element being the oldest
    const mostRecentFilenames = filenames.slice(-10);
    const oldestFileCreationTimestamp = Number(mostRecentFilenames[0].split('-')[0]);
    const isOldestFileWithinInterval = oldestFileCreationTimestamp > (executionTimestamp - ONE_MINUTE_MS);

    // TODO: Extract quota logic to be reusable and dynamic
    const isQuotaExceeded = mostRecentFilenames.length >= 10 && isOldestFileWithinInterval;

    const randomCatIndex = Math.floor(Math.random() * filenames.length);
    const fallbackFilePath = `./cache/cats/${filenames[randomCatIndex]}`;

    if(isQuotaExceeded) {
      console.debug('Info: Quota limit exceeded, using a random cat image from cache...');

      return readFileFromFolder(fallbackFilePath);
    }

    return getCatImageFromApi(catImageApiUrl, executionTimestamp, fallbackFilePath);
  } catch (error) {
    console.debug('Error: Failed to get cat image');

    throw new Error(error.message);
  }
};

const getCatImageFromApi = async (catImageApiUrl: string, timestamp: number, fallbackFilePath: string) => {
  try {
    // Image url comes inside the first Array object of the JSON response
    // Ref: https://docs.thecatapi.com/
    const [catData] = await getRequest(catImageApiUrl) as CatApiResponse;
    const catImage = await getRequest(catData.url) as Buffer;

    await writeFile(`./cache/cats/${timestamp}-${catData.id}`, catImage);

    return catImage
  } catch (error) {
    console.debug('Error: Failed to get image from API, using existing image', error.message);

    return readFileFromFolder(fallbackFilePath);
  }
};
