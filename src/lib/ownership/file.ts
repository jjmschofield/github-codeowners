import { OwnedFile } from './lib/OwnedFile';
import { OwnershipEngine } from './lib/OwnershipEngine';
import { countLines } from '../file/countLines';
import { getFilePaths, FILE_DISCOVERY_STRATEGY } from '../file';

export const getFileOwnership = async (options: { codeowners: string, dir: string, onlyGit: boolean, root?: string }): Promise<OwnedFile[]> => {
  // TODO - make getting file paths a concern for the caller
  const strategy = options.onlyGit ? FILE_DISCOVERY_STRATEGY.GIT_LS : FILE_DISCOVERY_STRATEGY.FILE_SYSTEM;
  const filePaths = await getFilePaths(options.dir, strategy, options.root);

  const engine = OwnershipEngine.FromCodeownersFile(options.codeowners);

  const files: OwnedFile[] = [];

  for (const filePath of filePaths) {
    const owners = engine.calcFileOwnership(filePath);

    // TODO - make counting lines a concern for the caller or for stats
    const lines = await countLines(filePath);

    files.push(new OwnedFile({ path: filePath, owners, lines }));
  }

  return files;
};
