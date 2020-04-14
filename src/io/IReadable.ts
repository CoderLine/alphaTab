/**
 * Represents a stream of binary data that can be read from.
 */
export interface IReadable {
    /**
     * Gets or sets the current read position relative in the stream.
     */
    position: number;

    /**
     * Gets the total number of bytes contained in the stream.
     */
    readonly length: number;

    /**
     * Resets the stream for reading the data from the beginning.
     */
    reset(): void;

    /**
     * Skip the given number of bytes.
     * @param offset The number of bytes to skip.
     */
    skip(offset: number): void;

    /**
     * Read a single byte from the data stream.
     * @returns The value of the next byte or -1 if there is no more data.
     */
    readByte(): number;

    /**
     * Reads the given number of bytes from the stream into the given buffer.
     * @param buffer The buffer to fill.
     * @param offset The offset in the buffer where to start writing.
     * @param count The number of bytes to read.
     * @returns
     */
    read(buffer: Uint8Array, offset: number, count: number): number;

    /**
     * Reads the remaining data.
     * @returns
     */
    readAll(): Uint8Array;
}
