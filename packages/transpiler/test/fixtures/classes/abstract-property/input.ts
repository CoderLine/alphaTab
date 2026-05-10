/**
 * Covers abstract property and abstract getter declarations:
 *  - abstract class with an abstract field
 *  - abstract class with an abstract getter
 *  - concrete subclass that overrides both
 *
 * @public
 */
export abstract class Shape {
    public abstract size: number;
    public abstract get label(): string;

    public describe(): string {
        return `${this.label}: ${this.size}`;
    }
}

/**
 * @public
 */
export class Square extends Shape {
    public override size: number;

    public constructor(size: number) {
        super();
        this.size = size;
    }

    public override get label(): string {
        return 'square';
    }
}
