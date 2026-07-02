/**
 * Covers arrow-function and function-expression lambda forms:
 *  - arrow with expression body
 *  - arrow returning an arrow (closure capture)
 *  - arrow forwarded into a higher-order helper
 *  - arrow with block body (multi-statement)
 *  - anonymous `function` expression as a callback
 *  - multi-parameter arrow forwarded into another callback
 *
 * @public
 */
export class Lambdas {
    public apply(value: number, fn: (x: number) => number): number {
        return fn(value);
    }

    public double(): number {
        return this.apply(5, x => x * 2);
    }

    public addN(n: number): (x: number) => number {
        return x => x + n;
    }

    public transform(items: number[], fn: (x: number) => number): number[] {
        const result: number[] = [];
        for (const item of items) {
            result.push(fn(item));
        }
        return result;
    }

    public withBlockBody(value: number): number {
        return this.apply(value, x => {
            const doubled = x * 2;
            return doubled + 1;
        });
    }

    public withFunctionExpression(value: number): number {
        return this.apply(value, function (x: number): number {
            return x - 1;
        });
    }

    public combine(a: number, b: number, fn: (x: number, y: number) => number): number {
        return fn(a, b);
    }

    public sum(a: number, b: number): number {
        return this.combine(a, b, (x, y) => x + y);
    }
}
