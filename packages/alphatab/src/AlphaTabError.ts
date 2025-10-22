/**
 * @public
 */
export enum AlphaTabErrorType {
    General = 0,
    Format = 1,
    AlphaTex = 2
}

/**
 * @public
 */
export class AlphaTabError extends Error {
    public type: AlphaTabErrorType;

    public constructor(type: AlphaTabErrorType, message: string | null = '', inner?: Error) {
        super(message ?? '', { cause: inner });
        this.type = type;
    }
}
