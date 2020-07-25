import { v4 as uuidv4 } from 'uuid';
import { generateProject } from './__fixtures__/project.fixture';

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

  const outputs = ['simple', 'jsonl', 'csv'];

  for (const output of outputs) {
    describe(output, () => {
      it('should list ownership for all files', async () => {
        const { stdout, stderr } = await runCli(`audit -o ${output}`);
        expect(stdout).toMatchSnapshot('stdout');
        expect(stderr).toMatchSnapshot('stderr');
      });

      it('should calculate stats when asked', async () => {
        const { stdout, stderr } = await runCli(`audit -s -o ${output}`);
        expect(stdout).toMatchSnapshot('stdout');
        expect(stderr).toMatchSnapshot('stderr');
      });

      it('should show only unloved files when asked', async () => {
        const { stdout, stderr } = await runCli(`audit -u -o ${output}`);
        expect(stdout).toMatchSnapshot('stdout');
        expect(stderr).toMatchSnapshot('stderr');
      });

      it('should use a specific root when asked', async () => {
        const { stdout, stderr } = await runCli(`audit -r apps -o ${output}`);
        expect(stdout).toMatchSnapshot('stdout');
        expect(stderr).toMatchSnapshot('stderr');
      });

      it('should do all commands in combination when asked', async () => {
        const { stdout, stderr } = await runCli(`audit -us -r apps -o ${output}`);
        expect(stdout).toMatchSnapshot('stdout');
        expect(stderr).toMatchSnapshot('stderr');
      });
    });
  }
});
