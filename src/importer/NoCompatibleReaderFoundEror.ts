/**
 * An exception indicating no reader for importing a file could be found.
 */
export class NoCompatibleReaderFoundError extends Error {
    /**
     * Initializes a new instance of the {@link NoCompatibleReaderFoundException} class.
     */
    public constructor() {
        super('No compatible reader found');
    }
}
