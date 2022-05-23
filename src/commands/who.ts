import { getOwnership } from '../lib/ownership';
import { OUTPUT_FORMAT } from '../lib/types';

interface WhoOptions {
  files: string[];
  dir: string;
  codeowners: string;
  output: OUTPUT_FORMAT;
  allowRelativePaths: boolean;
}

export const who = async (options: WhoOptions) => {
  const files = await getOwnership(options.codeowners, options.files, options.allowRelativePaths);

  for (const file of files) {
    file.write(options.output, process.stdout);
  }
};
