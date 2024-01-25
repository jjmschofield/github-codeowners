import fs, { Stats } from 'fs';
import { exec } from '../util/exec';

export const readGit = async (dir: string): Promise<string[]> => {
  const { stdout } = await exec('git ls-files', { cwd: dir, maxBuffer: 3 * 2 ** 20 }); // 3MiB
  return stdout.split('\n').filter((filePath) => {
    let stats: Stats | undefined = undefined;
    try {
      stats = fs.statSync(filePath);
    } catch (e) {
      return false; // Ignore missing files and symlinks
    }

    // Ignore if path is not a file
    if (!stats.isFile()){
      return false;
    }

    return true;
  });
};
