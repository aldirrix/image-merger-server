import sharp from 'sharp';
import fs from 'fs';

import { ImageProps } from '../types';
import { readFileFromPath } from './folder';
import { logger } from './log';

const log = logger('Image utils');

const getImageHeight = async (image: Buffer): Promise<number> => {
  try {
    const imageMetadata = await sharp(image).metadata();

    if (imageMetadata.height === undefined) {
      log.error('Failed to get image metadata');

      throw new Error('Unprocessable image');
    }

    return imageMetadata.height
  } catch (error) {
    log.error('Failed to get image height');

    throw new Error(error.message);
  }
}

export const overlayImages = async (backGroundImageProps: ImageProps, secondaryImageProps: ImageProps): Promise<string> => {
  const backGroundImage = await readFileFromPath(backGroundImageProps.filePath)
  const secondaryImage = await readFileFromPath(secondaryImageProps.filePath)
  const backGroundImageHeight = await getImageHeight(backGroundImage)
  const overlayedImagePath = `./cache/overlays/${backGroundImageProps.id}-${secondaryImageProps.id}.png`

  if (fs.existsSync(overlayedImagePath)) {
    log.debug(`Cache hit for overlayed image`);

    return overlayedImagePath
  }

  try {
    // Sharp cannot work with floats for values in pixels, rounding value
    const secondaryImageHeight = Math.round(backGroundImageHeight / 5);

    const secondaryImageResized = await sharp(secondaryImage)
      .resize(undefined, secondaryImageHeight)
      .toBuffer();

    await sharp(backGroundImage)
      .composite([{ input: secondaryImageResized, gravity: 'southwest' }])
      .toFormat('png')
      .toFile(overlayedImagePath);

    return overlayedImagePath;
  } catch (error) {
    log.error('Failed to merge images');

    throw new Error(error.message);
  }
};
