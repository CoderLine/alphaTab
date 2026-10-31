/**
 * Covers `async` methods that `await` other promise-returning methods,
 * pinning the transpiler's async/await lowering for both targets.
 *
 * @public
 */
export class AwaitExample {
    public async load(): Promise<number> {
        const value = await this.fetchValue();
        return value + 1;
    }

    public async fetchValue(): Promise<number> {
        return 42;
    }
}
