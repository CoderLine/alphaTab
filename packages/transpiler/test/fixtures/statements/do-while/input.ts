/**
 * @public
 */
export class DoWhile {
    public sumTo(n: number): number {
        let sum = 0;
        let i = 0;
        do {
            sum += i;
            i++;
        } while (i <= n);
        return sum;
    }

    public firstPositive(start: number): number {
        let n = start;
        do {
            n++;
        } while (n <= 0);
        return n;
    }
}
