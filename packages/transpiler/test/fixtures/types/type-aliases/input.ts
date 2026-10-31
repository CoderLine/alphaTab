/**
 * @public
 */
export type Transformer = (input: string) => string;

/**
 * A record-style data holder.
 * @record
 * @public
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * @public
 */
export class AliasUsage {
    public apply(value: string, fn: Transformer): string {
        return fn(value);
    }

    public makePoint(x: number, y: number): Point {
        return { x: x, y: y };
    }
}
