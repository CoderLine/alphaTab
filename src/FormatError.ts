import { AlphaTabError, AlphaTabErrorType} from "@src/AlphaTabError";

/**
 * An invalid input format was detected (e.g. invalid setting values, file formats,...)
 */
export class FormatError extends AlphaTabError {
    public constructor(message: string) {
        super(AlphaTabErrorType.Format, message);
        Object.setPrototypeOf(this, FormatError.prototype);
    }
}
