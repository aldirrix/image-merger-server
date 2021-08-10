import fs from 'fs';
import { readdir } from 'fs/promises';

import { logger } from './log';

const log = logger('Folder utils');

export const createFolder = (folderName: string) => {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName)
    }
  } catch (error) {
    log.error(`Failed to create folder ${folderName}`)

    throw new Error(error.message)
  }
}

export const createCacheFolders = (folderNames: string[]) => {
  folderNames.forEach((folderName) => createFolder(folderName))
};

export const getFilesInFolder = (folderName: string) => readdir(folderName);
