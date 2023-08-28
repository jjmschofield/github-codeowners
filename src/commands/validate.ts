import { validate as assertValidRules, getOwnership } from "../lib/ownership";
import { log } from "../lib/logger";
import { FILE_DISCOVERY_STRATEGY, getFilePaths } from "../lib/file";

interface ValidateOptions {
  codeowners: string;
  dir: string;
  root: string;
  unowned: boolean;
  onlyGit: boolean;
}

export const validate = async (options: ValidateOptions) => {
  let valid = true;

  const results = await assertValidRules(options); // will throw on errors such as badly formatted rules

  if(results.duplicated.size > 0){
    log.warn('Found duplicate rules', Array.from(results.duplicated.values()));
    valid = false;
  }

  if(results.unmatched.size > 0){
    log.warn('Found rules which did not match any files', Array.from(results.unmatched.values()));
    valid = false;
  }

  if (options.unowned) {
    const strategy = options.onlyGit ? FILE_DISCOVERY_STRATEGY.GIT_LS : FILE_DISCOVERY_STRATEGY.FILE_SYSTEM;
    const filePaths = await getFilePaths(
      options.dir,
      strategy,
      options.root
    );

    const files = await getOwnership(options.codeowners, filePaths);

    for (const file of files) {
      if (file.owners.length < 1) {
        log.warn('File is not owned', file.path);
        valid = false;
      }
    }
  }

  return valid;
};
