import ignore from 'ignore';
import * as fs from 'fs';
import * as path from 'path';
const readdir = require('recursive-readdir');

export class Paths {
  // tslint:disable-next-line:variable-name
  private readonly _list: string[];

  constructor(files: string[]) {
    this._list = files;
  }

  public get list() {
    return Array.from(this._list);
  }

  public static async FromVcsDir(dir: string) {
    try {
      const ignored = createIgnore(dir);

      const files = await readdir(dir, ['.git']);

      const trimmedFiles = files.map((file: string) => {
        return file.replace(`${dir}/`, '');
      });

      const filteredFiles = trimmedFiles.filter(ignored.createFilter());

      filteredFiles.sort();

      return new Paths(filteredFiles);
    } catch (error) {
      console.error(`failed to load file list from ${dir}`, error);
      throw error;
    }
  }
}

const createIgnore = (dir: string) => {
  const ignored = ignore();
  const gitignore = path.resolve(dir, '.gitignore');

  if (fs.existsSync(gitignore)) {
    const lines = fs.readFileSync(gitignore).toString().split('\n');

    for (const line of lines) {
      if (!line || line.startsWith('#')) continue;
      ignored.add(line);
    }
  }

  return ignored;
};
