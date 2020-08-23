import { execFile } from './execFile';
import { mocked } from 'ts-jest';
import { gitLsFiles } from './gitLsFiles';
jest.mock('./execFile');

describe('git ls-files', () => {
  it('splits the input', async () => {
    mocked(execFile).mockResolvedValue({ stdout: 'foo\nbar\n', stderr: '' });

    const result = await gitLsFiles('some/dir');

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
