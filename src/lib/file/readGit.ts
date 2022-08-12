import fs, { Stats } from 'fs';
import { exec } from '../util/exec';
import ignore, { Ignore } from 'ignore';

export const readGit = async (dir: string, ignores: Ignore = ignore()): Promise<string[]> => {
  const { stdout } = await exec('git ls-files', { cwd: dir });
  return stdout.split('\n').filter((filePath) => {
    let stats: Stats | undefined = undefined;
    try {
      stats = fs.statSync(filePath);
    } catch (e) {
      return false; // Ignore missing files and symlinks
    }

    // Ignore if path is not a file
    if (!stats.isFile() || ignores.ignores(filePath)){
      return false;
    }

    return true;
  });
};
