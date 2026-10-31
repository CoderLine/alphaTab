/**
 * Covers interfaces and implements:
 *  - interface with method and property signatures
 *  - class that implements the interface
 *
 * @public
 */
export interface Shape {
    readonly name: string;
    area(): number;
    perimeter(): number;
}

/**
 * @public
 */
export class Rectangle implements Shape {
    public readonly name: string = 'Rectangle';
    private width: number;
    private height: number;

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public area(): number {
        return this.width * this.height;
    }

    public perimeter(): number {
        return 2 * (this.width + this.height);
    }
}
