import path from 'path';

import { FixturePaths } from '../types';

// Sets up a full project which will ensure compliance against the following:
// - codenames spec https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners#codeowners-syntax)
// - gitignore spec https://git-scm.com/docs/gitignore
const paths: FixturePaths = {
  files: path.resolve(__dirname, 'files.json'),
  codeowners: path.resolve(__dirname, 'owners'),
  gitignores: [
    {
      in: path.resolve(__dirname, 'gitignore'),
      out: '.gitignore',
    },
    {
      in: path.resolve(__dirname, 'gitignore-deep'),
      out: 'deep/nested-ignore/.gitignore',
    },
  ],
};

export default paths;
