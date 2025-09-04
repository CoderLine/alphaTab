import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';

/**
 * The exception thrown by a {@link ScoreImporter} in case the
 * binary data does not contain a reader compatible structure.
 */
export class UnsupportedFormatError extends AlphaTabError {
    public constructor(message: string | null = null, inner?: Error) {
        super(AlphaTabErrorType.Format, message ?? 'Unsupported format', inner);
        Object.setPrototypeOf(this, UnsupportedFormatError.prototype);
    }
}
