import { OwnershipEngine } from './OwnershipEngine';
import { FileOwnershipMatcher } from './types';

describe('OwnershipEngine', () => {
  describe('calcFileOwnership', () => {
    const createFileOwnershipMatcher = (path: string, owners: string[]): FileOwnershipMatcher => {
      return {
        path,
        owners,
        match: (testPath: string) => {
          return testPath === path;
        },
      };
    };

    it('should match a path to its owners', () => {
      // Arrange
      const expectedOwners = ['@owner-1', '@owner-2'];
      const path = 'my/awesome/file.ts';

      const underTest = new OwnershipEngine([
        createFileOwnershipMatcher('some/other/path', ['@other-1']),
        createFileOwnershipMatcher(path, expectedOwners),
        createFileOwnershipMatcher('some/other/other/path', ['@other-2']),
      ]);

      // Act
      const result = underTest.calcFileOwnership(path);

      // Assert
      expect(result).toEqual(expectedOwners);
    });

    it('should should take precedence from the last matching rule', () => {
      // Arrange
      const expectedOwner = '@owner-2';
      const unexpectedOwner = '@owner-1';
      const path = 'my/awesome/file.ts';

      const underTest = new OwnershipEngine([
        createFileOwnershipMatcher(path, [unexpectedOwner]),
        createFileOwnershipMatcher(path, [expectedOwner]),
      ]);

      // Act
      const result = underTest.calcFileOwnership(path);

      // Assert
      expect(result).toContainEqual(expectedOwner);
      expect(result).not.toContainEqual(unexpectedOwner);
    });
  });
});
