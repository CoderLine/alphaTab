/**
 * @target web
 */
export class Lazy<T> {
    private _factory: () => T;
    private _value: T | undefined = undefined;

    public constructor(factory: () => T) {
        this._factory = factory;
    }

    public get value(): T {
        if (this._value === undefined) {
            this._value = this._factory();
        }
        return this._value;
    }
}
