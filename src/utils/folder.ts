import fs from 'fs';

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
  // TODO: implement cache for cats and overlays
  createFolder('./cache/cats')
  createFolder('./cache/overlays')
}
