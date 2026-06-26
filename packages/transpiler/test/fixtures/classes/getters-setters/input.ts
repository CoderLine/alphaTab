/**
 * Covers property accessor emission:
 *  - get/set pair
 *  - get-only (auto-promotes to a property on C# / val on Kotlin)
 *  - getter that is also tagged as a computed alias (@json_read_only path)
 *
 * @public
 */
export class Accessors {
    private _value: number = 0;

    public get value(): number {
        return this._value;
    }
    public set value(v: number) {
        this._value = v < 0 ? 0 : v;
    }

    public get doubled(): number {
        return this._value * 2;
    }

    /**
     * Computed read-only alias: kept here without @json_read_only on
     * purpose because the fixture is not run through the JSON codegen.
     * The transformer just sees a getter-only property.
     */
    public get isZero(): boolean {
        return this._value === 0;
    }
}
