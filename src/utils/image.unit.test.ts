import { rm, writeFile } from 'fs/promises';
import { createCacheFolders } from './filesystem';

import * as imageHelper from './image';

const BASE_CACHE_PATH = './cache';
const CACHE_PATH = `${BASE_CACHE_PATH}/overlays`;
const IMAGE_METADATA = { width: 100, height: 200, chromaSubsampling: '' };
const INCOMPLETE_IMAGE_METADATA = { width: 100, chromaSubsampling: '' };
const IMAGE_PROPS = { filePath: `${CACHE_PATH}/id`, id: 'id' };
const ADJUST_IMAGE_PROPS = { filePath: `${CACHE_PATH}/image.png`, maxImageWidth: 400, maxImageHeight: 500 };

jest.mock('sharp', () => () => ({
  resize: jest.fn().mockReturnThis(),
  composite: jest.fn().mockReturnThis(),
  toFormat: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockReturnThis(),
  toFile: jest.fn().mockReturnThis(),
}));

beforeAll(async () => {
  await rm(CACHE_PATH, { recursive: true, force: true });
  createCacheFolders([BASE_CACHE_PATH, CACHE_PATH]);
});

afterEach(async () => {
  await rm(CACHE_PATH, { recursive: true, force: true });
  createCacheFolders([BASE_CACHE_PATH, CACHE_PATH]);
  jest.restoreAllMocks();
});

afterAll(async () => {
  await rm(CACHE_PATH, { recursive: true, force: true });
});

describe('Image helper', () => {
  describe('When trying to get image dimensions', () => {
    it('returns object with height and width of image', async () => {
      jest.spyOn(imageHelper, 'getImageMetadata').mockResolvedValueOnce(IMAGE_METADATA);
      const imageDimensions = await imageHelper.getImageDimensions('image.png');

      expect(imageDimensions).toMatchObject({ width: 100, height: 200 });
    });

    it('handles unprocessable image when no width or height is found in metadata', async () => {
      jest.spyOn(imageHelper, 'getImageMetadata').mockResolvedValueOnce(INCOMPLETE_IMAGE_METADATA);

      await expect(imageHelper.getImageDimensions('image.png')).rejects.toThrow('Unprocessable image');
    });

    it('handles metadata get promise failure', async () => {
      jest.spyOn(imageHelper, 'getImageMetadata').mockRejectedValueOnce({ message: 'Metadata get failed' });

      await expect(imageHelper.getImageDimensions('image.png')).rejects.toThrow('Metadata get failed');
    });
  });

  describe('When trying to get image height', () => {
    it('returns object with height in pixels of image', async () => {
      jest.spyOn(imageHelper, 'getImageMetadata').mockResolvedValueOnce(IMAGE_METADATA);
      const imageHeight = await imageHelper.getImageHeight('image.png');

      expect(imageHeight).toBe(200);
    });

    it('handles unprocessable image when no height is found in metadata', async () => {
      jest.spyOn(imageHelper, 'getImageMetadata').mockResolvedValueOnce(INCOMPLETE_IMAGE_METADATA);

      await expect(imageHelper.getImageHeight('image.png')).rejects.toThrow('Unprocessable image');
    });

    it('handles metadata get promise failure', async () => {
      jest.spyOn(imageHelper, 'getImageMetadata').mockRejectedValueOnce({ message: 'Metadata get failed' });

      await expect(imageHelper.getImageHeight('image.png')).rejects.toThrow('Metadata get failed');
    });
  });

  describe('When trying to get overlay two images', () => {
    describe('And image is found in cache', () => {
      it('returns file path of overlayed image when found in cache, skips any image processing execution', async () => {
        const overlayedImagePath = `${CACHE_PATH}/${IMAGE_PROPS.id}-${IMAGE_PROPS.id}.png`;
        const getImageMetadataSpy = jest.spyOn(imageHelper, 'getImageMetadata');

        await writeFile(overlayedImagePath, 'EMPTY_FILE');
        const cachedImagePath = await imageHelper.overlayImages(IMAGE_PROPS, IMAGE_PROPS, { cacheFolder: CACHE_PATH });

        expect(getImageMetadataSpy).not.toHaveBeenCalled();
        expect(cachedImagePath).toEqual(overlayedImagePath);
      });
    });

    describe('And image is not found in cache', () => {
      it('processes images to create overlay', async () => {
        const getImageMetadataSpy = jest.spyOn(imageHelper, 'getImageMetadata').mockResolvedValueOnce(IMAGE_METADATA);

        await imageHelper.overlayImages(IMAGE_PROPS, IMAGE_PROPS, { cacheFolder: CACHE_PATH });

        expect(getImageMetadataSpy).toHaveBeenCalledWith(IMAGE_PROPS.filePath);
      });

      it('handles errors if async calls fail during image processing', async () => {
        jest.spyOn(imageHelper, 'getImageMetadata').mockRejectedValueOnce({ message: 'Unprocessable image' });

        const imageOverlay = imageHelper.overlayImages(IMAGE_PROPS, IMAGE_PROPS, { cacheFolder: CACHE_PATH });

        await expect(imageOverlay).rejects.toThrow('Unprocessable image');
      });
    });
  });

  describe('When trying to adjust image dimensions', () => {
    describe('and no adjust parameters are sent', () => {
      it('skips any image processing execution', async () => {
        const getImageMetadataSpy = jest.spyOn(imageHelper, 'getImageMetadata');

        await imageHelper.adjustImageDimensions({ filePath: 'image.png' });

        expect(getImageMetadataSpy).not.toHaveBeenCalled();
      });
    });

    describe('and adjust parameters are sent', () => {
      it('skips adjust of image when given file is smaller than max thresholds, returns original image path', async () => {
        jest.spyOn(imageHelper, 'getImageDimensions').mockResolvedValueOnce({ width: 100, height: 100 });

        const adjustImageResult = await imageHelper.adjustImageDimensions(ADJUST_IMAGE_PROPS);

        expect(adjustImageResult).toBe(ADJUST_IMAGE_PROPS.filePath);
      });

      it('adjust image dimensions when original image is bigger than max thresholds, returns adjusted image path', async () => {
        jest.spyOn(imageHelper, 'getImageDimensions').mockResolvedValueOnce({ width: 1000, height: 1200 });

        const adjustImageResult = await imageHelper.adjustImageDimensions(ADJUST_IMAGE_PROPS);

        expect(adjustImageResult).toBe('./cache/overlays/image-400x480.png');
      });

      it('returns adjusted image from cache when it was previously generated', async () => {
        await writeFile(`${CACHE_PATH}/image-400x480.png`, 'EMPTY_FILE');

        jest.spyOn(imageHelper, 'getImageDimensions').mockResolvedValueOnce({ width: 1000, height: 1200 });

        const adjustImageResult = await imageHelper.adjustImageDimensions(ADJUST_IMAGE_PROPS);

        expect(adjustImageResult).toBe('./cache/overlays/image-400x480.png');
      });

      it('returns adjusted image when only height threshold is given', async () => {
        jest.spyOn(imageHelper, 'getImageDimensions').mockResolvedValueOnce({ width: 1000, height: 1200 });

        const adjustImageProps = { filePath: `${CACHE_PATH}/image.png`, maxImageHeight: 500 };
        const adjustImageResult = await imageHelper.adjustImageDimensions(adjustImageProps);

        expect(adjustImageResult).toBe('./cache/overlays/image-416x500.png');
      });

      it('returns adjusted image when only width threshold is given', async () => {
        jest.spyOn(imageHelper, 'getImageDimensions').mockResolvedValueOnce({ width: 1000, height: 1200 });

        const adjustImageProps = { filePath: `${CACHE_PATH}/image.png`, maxImageWidth: 500 };
        const adjustImageResult = await imageHelper.adjustImageDimensions(adjustImageProps);

        expect(adjustImageResult).toBe('./cache/overlays/image-500x600.png');
      });
    });
  });
});
