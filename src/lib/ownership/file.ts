import { OwnedFile } from './lib/OwnedFile';
import { OwnershipEngine } from './lib/OwnershipEngine';
import { countLines } from '../file/countLines';

export const getOwnership = async (codeowners: string, filePaths: string[]): Promise<OwnedFile[]> => {
  const engine = OwnershipEngine.FromCodeownersFile(codeowners);

  const owned: OwnedFile[] = [];

  for (const filePath of filePaths) {
    const owners = engine.calcFileOwnership(filePath);

    // TODO - make counting lines a concern for the caller or for stats
    const lines = await countLines(filePath);

    owned.push(new OwnedFile({ path: filePath, owners, lines }));
  }

  return owned;
};
