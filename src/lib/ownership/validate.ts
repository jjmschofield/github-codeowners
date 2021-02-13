import { OwnershipEngine } from './OwnershipEngine';
import { readDir } from '../file/readDir';

interface ValidationResults {
  duplicated: Set<string>;
  unmatched: Set<string>;
}

export const validate = async (options: { codeowners: string, dir: string, root?: string }): Promise<ValidationResults> => {
  const engine = OwnershipEngine.FromCodeownersFile(options.codeowners); // Validates code owner file

  const filePaths = await readDir(options.dir, ['.git']);

  for (const file of filePaths) {
    engine.calcFileOwnership(file); // Test each file against rule set
  }

  const rules = engine.getRules();

  const unique: Set<string> = new Set();
  const duplicated: Set<string> = new Set();
  const hasMatches: Set<string> = new Set();
  const unmatched: Set<string> = new Set();

  for (const { rule, matched } of rules) {
    if (!unique.has(rule)) {
      unique.add(rule);
    } else {
      duplicated.add(rule);
    }

    if (matched > 0) {
      hasMatches.add(rule);
    } else {
      unmatched.add(rule);
    }
  }

  for (const rule of unmatched) { // Where we have duplicates we get an edge condition where one version of the matcher doesn't get hit - TODO - there is no doubt a nicer way to express this
    if (hasMatches.has(rule)) {
      unmatched.delete(rule);
    }
  }

  return { duplicated, unmatched };
};
