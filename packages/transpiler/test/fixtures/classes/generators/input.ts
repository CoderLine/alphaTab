/**
 * Covers generator methods:
 *  - method declared with leading * (generator)
 *  - yield expression inside a generator
 *  - Generator<T> return type
 *  - empty generator with bare return
 *
 * @public
 */
export class Generators {
    public *range(n: number): Generator<number> {
        for (let i = 0; i < n; i++) {
            yield i;
        }
    }

    public *empty(): Generator<number> {
        return;
    }
}
