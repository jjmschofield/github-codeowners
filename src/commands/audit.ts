import { OUTPUT_FORMAT, writeOwnedFile, writeStats } from '../lib/writers';
import { calcFileStats } from '../lib/stats';
import { getOwnership } from '../lib/ownership';
import { FILE_DISCOVERY_STRATEGY, getFilePaths } from "../lib/file";

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
