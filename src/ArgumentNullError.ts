import { ArgumentError } from '@src/ArgumentError';

export class ArgumentNullError extends ArgumentError {
    public constructor(message: string, paramName?: string) {
        super(message, paramName);
    }
}
