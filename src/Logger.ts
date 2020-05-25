import { LogLevel } from '@src/LogLevel';

export interface ILogger {
    debug(category: string, msg: string, ...details: unknown[]): void;
    warning(category: string, msg: string, ...details: unknown[]): void;
    info(category: string, msg: string, ...details: unknown[]): void;
    error(category: string, msg: string, ...details: unknown[]): void;
}

export class ConsoleLogger implements ILogger {
    public static logLevel: LogLevel = LogLevel.Info;

    private static format(category: string, msg: string): string {
        return `[AlphaTab][${category}] ${msg}`;
    }

    public debug(category: string, msg: string, ...details: unknown[]): void {
        console.debug(ConsoleLogger.format(category, msg), ...details);
    }

    public warning(category: string, msg: string, ...details: unknown[]): void {
        console.warn(ConsoleLogger.format(category, msg), ...details);
    }

    public info(category: string, msg: string, ...details: unknown[]): void {
        console.info(ConsoleLogger.format(category, msg), ...details);
    }

    public error(category: string, msg: string, ...details: unknown[]): void {
        console.error(ConsoleLogger.format(category, msg), ...details);
    }
}

export class Logger {
    public static logLevel: LogLevel = LogLevel.Info;
    public static logger:ILogger = new ConsoleLogger();

    private static shouldLog(level: LogLevel): boolean {
        return Logger.logLevel !== LogLevel.None && level >= Logger.logLevel;
    }

    public static debug(category: string, msg: string, ...details: unknown[]): void {
        if (Logger.shouldLog(LogLevel.Debug)) {
            Logger.logger.debug(category, msg, ...details);
        }
    }

    public static warning(category: string, msg: string, ...details: unknown[]): void {
        if (Logger.shouldLog(LogLevel.Warning)) {
            Logger.logger.warning(category, msg, ...details);
        }
    }

    public static info(category: string, msg: string, ...details: unknown[]): void {
        if (Logger.shouldLog(LogLevel.Info)) {
            Logger.logger.info(category, msg, ...details);
        }
    }

    public static error(category: string, msg: string, ...details: unknown[]): void {
        if (Logger.shouldLog(LogLevel.Error)) {
            Logger.logger.error(category, msg, ...details);
        }
    }
}
