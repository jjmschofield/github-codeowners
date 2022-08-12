import fs from 'fs';
import * as underTest from './readDir';
import * as path from 'path';
import ignore from 'ignore';

jest.mock('fs');

const readdirSyncMock = fs.readdirSync as jest.Mock;
const statSyncMock = fs.statSync as jest.Mock;
const readFileSync = fs.readFileSync as jest.Mock;


describe('readDirRecursively', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return all files in the root directory', async () => {
    // Arrange
    const expectedFiles = [
      'some-file',
      'some-other-file',
    ];

    readdirSyncMock.mockReturnValue(expectedFiles);

    statSyncMock.mockReturnValue(statFake(STAT_FAKE_TYPES.FILE));

    // Act
    const result = await underTest.readDir('root');

    // Assert
    expect(readdirSyncMock).toHaveBeenCalledWith(path.resolve('root'));
    expect(result).toEqual(expectedFiles);
  });

  it('should return all files in child directories directory', async () => {
    // Arrange
    const expectedChildDir = 'sub-dir';

    const expectedFiles = [
      'some-file',
      'some-other-file',
    ];

    readdirSyncMock.mockReturnValueOnce([expectedChildDir]);
    statSyncMock.mockReturnValueOnce(statFake(STAT_FAKE_TYPES.DIR));

    readdirSyncMock.mockReturnValueOnce(expectedFiles);
    statSyncMock.mockReturnValue(statFake(STAT_FAKE_TYPES.FILE));

    // Act
    const result = await underTest.readDir('root');

    // Assert
    expect(readdirSyncMock).toHaveBeenCalledWith(path.resolve('root'));

    for (const expected of expectedFiles) {
      expect(result).toContain(path.join(expectedChildDir, expected));
    }
  });

  it('should ignore files matching the provided patterns', async () => {
    // Arrange
    const expectedFiles = [
      'some-file',
    ];

    readdirSyncMock.mockReturnValue([...expectedFiles, 'ignored.js']);

    statSyncMock.mockReturnValue(statFake(STAT_FAKE_TYPES.FILE));

    // Act
    const result = await underTest.readDir('root', ignore().add(['*.js']));

    // Assert
    expect(result).toEqual(expectedFiles);
  });

  it('should filter a file which when it has a matching rule in the root .gitignore', async () => {
    // Arrange
    const expectedFiles = [
      '.gitignore',
      'some-file',
    ];

    readdirSyncMock.mockReturnValue([...expectedFiles, 'ignored.js']);
    readFileSync.mockReturnValue(Buffer.from('*.js'));
    statSyncMock.mockReturnValue(statFake(STAT_FAKE_TYPES.FILE));

    // Act
    const result = await underTest.readDir('root');

    // Assert
    expect(result).toEqual(expectedFiles);
  });

  it('should filter a file which when it has a matching rule in a nested .gitignore', async () => {
    // Arrange
    const expectedFiles = [
      '.gitignore',
      'child/.gitignore',
      'child/some-file',
    ];

    readdirSyncMock.mockReturnValueOnce(['.gitignore', 'child']);
    statSyncMock.mockReturnValueOnce(statFake(STAT_FAKE_TYPES.FILE));
    statSyncMock.mockReturnValueOnce(statFake(STAT_FAKE_TYPES.DIR));
    readFileSync.mockReturnValueOnce(Buffer.from(''));

    readdirSyncMock.mockReturnValueOnce(['.gitignore', 'some-file', 'ignore.js']);
    statSyncMock.mockReturnValue(statFake(STAT_FAKE_TYPES.FILE));
    readFileSync.mockReturnValueOnce(Buffer.from('*.js'));


    // Act
    const result = await underTest.readDir('root');

    // Assert
    expect(result).toEqual(expectedFiles);
  });

  it('should respect rules in the parent .gitignore when they are not overwritten in the child .gitignore', async () => {
    // Arrange
    const expectedFiles = [
      '.gitignore',
      'child/.gitignore',
      'child/some-file',
    ];

    readdirSyncMock.mockReturnValueOnce(['.gitignore', 'child']);
    statSyncMock.mockReturnValueOnce(statFake(STAT_FAKE_TYPES.FILE));
    statSyncMock.mockReturnValueOnce(statFake(STAT_FAKE_TYPES.DIR));
    readFileSync.mockReturnValueOnce(Buffer.from('*.js'));

    readdirSyncMock.mockReturnValueOnce(['.gitignore', 'some-file', 'ignore.js']);
    statSyncMock.mockReturnValue(statFake(STAT_FAKE_TYPES.FILE));
    readFileSync.mockReturnValueOnce(Buffer.from(''));


    // Act
    const result = await underTest.readDir('root');

    // Assert
    expect(result).toEqual(expectedFiles);
  });

  it('should respect precedence and allow rules to be overwritten by child .gitignores', async () => {
    // Arrange
    const expectedFiles = [
      '.gitignore',
      'child/.gitignore',
      'child/some-file',
      'child/not-ignored.js',
    ];

    readdirSyncMock.mockReturnValueOnce(['.gitignore', 'child']);
    statSyncMock.mockReturnValueOnce(statFake(STAT_FAKE_TYPES.FILE));
    statSyncMock.mockReturnValueOnce(statFake(STAT_FAKE_TYPES.DIR));
    readFileSync.mockReturnValueOnce(Buffer.from('*.js'));

    readdirSyncMock.mockReturnValueOnce(['.gitignore', 'some-file', 'not-ignored.js']);
    statSyncMock.mockReturnValue(statFake(STAT_FAKE_TYPES.FILE));
    readFileSync.mockReturnValueOnce(Buffer.from('!*.js'));


    // Act
    const result = await underTest.readDir('root');

    // Assert
    expect(result).toEqual(expectedFiles);
  });

  enum STAT_FAKE_TYPES {
    FILE = 'FILE',
    DIR = 'DIR',
    OTHER = 'OTHER',
  }

  const statFake = (type: STAT_FAKE_TYPES) => {
    switch (type) {
      case STAT_FAKE_TYPES.DIR:
        return {
          isFile: () => false,
          isDirectory: () => true,
        };
      case STAT_FAKE_TYPES.FILE:
        return {
          isFile: () => true,
          isDirectory: () => false,
        };
      default:
        throw new Error();
    }
  };
});
