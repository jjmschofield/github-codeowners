import fs, { Stats } from 'fs';
import ignore, { Ignore } from 'ignore';
import path from 'path';


export const readDirRecursively = async (dir: string, filters: string[] = []): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    try {
      const ignores = ignore().add(filters);
      const files = walkDir(dir, ignores);
      resolve(files);
    } catch (e) {
      reject(e);
    }
  });
};

const walkDir = (dir: string, ignores: Ignore, files: string[] = []): string[] => {
  if (!fs.existsSync(dir)) return files;

  const newFiles = fs.readdirSync(dir);

  for (const file of newFiles) {
    if (ignores.ignores(file)) {
      continue;
    }

    const fullPath = path.join(dir, file);

    let stats: Stats | undefined = undefined;

    try {
      stats = fs.statSync(fullPath);
    } catch (e) {
      continue;// Ignore missing files and symlinks
    }

    if (stats && stats.isDirectory()) {
      walkDir(fullPath, ignores, files);
    }

    if (stats && stats.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
};
