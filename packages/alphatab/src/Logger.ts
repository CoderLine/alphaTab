import { LogLevel } from '@coderline/alphatab/LogLevel';

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

    /**
     * Whether trace messages are currently written.
     * @remarks
     * The library build removes `if (Logger.isTraceEnabled) { ... }` statements together with all
     * {@link Logger.trace} calls, so the guarded code must only serve the trace output.
     * @internal
     */
    public static get isTraceEnabled(): boolean {
        return Logger._shouldLog(LogLevel.Trace);
    }

    /**
     * Writes a trace message through {@link ILogger.debug}.
     * @remarks
     * The published JavaScript files do not contain the calls made by alphaTab itself.
     * @since 1.9.0
     */
    public static trace(category: string, msg: string, ...details: unknown[]): void {
        if (Logger._shouldLog(LogLevel.Trace)) {
            Logger.log.debug(category, msg, ...details);
        }
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
