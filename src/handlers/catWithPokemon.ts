import { Request, Response } from 'express';

import { getCatImageProps } from '../usecases/catImage';
import { getPokemonImageProps } from '../usecases/pokemonImage';
import { overlayImages } from '../utils/image';
import { config } from '../config';
import { logger } from '../utils/log';

const log = logger('Cat with Pokemon handler');
const {
  catImageApiUrl,
  pokemonImageApiUrl,
  catImageCacheFolder,
  catImageTimeReference,
  catImageMaxRequests,
  overlayImageCacheFolder
} = config;

export const catWithPokemonHandler = async (req: Request<{pokemonId: string}>, res: Response) => {
  const catImageQuotaProps = {
    executionTimestamp: Date.now(),
    timeReferenceMs: catImageTimeReference,
    maxRequests: catImageMaxRequests,
  }
  const catImageUsecaseProps = { apiUrl: catImageApiUrl, cacheFolder: catImageCacheFolder }
  const pokemonImageUsecaseProps = {
    apiUrl: pokemonImageApiUrl,
    cacheFolder: catImageCacheFolder,
    id: req.params.pokemonId
  }

  try {
    const imagePromises = [
      getCatImageProps(catImageUsecaseProps, catImageQuotaProps),
      getPokemonImageProps(pokemonImageUsecaseProps)
    ];

    const [catImageProps, pokemonImageProps] = await Promise.all(imagePromises)

    const catWithPokemonImage = await overlayImages(catImageProps, pokemonImageProps, overlayImageCacheFolder);

    return res.sendFile(catWithPokemonImage, { root: '.' });
  } catch (error) {
    log.error(error.message);

    return res.status(500).send('Internal server error');
  }
};
