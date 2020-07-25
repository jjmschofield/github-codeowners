import ignore, { Ignore } from 'ignore';
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
    .filter(await gitIgnoreFilter(dir));

  filteredFilePaths.sort();

  return filteredFilePaths;
};

const gitIgnoreFilter = async (dir: string) => {
  const ignores = await createIgnore(dir);
  return (filePath: string) => {
    for (const ig of ignores) {
      if (filePath.startsWith(ig.name)) {
        if (ig.ignore.ignores(filePath)) {
          return false;
        }
        return true;
      }
    }
    return true;
  };
};

const createIgnore = async (dir: string) => {
  const gitIgnores = await getGitIgnoreRulesRecursively(dir);

  // Order by file length so when we combine rules we do it in the right order
  // TODO -> this is a tree problem, it should be answered as such
  // TODO -> tests must contain a test for the nested overide  (! in a nested git ignore)
  const orderedIgnores = [...gitIgnores].sort((a, b) => {
    if (a.name.length > b.name.length) return -1;
    if (a.name.length < b.name.length) return 1;
    return 0;
  });

  for (const ig of orderedIgnores) {
    for (const test of orderedIgnores) {
      if (ig.name !== test.name && ig.name.startsWith(test.name)) {
        ig.ignore = ignore().add(test.ignore).add(ig.ignore);
      }
    }
  }

  return orderedIgnores;
};

const getGitIgnoreRulesRecursively = async (dir: string): Promise<{ name: string, ignore: Ignore }[]> => {
  const filePaths = await findFilesRecursively(dir, '.gitignore');

  const files = await getManyFileContents(filePaths);

  return files.map((file) => {
    return {
      name: file.name.replace(dir, '')
        .replace('.gitignore', '')
        .substr(1),
      ignore: ignore().add(file.contents),
    };
  });
};

const findFilesRecursively = async (startingDir: string, name: string): Promise<string[]> => {
  const dirs: string[] = [];
  const foundFiles: string[] = [];

  dirs.push(startingDir);

  while (dirs.length > 0) {
    const dir = dirs.pop();

    if (!dir) break;

    const nodes = fs.readdirSync(dir).map(node => path.resolve(dir, node));

    const nodeStatOps = nodes.map(fs.promises.stat);

    const nodeStats = await Promise.all(nodeStatOps);

    for (let i = 0; i < nodes.length; i++) {
      if (nodeStats[i].isDirectory()) {
        dirs.push(nodes[i]);
      }

      if (nodeStats[i].isFile() && nodes[i].endsWith(name)) {
        foundFiles.push(nodes[i]);
      }
    }
  }

  return foundFiles;
};

const getManyFileContents = async (files: string[]): Promise<{ name: string, contents: string }[]> => {
  const readOps = files.map(file => fs.promises.readFile(file));

  const contents = await Promise.all(readOps);

  return files.map((file, i) => {
    return {
      name: file,
      contents: contents[i].toString(),
    };
  });
};
