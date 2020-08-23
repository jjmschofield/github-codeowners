import { execFile } from '../../util/execFile';
import { readTrackedGitFiles } from './readTrackedGitFiles';

jest.mock('./execFile');
const execFileMock = execFile as jest.Mock;

describe('git ls-files', () => {
  it('splits the input', async () => {
    execFileMock.mockResolvedValue({ stdout: 'foo\nbar\n', stderr: '' });

    const result = await readTrackedGitFiles('some/dir');

    expect(result).toStrictEqual(['foo', 'bar']);
    expect(execFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        cwd: 'some/dir',
      }),
    );
  });
});
