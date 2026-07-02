/**
 * @public
 */
export interface Printable {
    print(): string;
}

/**
 * @public
 */
export interface Container<T> {
    get(): T;
    set(value: T): void;
}

/**
 * @public
 */
export class PrintableBox<T extends Printable> implements Container<T> {
    private _value: T;

    public constructor(value: T) {
        this._value = value;
    }

    public get(): T {
        return this._value;
    }

    public set(value: T): void {
        this._value = value;
    }

    public printValue(): string {
        return this._value.print();
    }
}
