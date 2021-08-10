import sharp from 'sharp';
import fs from 'fs';

import { ImageProps } from '../types';
import { logger } from './log';

const log = logger('Image utils');

type OverlayImagesProps = {
  cacheFolder: string,
  maxImageWidth?: number,
  maxImageHeight?: number,
}

type AdjustImageDimensionsProps = {
  filePath: string,
  maxImageWidth?: number,
  maxImageHeight?: number,
}

type ImageDimensions = {
  width: number,
  height: number,
}

export const getImageMetadata = (imagePath: string): Promise<sharp.Metadata> => sharp(imagePath).metadata();

export const getImageDimensions = async (imagePath: string): Promise<ImageDimensions> => {
  try {
    const imageMetadata = await getImageMetadata(imagePath);

    if (imageMetadata.height === undefined || imageMetadata.width === undefined) {
      throw new Error('Unprocessable image');
    }

    return {
      width: imageMetadata.width,
      height: imageMetadata.height,
    }
  } catch (error) {
    log.error('Failed to get image dimensions');

    throw new Error(error.message);
  }
}

export const getImageHeight = async (imagePath: string): Promise<number> => {
  try {
    const imageMetadata = await getImageMetadata(imagePath);

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

export const overlayImages = async (backGroundImageProps: ImageProps, secondaryImageProps: ImageProps, overlayImagesProps: OverlayImagesProps): Promise<string> => {
  const { maxImageWidth, maxImageHeight, cacheFolder } = overlayImagesProps;
  const overlayedImagePath = `${cacheFolder}/${backGroundImageProps.id}-${secondaryImageProps.id}.png`

  if (fs.existsSync(overlayedImagePath)) {
    log.debug(`Cache hit for overlayed image`);
  } else {
    try {
      const backGroundImageHeight = await getImageHeight(backGroundImageProps.filePath)

      // Sharp cannot work with floats for values in pixels, rounding value
      const secondaryImageHeight = Math.round(backGroundImageHeight / 5);

      const secondaryImageResized = await sharp(secondaryImageProps.filePath)
        .resize(undefined, secondaryImageHeight)
        .toBuffer();

      await sharp(backGroundImageProps.filePath)
        .composite([{ input: secondaryImageResized, gravity: 'southwest' }])
        .toFormat('png')
        .toFile(overlayedImagePath);
    } catch (error) {
      log.error('Failed to merge images');

      throw new Error(error.message);
    }
  }

  return adjustImageDimensions({ maxImageWidth, maxImageHeight, filePath: overlayedImagePath })
};

export const adjustImageDimensions = async (adjustImageDimensionsProps: AdjustImageDimensionsProps): Promise<string> => {
  const { maxImageWidth, maxImageHeight, filePath } = adjustImageDimensionsProps;

  if (maxImageWidth !== undefined || maxImageHeight !== undefined) {
    const imageDimensions = await getImageDimensions(filePath);

    // Get a ratio for the width and height of the max dimension agains the
    // current image dimensions, if ratio > 1 use max ratio 1 to keep original
    // size, this will guarantee that max size will not be exceeded ever
    const widthRatio = maxImageWidth ?  maxImageWidth / imageDimensions.width : 1;
    const heightRatio = maxImageHeight ?  maxImageHeight / imageDimensions.height : 1;
    const maxRatio = Math.min(widthRatio, heightRatio);

    if (maxRatio >= 1) {
      log.debug('Image already smaller than max size, using original')
    } else {
      const newWidth = Math.floor(imageDimensions.width * maxRatio);
      const newHeight = Math.floor(imageDimensions.height * maxRatio);

      // Create new filename using filename without extension, concat dimensions
      const resizedFilePath = `${filePath.slice(0, -4)}-${newWidth}x${newHeight}.png`;

      if (fs.existsSync(resizedFilePath)) {
        log.debug(`Cache hit for resized overlayed image`);
      } else {
        await sharp(filePath)
          .resize(newWidth, newHeight)
          .toFile(resizedFilePath);
      }

      return resizedFilePath;
    }
  }

  return filePath;
}
