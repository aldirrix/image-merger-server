import { Request, Response } from 'express';

import { getCatImageProps } from '../usecases/catImage';
import { getPokemonImageProps } from '../usecases/pokemonImage';
import { overlayImages } from '../utils/image';
import { config } from '../config';
import { logger } from '../utils/log';
import { getNumericValue } from '../utils/values';
import { handleError } from '../utils/error';

const log = logger('Cat with Pokemon handler');
const {
  catImageApiUrl,
  pokemonImageApiUrl,
  catImageCacheFolder,
  catImageTimeReference,
  catImageMaxRequests,
  overlayImageCacheFolder,
  pokemonImageCacheFolder,
} = config;

export const catWithPokemonHandler = async (req: Request<{pokemonId: string}>, res: Response) => {
  const { maxWidth, maxHeight } = req.query

  const catImageQuotaProps = {
    executionTimestamp: Date.now(),
    timeReferenceMs: catImageTimeReference,
    maxRequests: catImageMaxRequests,
  }
  const catImageUsecaseProps = { apiUrl: catImageApiUrl, cacheFolder: catImageCacheFolder }
  const pokemonImageUsecaseProps = {
    apiUrl: pokemonImageApiUrl,
    cacheFolder: pokemonImageCacheFolder,
    id: req.params.pokemonId
  };
  const overlayImageProps = {
    cacheFolder: overlayImageCacheFolder,
    maxImageWidth: getNumericValue(maxWidth),
    maxImageHeight: getNumericValue(maxHeight),
  }

  try {
    const imagePromises = [
      getCatImageProps(catImageUsecaseProps, catImageQuotaProps),
      getPokemonImageProps(pokemonImageUsecaseProps)
    ];

    const [catImageProps, pokemonImageProps] = await Promise.all(imagePromises)

    const catWithPokemonImage = await overlayImages(catImageProps, pokemonImageProps, overlayImageProps);

    return res.sendFile(catWithPokemonImage, { root: '.' });
  } catch (error) {
    const { code, message } = handleError(error)

    log.error(error.message);

    return res.status(code).send(message);
  }
};
