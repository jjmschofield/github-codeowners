import { OwnedFile } from '../ownership';
import { OUTPUT_FORMAT } from './types';

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
