import { OwnershipEngine } from './OwnershipEngine';
import { countLinesInFile } from './countLinesInFile';

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

  toCsv() {
    let line = this.path;
    if (this.owners.length > 0) {
      line += `,${this.owners.join(',')}`;
    }
    return `${line}\n`;
  }

  toTsv() {
    let line = this.path;
    if (this.owners.length > 0) {
      line += `\t${this.owners.join('\t')}`;
    }
    return `${line}\n`;
  }

  // tslint:disable-next-line:variable-name
  public static FromPath = async (filePath: string, engine: OwnershipEngine, opts = { countLines: true }) => {
    return new OwnedFile({
      path: filePath,
      lines: opts.countLines ? await countLinesInFile(filePath) : 0,
      owners: engine.calcFileOwnership(filePath),
    });
  }
}
