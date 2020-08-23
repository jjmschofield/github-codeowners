import { execFile } from '../../util/execFile';

export const readTrackedGitFiles = async (dir: string): Promise<string[]> => {
  const { stdout } = await execFile('git', ['ls-files'], { cwd: dir });
  return stdout.split('\n').filter(x => !!x);
};
