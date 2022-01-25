import { exec } from '../util/exec';
import { readGit } from './readGit';
import fs from 'fs';

jest.mock('../util/exec');
jest.mock('fs');
const fsMocked = jest.mocked<any>(fs);
const execFileMock = exec as jest.Mock;

describe('readGit', () => {
  beforeEach(() => {
    fsMocked.statSync.mockImplementation((path: any) => {
      return {
        isFile() {
          if (!path) { return false; }
          return true;
        },
      };
    });
  });

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

  it('should not return non-files', async () => {
    execFileMock.mockResolvedValue({ stdout: 'foo\nbar\nbaz\n', stderr: '' });
    fsMocked.statSync.mockImplementation((path: any) => {
      return {
        isFile() {
          if (!path || path === 'baz') { return false; }
          return true;
        },
      };
    });

    const result = await readGit('some/dir');

    expect(result).toStrictEqual(['foo', 'bar']);
  });
});
