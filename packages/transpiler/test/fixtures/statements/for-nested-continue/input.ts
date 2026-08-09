/**
 * @public
 */
export class ForNestedContinue {
    // Baseline: outer C-style `for` with its own `continue` — the outer step
    // must be injected before the `continue`.
    public baseline(items: number[]): number {
        let sum = 0;
        for (let i = 0; i < items.length; i++) {
            if (items[i] < 0) {
                continue;
            }
            sum += items[i];
        }
        return sum;
    }

    // Nested `for-of` with a `continue` — the outer step must NOT appear
    // before the inner `continue`.
    public nestedForOf(outer: number[], inner: number[]): number {
        let sum = 0;
        for (let i = 0; i < outer.length; i++) {
            for (const v of inner) {
                if (v < 0) {
                    continue;
                }
                sum += outer[i] + v;
            }
        }
        return sum;
    }

    // Nested `while` — same rule.
    public nestedWhile(outer: number[], target: number): number {
        let sum = 0;
        for (let i = 0; i < outer.length; i++) {
            let j = 0;
            while (j < outer.length) {
                j++;
                if (outer[j - 1] === target) {
                    continue;
                }
                sum += outer[j - 1];
            }
        }
        return sum;
    }

    // Nested `do-while` — same rule.
    public nestedDoWhile(outer: number[]): number {
        let sum = 0;
        for (let i = 0; i < outer.length; i++) {
            let j = 0;
            do {
                j++;
                if (outer[j - 1] < 0) {
                    continue;
                }
                sum += outer[j - 1];
            } while (j < outer.length);
        }
        return sum;
    }

    // Nested C-style `for` — inner's own step must be injected before its
    // `continue`, but the outer's step must NOT.
    public nestedCStyle(outer: number[], inner: number[]): number {
        let sum = 0;
        for (let i = 0; i < outer.length; i++) {
            for (let j = 0; j < inner.length; j++) {
                if (inner[j] < 0) {
                    continue;
                }
                sum += outer[i] + inner[j];
            }
        }
        return sum;
    }

    // `continue` inside a switch's case at the outer loop's level — a switch
    // is not a loop boundary, so the outer step MUST still be injected.
    public continueInSwitch(items: number[]): number {
        let sum = 0;
        for (let i = 0; i < items.length; i++) {
            switch (items[i]) {
                case 0:
                    continue;
                default:
                    sum += items[i];
                    break;
            }
        }
        return sum;
    }

    // `break` inside a nested loop must not receive step injection.
    public breakInNested(outer: number[], target: number): number {
        for (let i = 0; i < outer.length; i++) {
            for (const v of outer) {
                if (v === target) {
                    break;
                }
            }
        }
        return -1;
    }
}
