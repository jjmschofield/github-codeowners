import pMap from 'p-map';
import { OUTPUT_FORMAT } from '../lib/types';
import { calcFileStats, statsWriter } from '../lib/stats';
import { getOwnership } from '../lib/ownership';
import { FILE_DISCOVERY_STRATEGY, getFilePaths } from '../lib/file';

interface AuditOptions {
  codeowners: string;
  dir: string;
  unloved: boolean;
  output: OUTPUT_FORMAT;
  onlyGit: boolean;
  stats: boolean;
  root: string;
}

export const audit = async (options: AuditOptions) => {
  const strategy = options.onlyGit ? FILE_DISCOVERY_STRATEGY.GIT_LS : FILE_DISCOVERY_STRATEGY.FILE_SYSTEM;
  const filePaths = await getFilePaths(options.dir, strategy, options.root);

  const files = await getOwnership(options.codeowners, filePaths);

  if (options.stats) {
    await pMap(files, f => f.updateLineCount(), { concurrency: 100 });

    const stats = calcFileStats(files);
    statsWriter(stats, options, process.stdout);
    return;
  }

  for (const file of files) {
    if (options.unloved) {
      if (file.owners.length < 1) {
        file.write(options.output, process.stdout);
      }
    } else {
      file.write(options.output, process.stdout);
    }
  }
};
