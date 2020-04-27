/**
 * The exception thrown by a {@link ScoreImporter} in case the
 * binary data does not contain a reader compatible structure.
 */
export class UnsupportedFormatError extends Error {
    public inner: Error | null;

    public constructor(message: string = 'Unsupported format', inner: Error | null = null) {
        super(message);
        this.inner = inner;
    }
}
