import { File } from '../file';
import { OwnershipEngine } from './OwnershipEngine';

export const getOwnership = async (codeowners: string, filePaths: string[], allowRelativePaths: boolean): Promise<File[]> => {
  const engine = OwnershipEngine.FromCodeownersFile(codeowners, allowRelativePaths);

  const owned: File[] = [];

  for (const filePath of filePaths) {
    const owners = engine.calcFileOwnership(filePath);
    owned.push(new File({ path: filePath, owners }));
  }

  return owned;
};
