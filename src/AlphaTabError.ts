export enum AlphaTabErrorType {
    General,
    Format,
    AlphaTex
}

export class AlphaTabError extends Error {
    public inner: Error | null;
    public type: AlphaTabErrorType;
    
    public constructor(type: AlphaTabErrorType, message: string | null = "", inner?: Error) {
        // @ts-ignore
        super(message ?? "", { cause: inner });
        this.type = type;
        this.inner = inner ?? null;
        Object.setPrototypeOf(this, AlphaTabError.prototype);
    }
}
