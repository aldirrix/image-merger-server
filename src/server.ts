import express from 'express';

import { catWithPokemonHandler } from './handlers/catWithPokemon';

const app = express();
const port = 8080;

app.listen(port, () => {
  console.log(`Server running on port: ${port}.`);
});

app.get('/api/cat-pokemon/:pokemonId', catWithPokemonHandler);
