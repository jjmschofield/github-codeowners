import * as fs from 'fs';
import ignore from 'ignore';
import { FileOwnershipMatcher } from './types';
import { log } from '../logger';

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
        matcher.matched++;
        return matcher.owners;
      }
    }

    return [];
  }

  public getRules(): { rule: string, matched: number }[] {
    const status: { rule: string, matched: number }[] = [];

    for (const matcher of this.matchers) {
      status.push({ rule: matcher.rule, matched: matcher.matched });
    }

    return status;
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

const createMatcherCodeownersRule = (rule: string): FileOwnershipMatcher => {
  // Split apart on spaces after removing supported trailing whitespace.
  const parts = rule.replace(/\s+$/, '').split(/\s+/);

  // The first part is expected to be the path
  const path = parts[0];

  let teamNames: string[] = [];

  // Remaining parts are expected to be team names (if any)
  if (parts.length > 1) {
    teamNames = parts.slice(1, parts.length);
    for (const name of teamNames) {
      if (!codeOwnerRegex.test(name)) {
        throw new Error(`${name} is not a valid owner name in rule ${rule}`);
      }
    }
  }

  // Create an `ignore` matcher to ape github behaviour
  const match: any = ignore().add(path);

  // Workaround for rules ending with /*
  // GitHub will not look for nested files, so we adjust the node-ignore regex
  match._rules = match._rules.map((r: any) => {
    if (r.pattern.endsWith('/*')) {
      r.regex = new RegExp(r.regex.source.replace('(?=$|\\/$)', '(?=$|[^\\/]$)'), 'i');
    }
    return r;
  });

  // Return our complete matcher
  return {
    rule,
    path,
    owners: teamNames,
    match: match.ignores.bind(match),
    matched: 0,
  };
};

// ensures that only the following patterns are allowed @octocat @octocat/kitty docs@example.com
const codeOwnerRegex = /(^@[a-zA-Z0-9_\-/]*$)|(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
