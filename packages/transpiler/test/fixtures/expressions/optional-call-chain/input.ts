/**
 * Tiny helper class used by the optional chaining fixture.
 *
 * @public
 */
export class Handler {
    public run(): number {
        return 0;
    }
}

/**
 * Covers optional call chaining (`obj?.method()`) and optional element
 * access (`arr?.[i]`), combined with the `??` fallback.
 *
 * @public
 */
export class OptionalCallChain {
    public maybeRun(h: Handler | null): number {
        return h?.run() ?? -1;
    }

    public maybeLookup(items: number[] | null, i: number): number {
        return items?.[i] ?? -1;
    }
}
