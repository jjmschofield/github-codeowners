class Logger {
  public error(msg: string, error?: Error): void {
    // tslint:disable-next-line:no-console
    console.error(msg, error);
  }
}

export const log = new Logger();
