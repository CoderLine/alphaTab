/**
 * Covers class properties using the definite-assignment assertion
 * (`name!: T`). Initialization happens in a separate method instead of
 * the constructor.
 *
 * @public
 */
export class Definite {
    public name!: string;
    public size!: number;

    public init(name: string, size: number): void {
        this.name = name;
        this.size = size;
    }
}
