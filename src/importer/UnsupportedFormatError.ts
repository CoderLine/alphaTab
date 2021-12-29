import { AlphaTabError, AlphaTabErrorType } from "@src/AlphaTabError";

/**
 * The exception thrown by a {@link ScoreImporter} in case the
 * binary data does not contain a reader compatible structure.
 */
export class UnsupportedFormatError extends AlphaTabError {
    public override inner: Error | null;

    public constructor(message: string | null = null, inner: Error | null = null) {
        super(AlphaTabErrorType.Format, message ?? 'Unsupported format');
        this.inner = inner;
        Object.setPrototypeOf(this, UnsupportedFormatError.prototype);
    }
}
