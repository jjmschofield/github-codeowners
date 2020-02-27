import * as fs from 'fs';
import ignore from 'ignore';
import { OwnedPath, OwnedPathMatcher } from './types';

export class CodeOwners {
  private readonly owned: OwnedPathMatcher[];

  constructor(owned: OwnedPathMatcher[]) {
    this.owned = owned;
  }

  public getOwners(path: string): OwnedPath {
    for (const ownedPath of this.owned) {
      if (ownedPath.match(path)) {
        return {
          path,
          owners: ownedPath.owners,
        };
      }
    }

    return {
      path,
      owners: [],
    };
  }

  public static FromFile(filePath: string) {
    try {
      const lines = fs.readFileSync(filePath).toString().split('\n');

      const owned: OwnedPathMatcher[] = [];

      for (const line of lines) {
        if (!line || line.startsWith('#')) {
          continue;
        }

        const split = line.split(/\s+/);

        const path = split[0];
        const owners = split.length > 1 ? split.slice(1, split.length) : [];
        const match: any = ignore().add(split[0]);

        owned.push({ path, owners, match: match.ignores.bind(match) });
      }

      return new CodeOwners(owned);
    } catch (error) {
      console.error(`failed to load codeowners file from ${filePath}`, error);
      throw error;
    }
  }
}
