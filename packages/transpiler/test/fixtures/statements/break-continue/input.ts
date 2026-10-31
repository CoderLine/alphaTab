/**
 * @public
 */
export class BreakContinue {
    public firstNegative(items: number[]): number {
        for (const item of items) {
            if (item < 0) {
                return item;
            }
        }
        return 0;
    }

    public sumPositive(items: number[]): number {
        let sum = 0;
        for (const item of items) {
            if (item <= 0) {
                continue;
            }
            sum += item;
        }
        return sum;
    }

    public findFirst(items: number[], target: number): number {
        let idx = -1;
        for (let i = 0; i < items.length; i++) {
            if (items[i] === target) {
                idx = i;
                break;
            }
        }
        return idx;
    }
}
