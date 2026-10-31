/**
 * Covers a locally declared `function` inside a method body, exercising
 * the transpiler's local-function lowering.
 *
 * @public
 */
export class LocalFn {
    public process(items: number[]): number {
        function double(n: number): number {
            return n * 2;
        }
        let total = 0;
        for (const item of items) {
            total += double(item);
        }
        return total;
    }
}
