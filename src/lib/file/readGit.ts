import { exec } from '../util/exec';

export const readGit = async (dir: string): Promise<string[]> => {
  const { stdout } = await exec('git ls-files', { cwd: dir });
  return stdout.split('\n').filter(x => !!x);
};
