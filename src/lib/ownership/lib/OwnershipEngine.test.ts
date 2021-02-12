import * as fs from 'fs';

import { OwnershipEngine } from './OwnershipEngine';
import { FileOwnershipMatcher } from '../types';

jest.mock('../../logger');

jest.mock('fs');
const readFileSyncMock = fs.readFileSync as jest.Mock;

describe('OwnershipEngine', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('calcFileOwnership', () => {
    const createFileOwnershipMatcher = (path: string, owners: string[]): FileOwnershipMatcher => {
      return {
        rule: `${path} ${owners.join(' ')}`,
        path,
        owners,
        match: (testPath: string) => {
          return testPath === path;
        },
        matched: 0,
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

    it('should count the number of times a rule is matched to a path', () => {
      // Arrange
      const owners = ['@owner-1', '@owner-2'];
      const path = 'my/awesome/file.ts';
      const matcher = createFileOwnershipMatcher(path, owners);

      expect(matcher.matched).toEqual(0);

      const underTest = new OwnershipEngine([matcher]);

      // Act
      underTest.calcFileOwnership(path);

      // Assert
      expect(underTest.getRules()[0].matched).toEqual(1);
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

  describe('FromCodeownersFile', () => {
    it('should not throw when provided valid owners', () => {
      // Arrange
      const codeowners = 'some/path @global-owner1 @org/octocat docs@example.com';

      readFileSyncMock.mockReturnValue(Buffer.from(codeowners));

      // Assert
      expect(() => OwnershipEngine.FromCodeownersFile('some/codeowners/file')).not.toThrow();
    });

    it('should throw when provided an invalid owner', () => {
      // Arrange
      const rulePath = 'some/path';
      const owner = '.not@valid-owner';

      const expectedError = new Error(`${owner} is not a valid owner name in rule ${rulePath} ${owner}`);

      const codeowners = `${rulePath} ${owner}`;

      readFileSyncMock.mockReturnValue(Buffer.from(codeowners));

      // Assert
      expect(() => OwnershipEngine.FromCodeownersFile('some/codeowners/file'))
        .toThrowError(expectedError);
    });

    it('should throw when provided an invalid github user as an owner', () => {
      // Arrange
      const rulePath = 'some/path';
      const owner = 'invalid-owner';

      const expectedError = new Error(`${owner} is not a valid owner name in rule ${rulePath} ${owner}`);

      const codeowners = `${rulePath} ${owner}`;

      readFileSyncMock.mockReturnValue(Buffer.from(codeowners));

      // Assert
      expect(() => OwnershipEngine.FromCodeownersFile('some/codeowners/file'))
        .toThrowError(expectedError);
    });

    it('should throw when provided an invalid email address as an owner', () => {
      // Arrange
      const rulePath = 'some/path';
      const owner = 'invalid-owner@nowhere';

      const expectedError = new Error(`${owner} is not a valid owner name in rule ${rulePath} ${owner}`);

      const codeowners = `${rulePath} ${owner}`;

      readFileSyncMock.mockReturnValue(Buffer.from(codeowners));

      // Assert
      expect(() => OwnershipEngine.FromCodeownersFile('some/codeowners/file'))
        .toThrowError(expectedError);
    });

    it('should throw when provided at least one invalid owner', () => {
      // Arrange
      const rulePath = 'some/path';
      const valid = 'valid@owner.com';
      const owner = '@invalid-owner*';

      const expectedError = new Error(`${owner} is not a valid owner name in rule ${rulePath} ${valid} ${owner}`);

      const codeowners = `${rulePath} ${valid} ${owner}`;

      readFileSyncMock.mockReturnValue(Buffer.from(codeowners));

      // Assert
      expect(() => OwnershipEngine.FromCodeownersFile('some/codeowners/file'))
        .toThrowError(expectedError);
    });
  });
});
