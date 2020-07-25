import readdir from'recursive-readdir';
import { createGitIgnoreFilter } from './gitignore';

export const getFilteredFilePaths = async (dir: string, root: string): Promise<string[]> => {
  const filePaths = await readdir(dir, ['.git']);

  const trimmedFilePaths = filePaths.map((filePath: string) => {
    return filePath.replace(`${dir}/`, '');
  });

  const filteredFilePaths = trimmedFilePaths
    .filter((file: string) => file.startsWith(root))
    .filter(await createGitIgnoreFilter(dir));

  filteredFilePaths.sort();

  return filteredFilePaths;
};

