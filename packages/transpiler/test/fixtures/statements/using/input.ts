/**
 * Minimal disposable resource for the `using` fixture. We avoid declaring
 * `implements Disposable` because the transpiler does not currently
 * support Symbol.dispose computed method names; the `dispose()` method
 * below is what the emitter understands.
 *
 * @public
 */
export class Resource {
    public dispose(): void {
        // close
    }
}

/**
 * Minimal async-disposable resource for the `await using` fixture.
 *
 * @public
 */
export class AsyncResource {
    public async disposeAsync(): Promise<void> {
        // close
    }
}

/**
 * Covers `using` and `await using` declarations introduced by ECMAScript
 * explicit resource management.
 *
 * @public
 */
export class UsingExample {
    public doStuff(): void {
        using r = new Resource() as unknown as Disposable;
    }

    public async doStuffAsync(): Promise<void> {
        await using r = new AsyncResource() as unknown as AsyncDisposable;
    }
}
