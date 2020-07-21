import { OwnedFile } from './OwnedFile';
import { OUTPUT_FORMAT, Stats } from './types';


export const writeOwnedFile = (file: OwnedFile, options: { output: OUTPUT_FORMAT }, stream: any) => {
  switch (options.output) {
    case(OUTPUT_FORMAT.JSONL):
      stream.write(file.toJsonl());
      break;
    case(OUTPUT_FORMAT.CSV):
      stream.write(file.toCsv());
      break;
    default:
      stream.write(file.toTsv());
      break;
  }
};

export const writeStats = (stats: Stats, options: { output: OUTPUT_FORMAT }, stream: any) => {
  const orderedOwners = [...stats.owners].sort((a, b) => {
    if (a.owner < b.owner) return -1;
    if (a.owner > b.owner) return 1;
    return 0;
  });

  switch (options.output) {
    case(OUTPUT_FORMAT.JSONL):
      stream.write(`${JSON.stringify(stats)}\n`);
      break;
    case(OUTPUT_FORMAT.CSV):
      stream.write(`owner,files,lines\n`);
      stream.write(`total,${stats.total.files},${stats.total.lines}\n`);
      stream.write(`loved,${stats.loved.files},${stats.loved.lines}\n`);
      stream.write(`unloved,${stats.unloved.files},${stats.unloved.lines}\n`);
      orderedOwners.forEach((owner) => {
        stream.write(`${owner.owner},${owner.counters.files},${owner.counters.lines}\n`);
      });
      break;
    default:
      stream.write('\n--- Counts ---\n');
      stream.write(`Total: ${stats.total.files} files (${stats.total.lines} lines)\n`);
      stream.write(`Loved: ${stats.loved.files} files (${stats.loved.lines} lines)\n`);
      stream.write(`Unloved: ${stats.unloved.files} files (${stats.unloved.lines} lines)\n`);
      stream.write('--- Owners ---\n');
      const owners = orderedOwners.map(owner => `${owner.owner}: ${owner.counters.files} files (${owner.counters.lines} lines)`).join('\n');
      stream.write(`${owners}\n`);
      break;
  }
};
