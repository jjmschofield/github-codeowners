import * as fs from 'fs';
import { log } from '../logger';

export const countLines = async (filePath: string): Promise<number> => {
  let i;
  let count = 0;
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .on('error', (e) => {
        log.error(`failed to read lines from file ${filePath}`, e);
        reject(e);
      })
      .on('data', (chunk) => {
        for (i = 0; i < chunk.length; ++i) if (chunk[i] === 10) count++;
      })
      .on('end', () => resolve(count));
  });
};
