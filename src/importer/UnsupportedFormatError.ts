import { AlphaTabError, AlphaTabErrorType } from "@src/AlphaTabError";

/**
 * The exception thrown by a {@link ScoreImporter} in case the
 * binary data does not contain a reader compatible structure.
 */
export class UnsupportedFormatError extends AlphaTabError {
    public inner: Error | null;

    public constructor(message: string = 'Unsupported format', inner: Error | null = null) {
        super(AlphaTabErrorType.Format, message);
        this.inner = inner;
        Object.setPrototypeOf(this, UnsupportedFormatError.prototype);
    }
}
