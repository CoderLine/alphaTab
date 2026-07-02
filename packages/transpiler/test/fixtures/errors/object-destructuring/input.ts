/**
 * @internal
 */
interface Point {
    x: number;
    y: number;
}

/**
 * @public
 */
export class ObjectDestructuring {
    public extract(point: Point): number {
        const { x, y } = point;
        return x + y;
    }
}
