import { rm } from 'fs/promises';
import fs from 'fs';

import * as filesystemHelper from './filesystem';

const FOLDER = './test-folder';

beforeAll(async () => {
  await rm(FOLDER, { recursive: true, force: true });
});

afterEach(async () => {
  await rm(FOLDER, { recursive: true, force: true });
  jest.restoreAllMocks();
});

afterAll(async () => {
  await rm(FOLDER, { recursive: true, force: true });
});

describe('Filesystem helper', () => {
  describe('When trying to create folder', () => {
    it('Creates folder given a valid path', () => {
      filesystemHelper.createFolder(FOLDER);

      expect(fs.existsSync(FOLDER)).toBeTruthy();
    });

    it('Handles folder creation errors', () => {
      try {
        filesystemHelper.createFolder('./cache/invalid/nested/path');

        throw new Error('Previous line must throw, it should not execute this line');
      } catch (error) {
        expect(error.message).toEqual("ENOENT: no such file or directory, mkdir './cache/invalid/nested/path'");
      }
    });
  });

  describe('When trying to create multiple folders', () => {
    it('skips folder creation when provided an empty array', () => {
      const createFolderSpy = jest.spyOn(filesystemHelper, 'createFolder').mockReturnValueOnce(undefined);

      filesystemHelper.createCacheFolders([]);

      expect(createFolderSpy).not.toHaveBeenCalled();
    });

    it('calls folder creation when provided an empty array', () => {
      const createFolderSpy = jest.spyOn(filesystemHelper, 'createFolder').mockReturnValue(undefined);
      const foldersToCreate = ['folder1', 'folder2'];

      filesystemHelper.createCacheFolders(foldersToCreate);

      expect(createFolderSpy).toHaveBeenCalledTimes(foldersToCreate.length);
    });
  });
});
