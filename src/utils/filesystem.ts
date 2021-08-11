import fs from 'fs';
import { readdir } from 'fs/promises';

import { logger } from './log';

const log = logger('Folder utils');

export const createFolder = (folderName: string): void => {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (error) {
    log.error(`Failed to create folder ${folderName}`);

    throw new Error(error.message);
  }
};

export const createCacheFolders = (folderNames: string[]): void => {
  folderNames.forEach((folderName) => createFolder(folderName));
};

export const getFilesInFolder = (folderName: string): Promise<string[]> => readdir(folderName);
