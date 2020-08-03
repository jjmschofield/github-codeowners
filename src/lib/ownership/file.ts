import { OwnedFile } from './lib/OwnedFile';
import { OwnershipEngine } from './lib/OwnershipEngine';
import { readDirRecursively } from './lib/readDirRecursively';
import * as path from 'path';

export const getFileOwnership = async (options: { codeowners: string, dir: string, root?: string }): Promise<OwnedFile[]> => {
  const engine = OwnershipEngine.FromCodeownersFile(options.codeowners);

  let filePaths = await readDirRecursively(options.dir, ['.git']);

  if (options.root) { // We need to re-add the root so that later ops can find the file
    filePaths = filePaths.map(filePath => path.join(<string>options.root, filePath));
  }

  filePaths.sort();

  const files: OwnedFile[] = [];

  for (const filePath of filePaths) {
    files.push(await OwnedFile.FromPath(filePath, engine));
  }

  return files;
};
