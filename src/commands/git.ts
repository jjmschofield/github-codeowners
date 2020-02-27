import { execSync } from 'child_process';

import { CodeOwners } from '../lib/CodeOwners';
import { OUTPUT_FORMAT, OwnedPath, Stats } from '../lib/types';
import { statsFromOwnedPaths } from '../lib/stats';

interface GitOptions {
  dir: string;
  codeowners: string;
  shaA?: string;
  shaB?: string;
  output: OUTPUT_FORMAT;
  stats: boolean;
}

export const git = async (options: GitOptions) => {
  const owners = CodeOwners.FromFile(options.codeowners);

  const gitCommand = `git diff --name-only ${options.shaA ? options.shaA : '--cached'} ${options.shaB ? options.shaB : 'HEAD'}`;

  const diff = execSync(gitCommand).toString();

  const changedPaths = diff.split('\n').filter(path => path.length > 0);

  const ownedPaths = changedPaths.map(path => owners.getOwners(path));

  for (const owned of ownedPaths) {
    write(owned, options, process.stdout);
  }

  if (options.stats) {
    const stats = statsFromOwnedPaths(ownedPaths);
    writeStats(stats, options, process.stdout);
  }
};

const write = (owned: OwnedPath, options: GitOptions, stream: any) => {
  switch (options.output) {
    case(OUTPUT_FORMAT.JSONL):
      stream.write(`${JSON.stringify(owned)}\n`);
      break;
    case(OUTPUT_FORMAT.CSV):
      let csvline = owned.path;
      if (owned.owners.length > 0) csvline = `${csvline},${owned.owners.join(',')}`;
      stream.write(`${csvline}\n`);
      break;
    default:
      let line = owned.path;
      if (owned.owners.length > 0) line = `${line}\t${owned.owners.join(',')}`;
      stream.write(`${line}\n`);
      break;
  }
};

const writeStats = (stats: Stats , options: GitOptions, stream: any) => {
  switch (options.output) {
    case(OUTPUT_FORMAT.JSONL):
      stream.write(`${JSON.stringify(stats)}\n`);
      break;
    case(OUTPUT_FORMAT.CSV):
      break;
    default:
      stream.write('\n--- Stats ---\n');
      stream.write(`files: ${stats.count}\n`);
      stream.write(`unloved: ${stats.unloved}\n`);
      stream.write('--- Owners ---\n');
      const owners = stats.owners.map(owner => `${owner.owner}: ${owner.count}`).join('\n');
      stream.write(`${owners}\n`);
      break;
  }
};
