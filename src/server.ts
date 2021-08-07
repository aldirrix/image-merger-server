import express from 'express';

import { catWithPokemonHandler } from './handlers/catWithPokemon';
import { createCacheFolders } from './utils/folder';

const app = express();
const port = 8080;

createCacheFolders()

app.listen(port, () => {
  console.log(`Server running on port: ${port}.`);
});

app.get('/api/cat-pokemon/:pokemonId', catWithPokemonHandler);
