import * as fs from 'fs';
import ignore, { Ignore } from 'ignore';
import { readDirRecursively } from './dir';

interface RuleSet {
  name: string;
  ignore: Ignore;
}

export const createGitIgnoreFilter = async (dir: string) => {
  const ruleSets = await getGitIgnoreRules(dir);

  return (filePath: string) => {
    for (const ruleSet of ruleSets) {
      if (filePath.startsWith(ruleSet.name)) {
        // const trimmedFilePath = filePath.replace(ruleSet.name, '');

        if (ruleSet.ignore.ignores(filePath)) {
          return false;
        }
        return true;
      }
    }
    return true;
  };
};

/**
 * Gathers gitignores recursively and establishes
 */
const getGitIgnoreRules = async (dir: string) => {
  const gitIgnores = await getGitIgnoreRulesRecursively(dir);
  return buildGitIgnoreRules(gitIgnores);
};

// TODO - there is probably a better way to approach this as tree problem if bugs are encountered
const buildGitIgnoreRules = (ruleSets: RuleSet[]): RuleSet[] => {
  // We order rule sets by length so that matching paths occur from outward nodes first eg
  // src/deep/deeper
  // src/deep
  // src
  const orderedRules = [...ruleSets].sort((a, b) => {
    if (a.name.length > b.name.length) return -1;
    if (a.name.length < b.name.length) return 1;
    return 0;
  });

  // Enumerate all rule sets to find rule sets in parent dirs
  // When we find one add its rules before the currently applied rules in this ruleset
  for (const ruleSet of orderedRules) {
    for (const test of orderedRules) {
      // If the ruleset is in a parent dir
      if (ruleSet.name !== test.name && ruleSet.name.startsWith(test.name)) {
        const newIgnore = ignore(); // Create a new rule set as rules in parent dirs should be applied first
        newIgnore.add(test.ignore);
        newIgnore.add(ruleSet.ignore);
        ruleSet.ignore = newIgnore; // Override rule set with concatenated rules
      }
    }
  }

  return orderedRules;
};

const getGitIgnoreRulesRecursively = async (dir: string): Promise<RuleSet[]> => {
  const filePaths = await getFilePathsRecursively(dir, '.gitignore');
  const files = await getFiles(filePaths);

  return files.map((file) => {
    return {
      name: file.filePath.replace(dir, '')
        .replace('.gitignore', '')
        .replace(/^\/+/, ''), // remove leading slash
      ignore: ignore().add(file.contents),
    };
  });
};

const getFilePathsRecursively = async (dir: string, name: string) => {
  const filePaths = await readDirRecursively(dir, ['.git']);
  return filePaths.filter(filePath => filePath.endsWith(name));
};

const getFiles = async (files: string[]): Promise<{ filePath: string, contents: string }[]> => {
  const readOps = files.map(file => fs.promises.readFile(file));

  const contents = await Promise.all(readOps);

  return files.map((file, i) => {
    return {
      filePath: file,
      contents: contents[i].toString(),
    };
  });
};
