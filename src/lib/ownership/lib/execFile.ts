import { execFile as realExecFile } from 'child_process';
import { promisify } from 'util';

export const execFile = promisify(realExecFile);
