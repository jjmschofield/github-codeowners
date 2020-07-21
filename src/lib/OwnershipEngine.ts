import * as fs from 'fs';
import ignore from 'ignore';
import { FileOwnershipMatcher } from './types';
import { log } from './logger';

export class OwnershipEngine {
  private readonly matchers: FileOwnershipMatcher[];

  /**
   * @param matchers : FileOwnershipMatcher Matchers should be in precedence order, with overriding rules coming last
   */
  constructor(matchers: FileOwnershipMatcher[]) {
    this.matchers = matchers;
  }

  public calcFileOwnership(filePath: string): string[] {
    // We reverse the matchers so that the first matching rule encountered
    // will be the last from CODEOWNERS, respecting precedence correctly and performantly
    const matchers = [...this.matchers].reverse();

    for (const matcher of matchers) {
      if (matcher.match(filePath)) {
        return matcher.owners;
      }
    }

    return [];
  }

  public static FromCodeownersFile(filePath: string) {
    try {
      const lines = fs.readFileSync(filePath).toString().split('\n');

      const owned: FileOwnershipMatcher[] = [];

      for (const line of lines) {
        if (!line || line.startsWith('#')) {
          continue;
        }

        owned.push(createMatcherCodeownersRule(line));
      }

      return new OwnershipEngine(owned);
    } catch (error) {
      log.error(`failed to load codeowners file from ${filePath}`, error);
      throw error;
    }
  }
}

const createMatcherCodeownersRule = (rule: string) => {
  // Split apart on spaces
  const parts = rule.split(/\s+/);

  // The first part is expected to be the path
  const path = parts[0];

  let teamNames: string[] = [];

  // Remaining parts are expected to be team names (if any)
  if (parts.length > 1) {
    teamNames = parts.slice(1, parts.length);
  }

  // Create an `ignore` matcher to ape github behaviour
  const match : any = ignore().add(path);

  // Return our complete matcher
  return {
    path,
    owners: teamNames,
    match: match.ignores.bind(match),
  };
};
