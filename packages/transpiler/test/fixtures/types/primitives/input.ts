/**
 * Covers the PrimitiveType mappings: bool/string/number/void/object and
 * the @target int annotation forcing Int over Double for numeric fields.
 * @public
 */
export class Primitives {
    public flag: boolean = false;
    public name: string = '';
    public value: number = 0;
    public big: bigint = 0n;
    public anything: object | null = null;

    public concat(a: string, b: string): string {
        return a + b;
    }

    public sum(a: number, b: number): number {
        return a + b;
    }

    public toggle(b: boolean): boolean {
        return !b;
    }

    public clear(): void {
        this.flag = false;
    }
}
