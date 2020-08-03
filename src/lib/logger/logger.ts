class Logger {
  public error(msg: string, error?: Error): void {
    // tslint:disable-next-line:no-console
    console.error(msg, error);
  }

  public warn(msg: string, obj?: Object): void {
    // tslint:disable-next-line:no-console
    console.warn(msg, obj);
  }
}

export const log = new Logger();
