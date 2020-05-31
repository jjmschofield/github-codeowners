import { execSync } from 'child_process';

import { OwnedFile } from '../lib/OwnedFile';
import { OwnershipEngine } from '../lib/OwnershipEngine';
import { OUTPUT_FORMAT, Stats } from '../lib/types';
import { calcFileStats } from '../lib/stats';
import { writeOwnedFile, writeStats } from '../lib/writers';

interface GitOptions {
  dir: string;
  codeowners: string;
  shaA?: string;
  shaB?: string;
  output: OUTPUT_FORMAT;
  stats: boolean;
}

export const git = async (options: GitOptions) => {
  const gitCommand = `git diff --name-only ${options.shaA ? options.shaA : '--cached'} ${options.shaB ? options.shaB : 'HEAD'}`;

  const diff = execSync(gitCommand).toString();

  const changedPaths = diff.split('\n').filter(path => path.length > 0);

  const engine = OwnershipEngine.FromCodeownersFile(options.codeowners);

  const files : OwnedFile[] = [];

  for (const filePath of changedPaths){
    files.push(await OwnedFile.FromPath(filePath, engine));
  }

  for (const file of files) {
    writeOwnedFile(file, options, process.stdout);
  }

  if (options.stats) {
    const stats = calcFileStats(files);
    writeStats(stats, options, process.stdout);
  }
};
