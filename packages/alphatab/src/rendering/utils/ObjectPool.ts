/**
 * `reset()` is invoked at acquire-time (not release-time) so callers can skip
 * zeroing slots that get immediately overwritten.
 * @internal
 */
export interface IPoolable {
    reset(): void;
}

/**
 * Bump-allocator / arena-style object pool. Callers may either pair each
 * {@link acquire} with a {@link release} or batch-acquire and call
 * {@link releaseAll} at a lifecycle boundary.
 * @internal
 */
export class ObjectPool<T extends IPoolable> {
    private readonly _items: T[] = [];
    private readonly _recycled: T[] = [];
    private _cursor: number = 0;
    private _grown: number = 0;
    private readonly _factory: () => T;

    public constructor(factory: () => T) {
        this._factory = factory;
    }

    public acquire(): T {
        let obj: T;
        if (this._recycled.length > 0) {
            obj = this._recycled.pop()!;
        } else if (this._cursor < this._items.length) {
            obj = this._items[this._cursor];
            this._cursor++;
        } else {
            obj = this._factory();
            this._items.push(obj);
            this._cursor++;
            this._grown++;
        }
        obj.reset();
        return obj;
    }

    public release(obj: T): void {
        this._recycled.push(obj);
    }

    public releaseAll(): void {
        this._cursor = 0;
        // splice(0) instead of `.length = 0` for transpiler compatibility.
        this._recycled.splice(0);
    }

    public get grownCount(): number {
        return this._grown;
    }
}
