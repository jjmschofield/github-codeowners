import { countLines } from '../../file/countLines';

export class OwnedFile {
  // tslint:disable-next-line:variable-name
  readonly path: string;
  readonly owners: string[];
  // tslint:disable-next-line:variable-name
  private _lines?: number;

  constructor(props: { path: string, owners: string[], lines?: number | undefined }) {
    this.path = props.path;
    this.owners = props.owners;
    this._lines = props.lines;
  }

  public get lines(): number | undefined {
    return this._lines;
  }

  async updateLineCount(): Promise<number> {
    this._lines = await countLines(this.path);
    return this._lines;
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
}
