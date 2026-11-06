/**
 * Covers tuples of three items as element type and in a destructuring loop.
 *
 * @public
 */
export class TupleThreeItems {
    public sum(items: [number, number, number[]][]): number {
        let total = 0;
        for (const [a, b, c] of items) {
            total += a + b + c.length;
        }
        return total;
    }

    public create(): [number, number, number[]][] {
        return [[1, 2, [3]]];
    }
}
