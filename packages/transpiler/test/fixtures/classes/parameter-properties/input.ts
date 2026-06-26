/**
 * Covers method parameter property variants:
 *  - optional parameter `x?: T`
 *  - default-value parameter `x: T = ...`
 *  - rest parameter `...xs: T[]`
 *
 * @public
 */
export class ParameterProperties {
    public maybe(x?: number): number {
        return x ?? 0;
    }

    public defaulted(x: number = 10): number {
        return x;
    }

    public rest(...xs: number[]): number {
        let total = 0;
        for (const x of xs) {
            total += x;
        }
        return total;
    }
}
