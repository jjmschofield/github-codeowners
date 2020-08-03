import { v4 as uuidv4 } from 'uuid';
import fixtures, { invalidOwnerFixtures } from './__fixtures__/validate';
import { generateProject } from './__fixtures__/project-builder.test.helper';

import util from 'util';

const exec = util.promisify(require('child_process').exec);

describe('validate', () => {
  describe('when all owners are valid', () => {
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

    it('output the result of all validation checks', async () => {
      const { stdout, stderr } = await runCli('validate');
      expect(stdout).toMatchSnapshot('stdout');
      expect(stderr).toMatchSnapshot('stderr');
    });
  });


  describe('when owners are invalid', () => {
    const testId = uuidv4();

    let testDir = 'not set';

    beforeAll(async () => {
      testDir = await generateProject(testId, invalidOwnerFixtures);
      // tslint:disable-next-line:no-console
      console.log(`test scratch dir: ${testDir}`);
    });

    const runCli = async (args: string) => {
      return exec(`node  ../../../dist/cli.js ${args}`, { cwd: testDir });
    };

    it('should throw on invalid users', async () => {
      await expect(() => runCli('validate')).rejects.toThrow();
    });
  });
});
