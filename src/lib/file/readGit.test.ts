import { exec } from '../util/exec';
import { readGit } from './readGit';

jest.mock('../util/exec');
const execFileMock = exec as jest.Mock;

describe('readGit', () => {
  it('should return the expected list of files when called', async () => {
    execFileMock.mockResolvedValue({ stdout: 'foo\nbar\n', stderr: '' });

    const result = await readGit('some/dir');

    expect(result).toStrictEqual(['foo', 'bar']);
  });

  it('should call git ls-files with the correct directory', async () => {
    execFileMock.mockResolvedValue({ stdout: '', stderr: '' });

    const result = await readGit('some/dir');

    expect(exec).toHaveBeenCalledWith(
      'git ls-files',
      expect.objectContaining({
        cwd: 'some/dir',
      }),
    );
  });
});
