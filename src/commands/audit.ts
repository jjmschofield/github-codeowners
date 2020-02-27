import { CodeOwners } from '../lib/CodeOwners';
import { Paths } from '../lib/Paths';
import { OUTPUT_FORMAT, OwnedPath, Stats } from '../lib/types';
import { statsFromOwnedPaths } from '../lib/stats';

interface AuditOptions {
  codeowners: string;
  dir: string;
  unloved: boolean;
  output: OUTPUT_FORMAT;
  stats: boolean;
}

export const audit = async (options: AuditOptions) => {
  const paths = await getFilesPathsWithOwnership(options);

  for (const path of paths) {
    if (!options.unloved) {
      write(path, options, process.stdout);
    } else {
      if (path.owners.length < 1) {
        write(path, options, process.stdout);
      }
    }
  }

  if (options.stats) {
    const stats = statsFromOwnedPaths(paths);
    writeStats(stats, options, process.stdout);
  }
};

const getFilesPathsWithOwnership = async (options: AuditOptions): Promise<OwnedPath[]> => {
  const owners = CodeOwners.FromFile(options.codeowners);

  const paths = await Paths.FromVcsDir(options.dir);

  return paths.list.map(file => owners.getOwners(file));
};

const write = (owned: OwnedPath, options: AuditOptions, stream: any) => {
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

const writeStats = (stats: Stats , options: AuditOptions, stream: any) => {
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
