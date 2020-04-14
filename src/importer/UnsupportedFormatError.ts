/**
 * The exception thrown by a {@link ScoreImporter} in case the
 * binary data does not contain a reader compatible structure.
 */
export class UnsupportedFormatError extends Error {
    public inner: any;

    public constructor(message: string = 'Unsupported format', inner: any = null) {
        super(message);
        this.inner = inner;
    }
}
