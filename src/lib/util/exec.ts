import { exec as realExec } from 'child_process';
import { promisify } from 'util';

export const exec = promisify(realExec);
