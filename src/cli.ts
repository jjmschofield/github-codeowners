#!/usr/bin/env node
import * as path from 'path';

import commander from 'commander';

import { audit } from './commands/audit';
import { who } from './commands/who';
import { git } from './commands/git';
import { log } from './lib/logger';

import { OUTPUT_FORMAT } from './lib/types';

commander.command('audit')
  .description('list the owners for all files')
  .option('-d, --dir <dirPath>', 'path to VCS directory', process.cwd())
  .option('-c, --codeowners <filePath>', 'path to codeowners file (default: "<dir>/.github/CODEOWNERS")')
  .option('-o, --output <outputFormat>', `how to output format eg: ${Object.values(OUTPUT_FORMAT).join(', ')}`, OUTPUT_FORMAT.SIMPLE)
  .option('-u, --unloved', 'write unowned files only', false)
  .option('-s, --stats', 'write output stats', false)
  .option('-r, --root <rootPath>', 'the root path to filter files by', '')
  .action(async (options) => {
    try {
      if (!options.codeowners) {
        options.codeowners = path.resolve(options.dir, '.github/CODEOWNERS');
      }

      await audit(options);
    } catch (error) {
      log.error('failed to run audit command', error);
      process.exit(1);
    }
  });

commander.command('who <file>')
  .description('lists owners of a specific file')
  .option('-d, --dir <dirPath>', 'path to VCS directory', process.cwd())
  .option('-c, --codeowners <filePath>', 'path to codeowners file (default: "<dir>/.github/CODEOWNERS")')
  .option('-o, --output <outputFormat>', `how to output format eg: ${Object.values(OUTPUT_FORMAT).join(', ')}`, OUTPUT_FORMAT.SIMPLE)
  .action(async (file, options) => {
    try {
      if (!file) {
        throw new Error('a file must be defined');
      }

      options.file = file;

      if (!options.codeowners) {
        options.codeowners = path.resolve(options.dir, '.github/CODEOWNERS');
      }

      await who(options);
    } catch (error) {
      log.error('failed to run who command', error);
      process.exit(1);
    }
  });

commander.command('git [shaA] [shaB]')
  .description('lists owners of files changed between commits, a commit against head or staged against head')
  .option('-d, --dir <dirPath>', 'path to VCS directory', process.cwd())
  .option('-c, --codeowners <filePath>', 'path to codeowners file (default: "<dir>/.github/CODEOWNERS")')
  .option('-o, --output <outputFormat>', `how to output format eg: ${Object.values(OUTPUT_FORMAT).join(', ')}`, OUTPUT_FORMAT.SIMPLE)
  .option('-s, --stats', 'output stats', false)
  .action(async (shaA, shaB, options) => {
    try {
      if (!options.codeowners) {
        options.codeowners = path.resolve(options.dir, '.github/CODEOWNERS');
      }

      options.shaA = shaA;
      options.shaB = shaB;

      await git(options);
    } catch (error) {
      log.error('failed to run git command', error);
      process.exit(1);
    }
  });


if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

commander.parse(process.argv);
