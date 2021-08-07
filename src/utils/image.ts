import sharp from 'sharp';

const getImageHeight = async (image: Buffer) => {
  try {
    const imageMetadata = await sharp(image).metadata();

    if (imageMetadata.height === undefined) {
      console.debug('Error: Failed to get image metadata');

      throw new Error('Unprocessable image');
    }

    return imageMetadata.height
  } catch (error) {
    console.debug('Error: Failed to merge images');

    throw new Error(error.message);
  }
}

export const overlayImages = async (backGroundImage: Buffer, secondaryImage: Buffer) => {
  const backGroundImageHeight = await getImageHeight(backGroundImage)

  try {
    // Sharp cannot work with floats for height in pixels, rounding value
    const secondaryImageHeight = Math.round(backGroundImageHeight / 5);

    const secondaryImageResized = await sharp(secondaryImage)
      .resize(undefined, secondaryImageHeight)
      .toBuffer();

    const mergedImage = await sharp(backGroundImage)
      .composite([{ input: secondaryImageResized, gravity: 'southwest' }])
      .toFormat('png')
      .toBuffer();

    return mergedImage;
  } catch (error) {
    console.debug('Error: Failed to merge images');

    throw new Error(error.message);
  }
};
