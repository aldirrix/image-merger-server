import fs from 'fs';
import { readdir, readFile } from 'fs/promises';

const createFolder = (folderName: string) => {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName)
    }
  } catch (error) {
    console.debug("Error: Failed to create cache folders")

    throw new Error(error.message)
  }
}



export const createCacheFolders = () => {
  createFolder('./cache')
  createFolder('./cache/pokemon')
  createFolder('./cache/cats')
  // TODO: implement cache for overlays
  createFolder('./cache/overlays')
}

export const getFilesInFolder = (folderName: string) => readdir(folderName);
export const readFileFromFolder = (filePath: string) => readFile(filePath)
