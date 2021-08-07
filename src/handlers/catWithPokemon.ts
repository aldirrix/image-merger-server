import { Request, Response } from 'express';

import { getCatImage } from '../usecases/catImage';
import { getPokemonImageFromId } from '../usecases/pokemonImage';
import { overlayImages } from '../utils/image';
import { config } from '../config';

export const catWithPokemonHandler = async (req: Request<{pokemonId: string}>, res: Response) => {
  const { catImageApiUrl, pokemonImageApiUrl } = config;

  try {
    const catImage = await getCatImage(catImageApiUrl);
    const pokemonImage = await getPokemonImageFromId(req.params.pokemonId, pokemonImageApiUrl);

    const catWithPokemonImage = await overlayImages(catImage, pokemonImage);

    return res.send(catWithPokemonImage);
  } catch (error) {
    console.error(error.message);

    return res.status(500).send('Internal server error');
  }
};
