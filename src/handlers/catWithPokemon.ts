import { Request, Response } from 'express';

import { getCatImageProps } from '../usecases/catImage';
import { getPokemonImageProps } from '../usecases/pokemonImage';
import { overlayImages } from '../utils/image';
import { config } from '../config';

export const catWithPokemonHandler = async (req: Request<{pokemonId: string}>, res: Response) => {
  const { catImageApiUrl, pokemonImageApiUrl } = config;

  try {
    const catImageProps = await getCatImageProps(catImageApiUrl);
    const pokemonImageProps = await getPokemonImageProps(req.params.pokemonId, pokemonImageApiUrl);

    const catWithPokemonImage = await overlayImages(catImageProps, pokemonImageProps);

    return res.sendFile(catWithPokemonImage, { root: '.' });
  } catch (error) {
    console.error(error.message);

    return res.status(500).send('Internal server error');
  }
};
