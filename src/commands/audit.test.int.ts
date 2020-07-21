import { v4 as uuidv4 } from 'uuid';
import { generateProject } from './__tests__/project.test.fixture';

import util from 'util';

const exec = util.promisify(require('child_process').exec);

describe('audit', () => {
  const testId = uuidv4();
  let workingDir = 'not set';

  beforeAll(async () => {
    workingDir = await generateProject(testId);
    // tslint:disable-next-line:no-console
    console.log(`test scratch dir: ${workingDir}`);
  });

  const runCli = async (args: string) => {
    return exec(`node  ../../../dist/cli.js ${args}`, { cwd: workingDir });
  };

  it('should list ownership for all files', async () => {
    const { stdout, stderr } = await runCli('audit');
    expect(stdout).toMatchSnapshot();
    expect(stderr).toMatchSnapshot();
  });
});
