import { OwnedFile } from './lib/OwnedFile';
import { OwnershipEngine } from './lib/OwnershipEngine';
import { countLines } from '../file/countLines';

export const getOwnership = async (codeowners: string, filePaths: string[]): Promise<OwnedFile[]> => {
  const engine = OwnershipEngine.FromCodeownersFile(codeowners);

  const owned: OwnedFile[] = [];

  for (const filePath of filePaths) {
    const owners = engine.calcFileOwnership(filePath);
    owned.push(new OwnedFile({ path: filePath, owners }));
  }

  return owned;
};
