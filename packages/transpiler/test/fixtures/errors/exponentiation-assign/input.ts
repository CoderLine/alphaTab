/**
 * @public
 */
export class ExponentAssign {
    public power(a: number, b: number): number {
        let x: number = a;
        x **= b;
        return x;
    }
}
