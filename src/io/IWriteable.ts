/**
 * Represents a writer where binary data can be written to.
 */
export interface IWriteable {

    /**
     * Gets the current number of written bytes. 
     */
    readonly bytesWritten:number;
    
    /**
     * Write a single byte to the stream.
     * @param value The value to write.
     */
    writeByte(value: number): void;

    /**
     * Write data from the given buffer.
     * @param buffer The buffer to get the data from.
     * @param offset The offset where to start reading the data.
     * @param count The number of bytes to write
     */
    write(buffer: Uint8Array, offset: number, count: number): void;
}
