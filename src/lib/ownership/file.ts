import * as path from 'path';
import { OwnedFile } from './lib/OwnedFile';
import { OwnershipEngine } from './lib/OwnershipEngine';
import { readDirRecursively } from './lib/readDirRecursively';
import { readTrackedGitFiles } from './lib/readTrackedGitFiles';
import { countLinesInFile } from './lib/countLinesInFile';

export const getFileOwnership = async (options: { codeowners: string, dir: string, onlyGit: boolean, root?: string }): Promise<OwnedFile[]> => {
  const filePaths = await getFilePaths(options.dir, options.onlyGit, options.root);

  const engine = OwnershipEngine.FromCodeownersFile(options.codeowners);

  const files: OwnedFile[] = [];

  for (const filePath of filePaths) {
    const owners = engine.calcFileOwnership(filePath);
    const lines = await countLinesInFile(filePath);

    files.push(new OwnedFile({ path: filePath, owners, lines }));
  }

  return files;
};

const getFilePaths = async (dir: string, onlyGit: boolean, root?: string) => {
  let filePaths;

  if (onlyGit) {
    filePaths = await readTrackedGitFiles(dir);
  } else {
    filePaths = await readDirRecursively(dir, ['.git']);
  }

  if (root) { // We need to re-add the root so that later ops can find the file
    filePaths = filePaths.map(filePath => path.join(root, filePath));
  }

  filePaths.sort();

  return filePaths;
};
