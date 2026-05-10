/**
 * Covers a class with a setter-only property (no matching getter).
 *
 * @public
 */
export class WriteOnly {
    private _value: number = 0;

    public set value(v: number) {
        this._value = v < 0 ? 0 : v;
    }

    public getStored(): number {
        return this._value;
    }
}
