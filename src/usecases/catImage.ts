import { getRequest } from '../utils/http';

// Partial response from the cat API, full object available in docs
// Ref: https://docs.thecatapi.com/api-reference/images/images-search
type CatApiResponse = {
  url: string,
}[]

export const getCatImage = async (catImageApiUrl: string) => {
  try {
    // Image url comes inside the first Array object of the JSON response
    // Ref: https://docs.thecatapi.com/
    const [catData] = await getRequest(catImageApiUrl) as CatApiResponse;
    const catImage = await getRequest(catData.url) as Buffer;

    return catImage
  } catch (error) {
    console.debug('Error: Failed to get cat image');

    throw new Error(error.message);
  }
};
