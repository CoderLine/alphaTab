import type { ILogger } from '@coderline/alphatab/Logger';

/**
 * Records every warning as `category: message` and drops all other log levels.
 * @internal
 */
export class WarningCollectingLogger implements ILogger {
    public readonly warnings: string[] = [];

    public debug(_category: string, _msg: string, ..._details: unknown[]): void {}

    public warning(category: string, msg: string, ..._details: unknown[]): void {
        this.warnings.push(`${category}: ${msg}`);
    }

    public info(_category: string, _msg: string, ..._details: unknown[]): void {}

    public error(_category: string, _msg: string, ..._details: unknown[]): void {}
}
