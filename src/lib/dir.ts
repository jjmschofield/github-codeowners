import ignore from 'ignore';
import * as fs from 'fs';
import * as path from 'path';

const readdir = require('recursive-readdir');

export const getFilteredFilePaths = async (dir: string, root: string): Promise<string[]> => {
  const filePaths = await readdir(dir, ['.git']);

  const trimmedFilePaths = filePaths.map((filePath: string) => {
    return filePath.replace(`${dir}/`, '');
  });

  const filteredFilePaths = trimmedFilePaths
    .filter((file: string) => file.startsWith(root))
    .filter(gitIgnoreFilter(dir));

  filteredFilePaths.sort();

  return filteredFilePaths;
};

const gitIgnoreFilter = (dir: string) => {
  const ignored = createIgnore(dir);
  return ignored.createFilter();
};

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
