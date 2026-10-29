/**
 * Accumulates the SVG text of one render. C# and Kotlin provide their own implementation backed by a
 * `StringBuilder`, where repeated string concatenation would copy the whole buffer on every append.
 * @target web
 * @internal
 */
export class SvgBuffer {
    private _value: string = '';

    public reset(initial: string): void {
        this._value = initial;
    }

    public append(value: string): void {
        this._value += value;
    }

    public build(): string {
        return this._value;
    }
}
