import { getFileOwnership } from './file';

import { OwnershipEngine } from './lib/OwnershipEngine';

import { readDirRecursively } from './lib/readDirRecursively';
import { readTrackedGitFiles } from './lib/readTrackedGitFiles';
import { countLinesInFile } from './lib/countLinesInFile';
import { OwnedFile } from './lib/OwnedFile';

jest.mock('./lib/OwnershipEngine');
jest.mock('./lib/readDirRecursively');
jest.mock('./lib/readTrackedGitFiles');
jest.mock('./lib/countLinesInFile');

describe('file', () => {
  const mocks = {
    readDirRecursively: readDirRecursively as jest.Mock,
    readTrackedGitFiles: readTrackedGitFiles as jest.Mock,
    countLinesInFile: countLinesInFile as jest.Mock,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mocks.readDirRecursively.mockResolvedValue([]);
    mocks.readTrackedGitFiles.mockResolvedValue([]);
    mocks.countLinesInFile.mockResolvedValue(0);
  });

  describe('getFileOwnership', () => {
    it('should create an engine using the specified code ownersfile', async () => {
      // Arrange
      const expected = 'some/file';

      // Act
      await getFileOwnership({ codeowners: expected, dir: '/', onlyGit: false });

      // Assert
      expect(OwnershipEngine.FromCodeownersFile).toHaveBeenLastCalledWith(expected);
    });

    it('should read files from the directory when onlyGit is not specified', async () => {
      // Arrange
      const expected = 'some/dir';

      // Act
      await getFileOwnership({ codeowners: expected, dir: expected, onlyGit: false });

      // Assert
      expect(mocks.readDirRecursively).toHaveBeenCalledWith(expected, ['.git']);
    });

    it('should read files from git tracked files when onlyGit is specified', async () => {
      // Arrange
      const expected = 'some/dir';

      // Act
      await getFileOwnership({ codeowners: expected, dir: expected, onlyGit: true });

      // Assert
      expect(mocks.readTrackedGitFiles).toHaveBeenCalledWith(expected);
    });

    it('should return owned files', async () => {
      // Arrange
      const expected = [
        new OwnedFile({ path: 'is/not-owned', owners: ['@some/owner'], lines: 0 }),
        new OwnedFile({ path: 'is/owned', owners: ['@some/owner'], lines: 0 }),
      ];

      const mockEngine = OwnershipEngine as any;
      mockEngine.FromCodeownersFile.mockImplementation(() => {
        return {
          ...OwnershipEngine,
          calcFileOwnership: (path: string) => {
            const matching = expected.find(f => f.path === path);
            if (!matching) throw new Error('unexpected path');
            return matching.owners;
          },
        };
      });

      mocks.readDirRecursively.mockResolvedValue(expected.map(f => f.path).reverse());

      // Act
      const result = await getFileOwnership({ codeowners: 'some/file', dir: '/', onlyGit: false });

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
