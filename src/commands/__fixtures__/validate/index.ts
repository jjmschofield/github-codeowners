import path from 'path';

import { FixturePaths } from '../types';

const paths: FixturePaths = {
  files: path.resolve(__dirname, 'files.json'),
  codeowners: path.resolve(__dirname, 'owners'),
  gitignores: [],
};

export const invalidOwnerFixtures: FixturePaths = {
  ...paths,
  codeowners: path.resolve(__dirname, 'owners-invalid-format'),
};

export default paths;
