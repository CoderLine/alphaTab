/**
 * Constructor parameter properties (TS shorthand). Each modifier flavour
 * produces a property + an injected `this.X = x` assignment in the body.
 * A plain parameter (no modifier) stays a parameter only.
 *
 * @public
 */
export class Point {
    public constructor(
        public readonly x: number,
        public readonly y: number,
        label: string,
        private kind: string = 'cartesian'
    ) {
        this.kind = `${this.kind}:${label}`;
    }

    public summary(): string {
        return `${this.kind}(${this.x},${this.y})`;
    }
}
