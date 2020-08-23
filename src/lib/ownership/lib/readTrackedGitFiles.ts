import { exec } from '../../util/exec';

export const readTrackedGitFiles = async (dir: string): Promise<string[]> => {
  const { stdout } = await exec('git ls-files', { cwd: dir });
  return stdout.split('\n').filter(x => !!x);
};
