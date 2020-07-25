import { FixturePaths } from './types';

const fs = require('fs');
const path = require('path');

export const generateProject = async (testId: string, fixtures: FixturePaths) => {
  const testDir = path.resolve('tests', 'scratch', testId);

  await createFiles(testDir, fixtures.files);

  await createCodeowners(testDir, fixtures.codeowners);

  await createGitIgnores(testDir, fixtures.gitignores);

  return testDir;
};

const createFiles = async (cwd: string, fixturePath: string) => {
  const { files } = JSON.parse(await fs.promises.readFile(fixturePath));


  for (const file of files) {
    const dir = path.join(cwd, path.dirname(file.path));
    const fileName = path.basename(file.path);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(path.join(dir, fileName), 'some line');
  }
};

const createCodeowners = async (cwd: string, fixturePath: string) => {
  const owners = await fs.promises.readFile(fixturePath);
  await fs.promises.mkdir(path.join(cwd, '.github'), { recursive: true });
  await fs.promises.writeFile(path.join(cwd, '.github', 'CODEOWNERS'), owners);
};

const createGitIgnores = async (cwd: string, fixturePaths: {in: string, out: string}[]) => {
  for(const paths of fixturePaths){
    const fixture = await fs.promises.readFile(paths.in);
    await fs.promises.writeFile(path.join(cwd, paths.out), fixture);
  }
};
