import { v4 as uuidv4 } from 'uuid';
import fixtures from './__fixtures__/default';
import { generateProject } from './__fixtures__/project-builder.test.helper';

import util from 'util';

const exec = util.promisify(require('child_process').exec);

describe('who', () => {
  const testId = uuidv4();

  let testDir = 'not set';

  beforeAll(async () => {
    testDir = await generateProject(testId, fixtures);
    // tslint:disable-next-line:no-console
    console.log(`test scratch dir: ${testDir}`);
  });

  const runCli = async (args: string) => {
    return exec(`node  ../../../dist/cli.js ${args}`, { cwd: testDir });
  };

  it('should list ownership for one file', async () => {
    const { stdout, stderr } = await runCli('who default-wildcard-owners.md');
    expect(stdout).toMatchSnapshot('stdout');
    expect(stderr).toMatchSnapshot('stderr');
  });

  it('should list ownership for multiple files', async () => {
    const { stdout, stderr } = await runCli('who explicit-ignore.js default-wildcard-owners.md');
    expect(stdout).toMatchSnapshot('stdout');
    expect(stderr).toMatchSnapshot('stderr');
  });
});
