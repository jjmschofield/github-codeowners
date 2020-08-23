import { execFile } from './execFile';

export const gitLsFiles = async (dir: string): Promise<string[]> => {
  const { stdout } = await execFile('git', ['ls-files'], { cwd: dir });
  return stdout.split('\n').filter(x => !!x);
};
