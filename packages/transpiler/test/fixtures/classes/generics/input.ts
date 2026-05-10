/**
 * Covers generic class and method declarations:
 *  - generic class with unconstrained type parameter T
 *  - generic class with constrained type parameter T extends SomeBase
 *  - generic static method on a non-generic class
 *  - instantiating a generic class
 *
 * @public
 */
export class Box<T> {
    private value: T;

    public constructor(value: T) {
        this.value = value;
    }

    public get(): T {
        return this.value;
    }

    public set(value: T): void {
        this.value = value;
    }
}

/**
 * @public
 */
export class Comparable {
    public score: number = 0;
}

/**
 * @public
 */
export class MinBox<T extends Comparable> {
    private items: T[] = [];

    public add(item: T): void {
        this.items.push(item);
    }

    public min(): T | null {
        if (this.items.length === 0) {
            return null;
        }
        let best: T = this.items[0];
        for (const item of this.items) {
            if (item.score < best.score) {
                best = item;
            }
        }
        return best;
    }
}

/**
 * @public
 */
export class Utils {
    public static identity<T>(value: T): T {
        return value;
    }
}
