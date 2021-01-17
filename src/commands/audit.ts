import { OUTPUT_FORMAT, writeOwnedFile, writeStats } from '../lib/writers';
import { calcFileStats } from '../lib/stats';
import { getFileOwnership, OwnedFile } from '../lib/ownership';

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
  const fileOptions = OwnedFile.RecommendedOptions(options);
  fileOptions.countLines = fileOptions.countLines || options.stats;

  const files = await getFileOwnership(options, fileOptions);

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
