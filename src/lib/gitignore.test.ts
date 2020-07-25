import fs from 'fs';
import readdir from 'recursive-readdir';
import * as underTest from './gitignore';

jest.mock('recursive-readdir');
jest.mock('fs', () => {
  return {
    promises: {
      readFile: jest.fn(),
    },
  };
});

const readdirMock = readdir as jest.Mock;
const fsReadFileMock = fs.promises.readFile as jest.Mock;

describe('gitignore', () => {
  describe('createGitIgnoreFilter', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should filter a file which when it has a matching rule in the root .gitignore', async () => {
      // Arrange
      const unexpected = 'ignored';

      readdirMock.mockResolvedValue(['.gitignore']);
      fsReadFileMock.mockResolvedValue(Buffer.from(unexpected));


      // Act
      const filter = await underTest.createGitIgnoreFilter('some/dir');

      // Assert
      expect(filter(unexpected)).toEqual(false);
    });

    it('should not filter a file when it has no matching rule', async () => {
      // Arrange
      const expected = 'not-ignored';

      readdirMock.mockResolvedValue(['.gitignore']);
      fsReadFileMock.mockResolvedValue(Buffer.from('ignored'));

      // Act
      const filter = await underTest.createGitIgnoreFilter('some/dir');

      // Assert
      expect(filter(expected)).toEqual(true);
    });

    it('should filter a file which when it has a matching rule in a nested .gitignore', async () => {
      // Arrange
      const deeperDir = 'deep';
      const unexpected = 'deep-ignored';

      readdirMock.mockResolvedValue(['.gitignore', `${deeperDir}/.gitignore`]);

      fsReadFileMock.mockImplementation(async (fileName) => {
        if (fileName === '.gitignore') {
          return Buffer.from('ignored');
        }
        return Buffer.from(`${deeperDir}/${unexpected}`);
      });

      // Act
      const filter = await underTest.createGitIgnoreFilter('some/dir');

      // Assert
      expect(filter(`${deeperDir}/${unexpected}`)).toEqual(false);
    });

    it('should respect rules in the parent .gitignore when they are not overwritten in the child .gitignore', async () => {
      // Arrange
      const deeperDir = 'deep';
      const unexpected = 'ignored';

      readdirMock.mockResolvedValue(['.gitignore', `${deeperDir}/.gitignore`]);

      fsReadFileMock.mockImplementation(async (fileName) => {
        if (fileName === '.gitignore') {
          return Buffer.from('ignored');
        }
        return Buffer.from('');
      });

      // Act
      const filter = await underTest.createGitIgnoreFilter('some/dir');

      // Assert
      expect(filter(`${deeperDir}/${unexpected}`)).toEqual(false);
    });

    it('should respect the precedence of ignore rules when a file is matched against a nested .gitignore', async () => {
      // Arrange
      const deeperDir = 'deep';
      const expected = 'ignored';

      readdirMock.mockResolvedValue(['.gitignore', `${deeperDir}/.gitignore`]);

      fsReadFileMock.mockImplementation(async (fileName) => {
        if (fileName === '.gitignore') {
          return Buffer.from('ignored');
        }
        return Buffer.from(`${deeperDir}/!${expected}`);
      });

      // Act
      const filter = await underTest.createGitIgnoreFilter('some/dir');

      // Assert
      expect(filter(`${deeperDir}/${expected}`)).toEqual(false);
    });

    it('should not filter a file in a parent dir which when it has a matching rule in a child .gitignore', async () => {
      // Arrange
      const deeperDir = 'deep';
      const expected = 'deep-ignored';

      readdirMock.mockResolvedValue(['.gitignore', `${deeperDir}/.gitignore`]);

      fsReadFileMock.mockImplementation(async (fileName) => {
        if (fileName === '.gitignore') {
          return Buffer.from('ignored');
        }
        return Buffer.from(`${deeperDir}/${expected}`);
      });

      // Act
      const filter = await underTest.createGitIgnoreFilter('some/dir');

      // Assert
      expect(filter(expected)).toEqual(true);
    });
  });
});
