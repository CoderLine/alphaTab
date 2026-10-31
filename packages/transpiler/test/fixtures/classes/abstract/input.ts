/**
 * Covers abstract class declarations:
 *  - abstract class with abstract methods (no body)
 *  - abstract class with a concrete method
 *  - concrete subclass that extends the abstract class
 *  - override keyword on implemented abstract methods
 *  - calling a concrete method defined on the abstract base
 *
 * @public
 */
export abstract class Shape {
    public abstract area(): number;
    public abstract perimeter(): number;

    public describe(): string {
        return `area=${this.area()}, perimeter=${this.perimeter()}`;
    }
}

/**
 * @public
 */
export class Circle extends Shape {
    private radius: number;

    public constructor(radius: number) {
        super();
        this.radius = radius;
    }

    public override area(): number {
        return 3.14159 * this.radius * this.radius;
    }

    public override perimeter(): number {
        return 2 * 3.14159 * this.radius;
    }
}
