import { LogLevel } from '@src/LogLevel';

/**
 * @public
 */
export interface ILogger {
    debug(category: string, msg: string, ...details: unknown[]): void;
    warning(category: string, msg: string, ...details: unknown[]): void;
    info(category: string, msg: string, ...details: unknown[]): void;
    error(category: string, msg: string, ...details: unknown[]): void;
}

/**
 * @public
 */
export class ConsoleLogger implements ILogger {
    public static logLevel: LogLevel = LogLevel.Info;

    private static _format(category: string, msg: string): string {
        return `[AlphaTab][${category}] ${msg}`;
    }

    public debug(category: string, msg: string, ...details: unknown[]): void {
        console.debug(ConsoleLogger._format(category, msg), ...details);
    }

    public warning(category: string, msg: string, ...details: unknown[]): void {
        console.warn(ConsoleLogger._format(category, msg), ...details);
    }

    public info(category: string, msg: string, ...details: unknown[]): void {
        console.info(ConsoleLogger._format(category, msg), ...details);
    }

    public error(category: string, msg: string, ...details: unknown[]): void {
        console.error(ConsoleLogger._format(category, msg), ...details);
    }
}

/**
 * @public
 */
export class Logger {
    public static logLevel: LogLevel = LogLevel.Info;
    public static log: ILogger = new ConsoleLogger();

    private static _shouldLog(level: LogLevel): boolean {
        return Logger.logLevel !== LogLevel.None && level >= Logger.logLevel;
    }

    public static debug(category: string, msg: string, ...details: unknown[]): void {
        if (Logger._shouldLog(LogLevel.Debug)) {
            Logger.log.debug(category, msg, ...details);
        }
    }

    public static warning(category: string, msg: string, ...details: unknown[]): void {
        if (Logger._shouldLog(LogLevel.Warning)) {
            Logger.log.warning(category, msg, ...details);
        }
    }

    public static info(category: string, msg: string, ...details: unknown[]): void {
        if (Logger._shouldLog(LogLevel.Info)) {
            Logger.log.info(category, msg, ...details);
        }
    }

    public static error(category: string, msg: string, ...details: unknown[]): void {
        if (Logger._shouldLog(LogLevel.Error)) {
            Logger.log.error(category, msg, ...details);
        }
    }
}
