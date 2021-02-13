import { execSync } from 'child_process';
import { getOwnership } from '../lib/ownership';
import { OUTPUT_FORMAT } from '../lib/types';
import { calcFileStats, statsWriter } from '../lib/stats';

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

  const files = await getOwnership(options.codeowners, changedPaths);

  for (const file of files) {
    file.write(options.output, process.stdout);
  }

  if (options.stats) {
    const stats = calcFileStats(files);
    statsWriter(stats, options, process.stdout);
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
