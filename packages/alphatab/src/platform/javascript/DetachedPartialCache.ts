/**
 * Keeps the most recently detached render partials up to an area budget. Beyond the budget the
 * oldest entries are handed to the release callback, but never the `minKept` most recent ones.
 * @target web
 * @internal
 */
export class DetachedPartialCache<T> {
    private _entries: Map<T, number> = new Map<T, number>();
    private _area: number = 0;
    private _release: (item: T) => void;

    /**
     * The total area (in CSS pixels²) of detached partials kept.
     */
    public budget: number;

    /**
     * The number of most recently detached partials that are kept regardless of the budget.
     */
    public minKept: number;

    public constructor(budget: number, minKept: number, release: (item: T) => void) {
        this.budget = budget;
        this.minKept = minKept;
        this._release = release;
    }

    public get size(): number {
        return this._entries.size;
    }

    public get area(): number {
        return this._area;
    }

    public has(item: T): boolean {
        return this._entries.has(item);
    }

    /**
     * Registers an item as most recently detached and releases the oldest items exceeding the budget.
     */
    public add(item: T, area: number): void {
        this.remove(item);
        this._entries.set(item, area);
        this._area += area;
        this.trim();
    }

    /**
     * Forgets an item without releasing it.
     * @returns whether the item was kept.
     */
    public remove(item: T): boolean {
        const area = this._entries.get(item);
        if (area === undefined) {
            return false;
        }
        this._entries.delete(item);
        this._area -= area;
        return true;
    }

    /**
     * Forgets all items without releasing them.
     */
    public clear(): void {
        this._entries.clear();
        this._area = 0;
    }

    public trim(): void {
        while (this._area > this.budget && this._entries.size > this.minKept) {
            const oldest = this._entries.keys().next().value as T;
            this.remove(oldest);
            this._release(oldest);
        }
    }
}
