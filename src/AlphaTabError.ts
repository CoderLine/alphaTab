export enum AlphaTabErrorType {
    General,
    Format,
    AlphaTex
}

export class AlphaTabError extends Error {
    public inner: Error | null;
    public type: AlphaTabErrorType;
    
    public constructor(type: AlphaTabErrorType, message: string, inner?: Error) {
        super(message);
        this.type = type;
        this.inner = inner ?? null;
        Object.setPrototypeOf(this, AlphaTabError.prototype);
    }
}
