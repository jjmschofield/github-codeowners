import fs, { Stats } from 'fs';
import ignore, { Ignore } from 'ignore';
import path from 'path';

export const readDir = async (dir: string, filters: string[] = []): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    try {
      const ignores = ignore().add(filters);
      const files = walkDir(dir, '', ignores);
      resolve(files);
    } catch (e) {
      reject(e);
    }
  });
};

const walkDir = (root: string, dir: string, ignores: Ignore, files: string[] = []): string[] => {
  const newFiles = fs.readdirSync(path.resolve(root, dir));

  const newGitIgnore = newFiles.find(file => file === '.gitignore');

  let appliedIgnores = ignores;

  if (newGitIgnore) {
    const contents = fs.readFileSync(path.resolve(root, dir, newGitIgnore)).toString();
    appliedIgnores = ignore().add(ignores).add(contents);
  }

  for (const file of newFiles) {
    if (appliedIgnores.ignores(file) || appliedIgnores.ignores(path.join(dir, file))) {
      continue;
    }

    let stats: Stats | undefined = undefined;

    try {
      stats = fs.statSync(path.resolve(root, dir, file));
    } catch (e) {
      continue;// Ignore missing files and symlinks
    }

    if (stats && stats.isDirectory()) {
      walkDir(root, path.join(dir, file), appliedIgnores, files);
    }

    if (stats && stats.isFile()) {
      files.push(path.join(dir, file));
    }
  }

  return files;
};
