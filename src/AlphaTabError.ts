export enum AlphaTabErrorType {
    General,
    Format,
    AlphaTex
}

export class AlphaTabError extends Error {
    public type: AlphaTabErrorType;
    
    public constructor(type: AlphaTabErrorType, message: string | null = "", inner?: Error) {
        super(message ?? "", { cause: inner });
        this.type = type;
        Object.setPrototypeOf(this, AlphaTabError.prototype);
    }
}
