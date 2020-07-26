import { log } from './logger';
import { readDirRecursively } from './dir';

export const getFilteredPaths = async (dir: string): Promise<string[]> => {
  try {
    const filePaths = await readDirRecursively(dir, ['.git']);

    const trimmedFilePaths = filePaths.map((filePath: string) => {
      return filePath.replace(`${dir}/`, '');
    });

    return trimmedFilePaths.sort();
  } catch (e) {
    log.error('failed getting file paths', e);
    throw e;
  }
};

