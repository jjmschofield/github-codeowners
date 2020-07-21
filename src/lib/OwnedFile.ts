import { OwnershipEngine } from './OwnershipEngine';
import * as fs from 'fs';
import { log } from './logger';

export class OwnedFile {
  // tslint:disable-next-line:variable-name
  readonly path: string;
  readonly owners: string[];
  readonly lines: number;

  constructor(props: { path: string, lines: number, owners: string[] }) {
    this.path = props.path;
    this.lines = props.lines;
    this.owners = props.owners;
  }

  toJsonl() {
    return `${JSON.stringify({ path: this.path, owners: this.owners, lines: this.lines })}\n`;
  }

  toCsv(){
    let line = this.path;
    if (this.owners.length > 0) {
      line += `,${this.owners.join(',')}`;
    }
    return `${line}\n`;
  }

  toTsv(){
    let line = this.path;
    if (this.owners.length > 0) {
      line += `\t${this.owners.join('\t')}`;
    }
    return `${line}\n`;
  }

  // tslint:disable-next-line:variable-name
  public static FromPath = async (filePath: string, engine: OwnershipEngine) => {
    return new OwnedFile({
      path: filePath,
      lines: await countLinesInFile(filePath),
      owners: engine.calcFileOwnership(filePath),
    });
  }
}

const countLinesInFile = async (filePath: string): Promise<number> => {
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
