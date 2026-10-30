import { SettingsSerializer } from '@coderline/alphatab/generated/SettingsSerializer';
import { type ILogger, Logger } from '@coderline/alphatab/Logger';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

describe('LoggerTests', () => {
    function written(level: LogLevel): string {
        const previousLog = Logger.log;
        const previousLevel = Logger.logLevel;
        const log = new LevelCollectingLogger();
        Logger.log = log;
        Logger.logLevel = level;
        try {
            Logger.trace('Test', 'trace');
            Logger.debug('Test', 'debug');
            Logger.info('Test', 'info');
            Logger.warning('Test', 'warning');
            Logger.error('Test', 'error');
        } finally {
            Logger.log = previousLog;
            Logger.logLevel = previousLevel;
        }
        return log.messages.join(',');
    }

    function traceEnabled(level: LogLevel): boolean {
        const previousLevel = Logger.logLevel;
        Logger.logLevel = level;
        try {
            return Logger.isTraceEnabled;
        } finally {
            Logger.logLevel = previousLevel;
        }
    }

    it('level-trace', () => {
        expect(written(LogLevel.Trace)).toBe('debug:trace,debug:debug,info:info,warning:warning,error:error');
    });

    it('level-debug', () => {
        expect(written(LogLevel.Debug)).toBe('debug:debug,info:info,warning:warning,error:error');
    });

    it('level-info', () => {
        expect(written(LogLevel.Info)).toBe('info:info,warning:warning,error:error');
    });

    it('level-warning', () => {
        expect(written(LogLevel.Warning)).toBe('warning:warning,error:error');
    });

    it('level-error', () => {
        expect(written(LogLevel.Error)).toBe('error:error');
    });

    it('level-none', () => {
        expect(written(LogLevel.None)).toBe('');
    });

    it('trace-enabled', () => {
        expect(traceEnabled(LogLevel.Trace)).toBe(true);
        expect(traceEnabled(LogLevel.None)).toBe(false);
        expect(traceEnabled(LogLevel.Debug)).toBe(false);
        expect(traceEnabled(LogLevel.Error)).toBe(false);
    });

    it('trace-from-settings', () => {
        const byName = new Settings();
        const rawName = new Map<string, unknown>();
        rawName.set('logLevel', 'trace');
        SettingsSerializer.fromJson(byName, rawName);
        expect(byName.core.logLevel).toBe(LogLevel.Trace);

        const byValue = new Settings();
        const rawValue = new Map<string, unknown>();
        rawValue.set('logLevel', -1 as number);
        SettingsSerializer.fromJson(byValue, rawValue);
        expect(byValue.core.logLevel).toBe(LogLevel.Trace);
    });
});

/**
 * @internal
 */
class LevelCollectingLogger implements ILogger {
    public readonly messages: string[] = [];

    public debug(_category: string, msg: string, ..._details: unknown[]): void {
        this.messages.push(`debug:${msg}`);
    }

    public warning(_category: string, msg: string, ..._details: unknown[]): void {
        this.messages.push(`warning:${msg}`);
    }

    public info(_category: string, msg: string, ..._details: unknown[]): void {
        this.messages.push(`info:${msg}`);
    }

    public error(_category: string, msg: string, ..._details: unknown[]): void {
        this.messages.push(`error:${msg}`);
    }
}
