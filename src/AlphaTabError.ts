export class AlphaTabError extends Error {
    public inner: Error | undefined;
    
    public constructor(message: string, inner?: Error) {
        super(message);
        this.inner = inner;
        Object.setPrototypeOf(this, AlphaTabError.prototype);
    }
}
