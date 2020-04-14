export class ArgumentError extends Error {
    public paramName: string;

    public constructor(message: string, paramName?: string) {
        super(message);
        this.paramName = paramName ?? '';
    }
}
