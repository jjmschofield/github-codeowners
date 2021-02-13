import { OwnershipEngine, OwnedFile, getOwnership } from '../lib/ownership';
import { writeOwnedFile, OUTPUT_FORMAT } from '../lib/writers';

interface WhoOptions {
  file: string;
  dir: string;
  codeowners: string;
  output: OUTPUT_FORMAT;
}

export const who = async (options: WhoOptions) => {
  const [file] = await getOwnership(options.codeowners, [options.file]);
  writeOwnedFile(file, options, process.stdout);
};
