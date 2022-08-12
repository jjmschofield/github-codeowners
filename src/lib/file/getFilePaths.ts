import { readGit } from './readGit';
import { readDir } from './readDir';
import * as path from 'path';
import fs from 'fs';
import ignore from 'ignore';

export enum FILE_DISCOVERY_STRATEGY {
  FILE_SYSTEM,
  GIT_LS,
}

export const getFilePaths = async (dir: string, strategy: FILE_DISCOVERY_STRATEGY, root?: string) => {
  let filePaths;

  const ignores = ignore().add(['.git']);
  try {
    const contents = fs.readFileSync(path.resolve('.codeownersignore')).toString();
    ignores.add(contents);
    // tslint:disable-next-line:no-empty
  } catch (e) {
  }

  if (strategy === FILE_DISCOVERY_STRATEGY.GIT_LS) {
    filePaths = await readGit(dir, ignores);
  } else {
    filePaths = await readDir(dir, ignores);
  }

  if (root) { // We need to re-add the root so that later ops can find the file
    filePaths = filePaths.map(filePath => path.join(root, filePath));
  }

  filePaths.sort();

  return filePaths;
};
