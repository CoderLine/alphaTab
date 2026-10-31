/**
 * @public
 */
export class UnknownCast {
    public coerce(value: unknown): number {
        return value as number;
    }

    public coerceWithDefault(value: unknown): number {
        const n = value as number;
        return n + 1;
    }
}
