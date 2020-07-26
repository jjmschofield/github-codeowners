import { createGitIgnoreFilter } from './gitignore';
import { log } from './logger';
import { readDirRecursively } from './dir';

export const getFilteredFilePaths = async (dir: string, root: string): Promise<string[]> => {
  try {
    const filePaths = await readDirRecursively(dir, ['.git']);

    const trimmedFilePaths = filePaths.map((filePath: string) => {
      return filePath.replace(`${dir}/`, '');
    });

    const filteredFilePaths = trimmedFilePaths
      .filter((file: string) => file.startsWith(root))
      .filter(await createGitIgnoreFilter(dir));

    filteredFilePaths.sort();

    return filteredFilePaths;
  } catch (e) {
    log.error('failed getting file paths', e);
    throw e;
  }
};

