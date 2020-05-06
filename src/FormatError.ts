import { AlphaTabError } from "@src/AlphaTabError";

/**
 * An invalid input format was detected (e.g. invalid setting values, file formats,...)
 */
export class FormatError extends AlphaTabError {
    public constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, FormatError.prototype);
    }
}
