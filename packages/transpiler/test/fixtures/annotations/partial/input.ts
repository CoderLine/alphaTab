/**
 * @partial
 * @public
 */
export class Splittable {
    public name: string = '';

    public greet(): string {
        return `Hello, ${this.name}`;
    }
}
