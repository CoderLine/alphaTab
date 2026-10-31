/**
 * Covers control-flow statements:
 *  - if/else
 *  - for loop
 *  - while loop
 *  - switch with case and default
 *
 * @public
 */
export class ControlFlow {
    public classify(n: number): string {
        if (n < 0) {
            return 'negative';
        } else if (n === 0) {
            return 'zero';
        } else {
            return 'positive';
        }
    }

    public sum(n: number): number {
        let total = 0;
        for (let i = 0; i < n; i++) {
            total += i;
        }
        return total;
    }

    public countDown(start: number): number {
        let n = start;
        while (n > 0) {
            n--;
        }
        return n;
    }

    public dayName(day: number): string {
        switch (day) {
            case 0:
                return 'Sunday';
            case 1:
                return 'Monday';
            case 6:
                return 'Saturday';
            default:
                return 'Weekday';
        }
    }
}
