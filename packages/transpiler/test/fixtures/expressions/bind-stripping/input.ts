/**
 * @public
 */
export class BindStripping {
    public callback: (() => number) | null = null;

    public install(): void {
        this.callback = this.compute.bind(this);
    }

    public compute(): number {
        return 42;
    }
}
