class Logger {
  public error(msg: string, error?: Error): void {
    // tslint:disable-next-line:no-console
    console.error(msg, error);
  }

  public warn(msg: string, error?: Error): void {
    // tslint:disable-next-line:no-console
    console.warn(msg, error);
  }
}

export const log = new Logger();
