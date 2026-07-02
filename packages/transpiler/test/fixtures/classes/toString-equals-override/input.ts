/**
 * Covers `toString()` and `equals(other)` methods, which the transformer
 * auto-marks as overrides of the language-level base methods.
 *
 * @public
 */
export class Point {
    public x: number = 0;
    public y: number = 0;

    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }

    public equals(other: object): boolean {
        if (other instanceof Point) {
            return this.x === other.x && this.y === other.y;
        }
        return false;
    }
}
