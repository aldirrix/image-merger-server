import fs from 'fs';
import { readdir, readFile } from 'fs/promises';

import { logger } from './log';

const log = logger('Folder utils');

const createFolder = (folderName: string) => {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName)
    }
  } catch (error) {
    log.error("Failed to create cache folders")

    throw new Error(error.message)
  }
}

export const createCacheFolders = () => {
  createFolder('./cache')
  createFolder('./cache/pokemon')
  createFolder('./cache/cats')
  createFolder('./cache/overlays')
}

export const getFilesInFolder = (folderName: string) => readdir(folderName);
export const readFileFromPath = (filePath: string) => readFile(filePath)
