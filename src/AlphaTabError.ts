export class AlphaTabError extends Error {
    public inner: Error | null;
    
    public constructor(message: string, inner?: Error) {
        super(message);
        this.inner = inner ?? null;
        Object.setPrototypeOf(this, AlphaTabError.prototype);
    }
}
