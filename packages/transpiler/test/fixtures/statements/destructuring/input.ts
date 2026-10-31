/**
 * Array destructuring binding against a real tuple source.
 *
 * @public
 */
export class Destructuring {
    public swap(pair: [number, number]): [number, number] {
        const [a, b] = pair;
        return [b, a];
    }

    public head(items: [number, number]): number {
        const [first] = items;
        return first;
    }
}
