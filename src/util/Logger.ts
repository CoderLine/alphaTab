/**
 * Defines all loglevels.
 * @json
 */
export enum LogLevel {
    /**
     * No logging
     */
    None,
    /**
     * Debug level (internal details are displayed).
     */
    Debug,
    /**
     * Info level (only important details are shown)
     */
    Info,
    /**
     * Warning level
     */
    Warning,
    /**
     * Error level.
     */
    Error
}

export class Logger {
    public static logLevel: LogLevel = LogLevel.Info;

    private static format(category: string, msg: string): string {
        return `[AlphaTab][${category}] ${msg}`;
    }

    private static shouldLog(level: LogLevel): boolean {
        return Logger.logLevel !== LogLevel.None && level >= Logger.logLevel;
    }

    public static debug(category: string, msg: string, ...details: any[]): void {
        if (Logger.shouldLog(LogLevel.Debug)) {
            console.debug(Logger.format(category, msg), ...details);
        }
    }

    public static warning(category: string, msg: string, ...details: any[]): void {
        if (Logger.shouldLog(LogLevel.Warning)) {
            console.warn(Logger.format(category, msg), ...details);
        }
    }

    public static info(category: string, msg: string, ...details: any[]): void {
        if (Logger.shouldLog(LogLevel.Info)) {
            console.info(Logger.format(category, msg), ...details);
        }
    }

    public static error(category: string, msg: string, ...details: any[]): void {
        if (Logger.shouldLog(LogLevel.Error)) {
            console.error(Logger.format(category, msg), ...details);
        }
    }
}
