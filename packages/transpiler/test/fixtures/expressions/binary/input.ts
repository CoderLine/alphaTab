/**
 * Exercises every operator family in CSharpAstTransformer.visitBinaryExpression:
 *  - integer bit ops (& | ^ << >> >>>) with their double-cast wrapping
 *  - compound bit-op assignment (>>=, &=, |=, ^=) and short-circuit assignment
 *    (??=) — the long bit-op decomposition block
 *  - real arithmetic (* / - %) with numeric-literal-to-double promotion
 *  - arithmetic compound assignment (-=, *=, /=, %=)
 *  - string+number concat in both directions (toInvariantString coercion)
 *  - `in` keyword -> TypeHelper.In
 *  - `instanceof` -> IsExpression
 *
 * @public
 */
export class Binary {
    public bits(a: number, b: number): number {
        return (a & 0xff) | (b << 8);
    }

    public shift(a: number): number {
        return a >> 2;
    }

    public unsignedShift(a: number): number {
        return a >>> 1;
    }

    public mask(a: number, m: number): number {
        let x = a;
        x &= m;
        x |= 0x10;
        x ^= 0xff;
        x <<= 2;
        x >>= 1;
        return x;
    }

    public arith(a: number, b: number): number {
        return a * 2 + b / 4 - 3;
    }

    public concat(n: number): string {
        return 'value=' + n;
    }

    public concatRev(n: number): string {
        return n + ' items';
    }

    public hasKey(o: object, k: string): boolean {
        return k in o;
    }

    public isError(e: object): boolean {
        return e instanceof Error;
    }

    public shortCircuit(a: number | null, b: number | null): number {
        let x = a;
        x ??= 0;
        let y = b;
        y ??= 1;
        return x + y;
    }

    public arithAssign(a: number): number {
        let x = a;
        x -= 1;
        x *= 2;
        x /= 3;
        x %= 5;
        return x;
    }

    public mod(a: number, b: number): number {
        return a % b;
    }

    public modAssign(a: number, b: number): number {
        let x = a;
        x %= b;
        return x % 7;
    }
}
