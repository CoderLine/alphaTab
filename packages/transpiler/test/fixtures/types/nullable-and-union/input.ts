/**
 * Inner type used by the optional-chaining test below. Kept as a named
 * class because the transformer rejects anonymous object-literal types.
 * @public
 */
export class Inner {
    public value: number = 0;
}

/**
 * Wrapping container so the chain has a real `.inner?` step. The wrapper
 * holds an optional Inner; both the wrapper and Inner.value participate
 * in the optional-chaining expression.
 * @public
 */
export class Wrapper {
    public inner: Inner | null = null;
}

/**
 * Covers nullable-via-union (`T | null`, `T | undefined`),
 * non-null assertion (`!`), nullish coalescing (`??`),
 * and optional chaining (`?.`).
 * @public
 */
export class NullableAndUnion {
    public optional: string | null = null;
    public undef: string | undefined = undefined;
    public choice: 'a' | 'b' = 'a';

    public defaulted(s: string | null): string {
        return s ?? 'fallback';
    }

    public bang(s: string | null): number {
        return s!.length;
    }

    public chain(o: Wrapper | null): number {
        return o?.inner?.value ?? -1;
    }
}
