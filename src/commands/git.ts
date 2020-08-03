import { execSync } from 'child_process';
import { OwnedFile, OwnershipEngine } from '../lib/ownership';
import { OUTPUT_FORMAT, writeOwnedFile, writeStats } from '../lib/writers';
import { calcFileStats } from '../lib/stats';

interface GitOptions {
  dir: string;
  codeowners: string;
  shaA?: string;
  shaB?: string;
  output: OUTPUT_FORMAT;
  stats: boolean;
}

export const git = async (options: GitOptions) => {
  const gitCommand = calcGitCommand(options);

  const diff = execSync(gitCommand).toString();

  const changedPaths = diff.split('\n').filter(path => path.length > 0);

  const engine = OwnershipEngine.FromCodeownersFile(options.codeowners);

  const files: OwnedFile[] = [];

  for (const filePath of changedPaths) {
    files.push(await OwnedFile.FromPath(filePath, engine, { countLines: false }));
  }

  for (const file of files) {
    writeOwnedFile(file, options, process.stdout);
  }

  if (options.stats) {
    const stats = calcFileStats(files);
    writeStats(stats, options, process.stdout);
  }
};

const calcGitCommand = (options: GitOptions) => {
  if (options.shaA && options.shaB) {
    return `git diff --name-only ${options.shaA} ${options.shaB}`;
  }

  if (options.shaA) {
    return `git ls-tree --full-tree -r --name-only ${options.shaA}`;
  }

  return 'git diff --name-only --cached HEAD';
};
