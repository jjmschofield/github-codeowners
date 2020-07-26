import * as path from 'path';
import { OwnershipEngine } from '../lib/OwnershipEngine';
import { OwnedFile } from '../lib/OwnedFile';
import { OUTPUT_FORMAT } from '../lib/types';
import { calcFileStats } from '../lib/stats';
import { writeOwnedFile, writeStats } from '../lib/writers';
import { readDirRecursively } from '../lib/dir';

interface AuditOptions {
  codeowners: string;
  dir: string;
  unloved: boolean;
  output: OUTPUT_FORMAT;
  stats: boolean;
  root: string;
}

export const audit = async (options: AuditOptions) => {
  const files = await getFilesWithOwnership(options);

  if (options.stats) {
    const stats = calcFileStats(files);
    writeStats(stats, options, process.stdout);
    return;
  }

  for (const file of files) {
    if (options.unloved) {
      if (file.owners.length < 1) {
        writeOwnedFile(file, options, process.stdout);
      }
    } else {
      writeOwnedFile(file, options, process.stdout);
    }
  }
};

const getFilesWithOwnership = async (options: AuditOptions): Promise<OwnedFile[]> => {
  const engine = OwnershipEngine.FromCodeownersFile(options.codeowners);

  let filePaths = await readDirRecursively(options.dir, ['.git']);

  if(options.root){ // We need to re-add the root so that later ops can find the file
    filePaths = filePaths.map(filePath => path.join(options.root, filePath));
  }

  filePaths.sort();

  const files: OwnedFile[] = [];

  for (const filePath of filePaths) {
    files.push(await OwnedFile.FromPath(filePath, engine));
  }

  return files;
};
