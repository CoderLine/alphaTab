/**
 * Represents the progress of any data being loaded.
 */
export class ProgressEventArgs {
    /**
     * Gets the currently loaded bytes.
     */
    public readonly loaded: number;

    /**
     * Gets the total number of bytes to load.
     */
    public readonly total: number;

    /**
     * Initializes a new instance of the {@link ProgressEventArgs} class.
     * @param loaded
     * @param total
     */
    public constructor(loaded: number, total: number) {
        this.loaded = loaded;
        this.total = total;
    }
}
