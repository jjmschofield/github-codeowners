import { CodeOwners } from '../lib/CodeOwners';
import { OUTPUT_FORMAT, OwnedPath } from '../lib/types';

interface WhoOptions {
  file: string;
  dir: string;
  codeowners: string;
  output: OUTPUT_FORMAT;
}

export const who = async (options: WhoOptions) => {
  const owners = CodeOwners.FromFile(options.codeowners);
  const owned = owners.getOwners(options.file);
  write(owned, options, process.stdout);
};

const write = (owned: OwnedPath, options: WhoOptions, stream: any) => {
  switch (options.output) {
    case(OUTPUT_FORMAT.JSONL):
      stream.write(`${JSON.stringify(owned)}\n`);
      break;
    case(OUTPUT_FORMAT.CSV):
      if (owned.owners.length > 0) {
        stream.write(`${owned.owners.join(',')}\n`);
      } else {
        stream.write('unloved :(\n');
      }
      break;
    default:
      if (owned.owners.length > 0) {
        stream.write(`${owned.owners.join('\t')}\n`);
      } else {
        stream.write('unloved :(\n');
      }
      break;
  }
};
