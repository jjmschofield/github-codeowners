import { OwnershipEngine, OwnedFile } from '../lib/ownership';
import { writeOwnedFile, OUTPUT_FORMAT } from '../lib/writers';

interface WhoOptions {
  files: string[];
  dir: string;
  codeowners: string;
  output: OUTPUT_FORMAT;
}

export const who = async (options: WhoOptions) => {
  const engine = OwnershipEngine.FromCodeownersFile(options.codeowners);
  for (const file of options.files) {
    const owned = await OwnedFile.FromPath(file, engine);
    writeOwnedFile(owned, options, process.stdout);
  }
};
