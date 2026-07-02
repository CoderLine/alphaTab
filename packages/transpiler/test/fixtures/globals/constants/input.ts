/**
 * Top-level constants and mutable globals.
 *
 * @public
 */
export const MAX_RETRIES: number = 5;

/**
 * @internal
 */
export const PREFIX: string = 'data-';

/**
 * @internal
 */
export let counter: number = 0;

/**
 * @public
 */
export class Manager {
    public attempt(): number {
        counter = counter + 1;
        return MAX_RETRIES - counter;
    }

    public label(): string {
        return PREFIX + 'value';
    }
}
