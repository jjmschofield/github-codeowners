import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import util from 'util';

import { v4 as uuidv4 } from 'uuid';
import fixtures from './__fixtures__/default';
import { generateProject } from './__fixtures__/project-builder.test.helper';

const exec = util.promisify(child_process.exec);
const writeFile = util.promisify(fs.writeFile);

describe('audit', () => {
  let testDir = 'not set';

  const runCli = async (args: string) => {
    return exec(`node  ../../../dist/cli.js ${args}`, { cwd: testDir });
  };

  const gitTrackProject = async () => {
    await exec(`git init`, { cwd: testDir });
    await exec(`git add .`, { cwd: testDir });
    await exec(`git config user.email "github-codeowners@example.com"`, { cwd: testDir });
    await exec(`git config user.name "github-codeowners"`, { cwd: testDir });
    await exec(`git commit -m "integration tests"`, { cwd: testDir });
  };

  const outputs = ['simple', 'jsonl', 'csv'];

  for (const output of outputs) {
    describe(output, () => {
      beforeEach(async () => {
        const testId = uuidv4();
        testDir = await generateProject(testId, fixtures);
      });

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
        const { stdout, stderr } = await runCli(`audit -r deep -o ${output}`);
        expect(stdout).toMatchSnapshot('stdout');
        expect(stderr).toMatchSnapshot('stderr');
      });

      it('should only consider files tracked in git root when asked', async () => {
        // Arrange
        await gitTrackProject();
        await writeFile(path.resolve(testDir, 'git-untracked.txt'), 'not tracked in git');

        // Act
        const { stdout, stderr } = await runCli(`audit -g -o ${output}`);

        // Assert
        expect(stdout).toMatchSnapshot('stdout');
        expect(stderr).toMatchSnapshot('stderr');
      });

      it('should do all commands in combination when asked', async () => {
        const { stdout, stderr } = await runCli(`audit -us -r deep -o ${output}`);
        expect(stdout).toMatchSnapshot('stdout');
        expect(stderr).toMatchSnapshot('stderr');
      });
    });
  }
});
