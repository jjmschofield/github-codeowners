import { getOwnership } from './ownership';
import { OwnershipEngine } from './OwnershipEngine';
import { File } from '../file';

jest.mock('./OwnershipEngine');

describe('ownership', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getOwnership', () => {
    it('should create an engine using the specified code owners file', async () => {
      // Arrange
      const expected = 'some/file';

      // Act
      await getOwnership(expected, []);

      // Assert
      expect(OwnershipEngine.FromCodeownersFile).toHaveBeenLastCalledWith(expected);
    });

    it('should return owned files', async () => {
      // Arrange
      const expected = [
        new File({ path: 'is/not-owned', owners: ['@some/owner'] }),
        new File({ path: 'is/owned', owners: ['@some/other-owner'] }),
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

      // Act
      const paths = expected.map(f => f.path);
      const result = await getOwnership('some/file', paths);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
