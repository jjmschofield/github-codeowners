import { File } from '../file';
import { OwnershipEngine } from './OwnershipEngine';

export const getOwnership = async (codeowners: string, filePaths: string[]): Promise<File[]> => {
  const engine = OwnershipEngine.FromCodeownersFile(codeowners);

  const owned: File[] = [];

  for (const filePath of filePaths) {
    const owners = engine.calcFileOwnership(filePath);
    owned.push(new File({ path: filePath, owners }));
  }

  return owned;
};
