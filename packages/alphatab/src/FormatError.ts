import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';

/**
 * An invalid input format was detected (e.g. invalid setting values, file formats,...)
 * @public
 */
export class FormatError extends AlphaTabError {
    public constructor(message: string) {
        super(AlphaTabErrorType.Format, message);
    }
}
