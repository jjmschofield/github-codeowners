import { readGit } from './readGit';
import { readDir } from './readDir';
import * as path from 'path';

export enum FILE_DISCOVERY_STRATEGY {
  FILE_SYSTEM,
  GIT_LS,
}

export const getFilePaths = async (dir: string, strategy: FILE_DISCOVERY_STRATEGY, root?: string) => {
  let filePaths;

  if (strategy === FILE_DISCOVERY_STRATEGY.GIT_LS) {
    filePaths = await readGit(dir);
  } else {
    filePaths = await readDir(dir, ['.git']);
  }

  if (root) { // We need to re-add the root so that later ops can find the file
    filePaths = filePaths.map(filePath => path.join(root, filePath));
  }

  filePaths.sort();

  return filePaths;
};
