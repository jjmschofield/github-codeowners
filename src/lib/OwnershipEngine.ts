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
    let matching : FileOwnershipMatcher | null = null;

    // Enumerate all matching rules
    for (const matcher of this.matchers) {
      // Test to see if this matcher is a hit for the file path
      if (matcher.match(filePath)) {
        // Update the selected matcher to the matching rule, this will result in later rules taking precedence
        matching = matcher;
      }
    }

    return matching ? matching.owners : [];
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
