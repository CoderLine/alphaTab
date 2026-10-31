/**
 * @public
 */
export type Tup = [number, string, boolean];

/**
 * @public
 */
export class UseTup {
    public make(): Tup {
        return [1, 'a', true];
    }
}
