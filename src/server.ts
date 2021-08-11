import express from 'express';

import { catWithPokemonHandler } from './handlers/catWithPokemon';
import { createCacheFolders } from './utils/filesystem';
import { config } from './config';
import { logger } from './utils/log';

const log = logger('Server');

const app = express();
const port = 8080;

createCacheFolders(config.cacheFoldernames);

app.listen(port, () => {
  log.info(`Server running on port: ${port}.`);
});

app.get('/api/cat-pokemon/:pokemonId', catWithPokemonHandler);
