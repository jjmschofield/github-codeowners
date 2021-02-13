import { validate as assertValidRules } from '../lib/ownership';
import { log } from '../lib/logger';

interface ValidateOptions {
  codeowners: string;
  dir: string;
  root: string;
}

export const validate = async (options: ValidateOptions) => {
  const results = await assertValidRules(options); // will throw on errors such as badly formatted rules

  if(results.duplicated.size > 0){
    log.warn('Found duplicate rules', Array.from(results.duplicated.values()));
  }

  if(results.unmatched.size > 0){
    log.warn('Found rules which did not match any files', Array.from(results.unmatched.values()));
  }
};
