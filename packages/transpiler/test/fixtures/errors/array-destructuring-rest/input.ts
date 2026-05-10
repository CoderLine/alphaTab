/**
 * @public
 */
export class ArrayDestructuringRest {
    public tail(items: [number, number, number]): number[] {
        const [, ...rest] = items;
        return rest;
    }
}
