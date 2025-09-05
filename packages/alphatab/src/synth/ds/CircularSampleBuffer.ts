/**
 * Represents a fixed size circular sample buffer that can be written to and read from.
 * @csharp_public
 */
export class CircularSampleBuffer {
    private _buffer: Float32Array;
    private _writePosition: number = 0;
    private _readPosition: number = 0;

    /**
     * Gets the number of samples written to the buffer.
     */
    public count: number = 0;

    /**
     * Initializes a new instance of the {@link CircularSampleBuffer} class.
     * @param size The size.
     */
    public constructor(size: number) {
        this._buffer = new Float32Array(size);
    }

    /**
     * Clears all samples written to this buffer.
     */
    public clear(): void {
        this._readPosition = 0;
        this._writePosition = 0;
        this.count = 0;
        this._buffer = new Float32Array(this._buffer.length);
    }

    /**
     * Writes the given samples to this buffer.
     * @param data The sample array to read from.
     * @param offset
     * @param count
     * @returns
     */
    public write(data: Float32Array, offset: number, count: number): number {
        let samplesWritten: number = 0;
        if (count > this._buffer.length - this.count) {
            count = this._buffer.length - this.count;
        }

        const writeToEnd: number = Math.min(this._buffer.length - this._writePosition, count);
        this._buffer.set(data.subarray(offset, offset + writeToEnd), this._writePosition);
        this._writePosition += writeToEnd;
        this._writePosition %= this._buffer.length;
        samplesWritten += writeToEnd;
        if (samplesWritten < count) {
            this._buffer.set(
                data.subarray(offset + samplesWritten, offset + samplesWritten + count - samplesWritten),
                this._writePosition
            );
            this._writePosition += count - samplesWritten;
            samplesWritten = count;
        }
        this.count += samplesWritten;
        return samplesWritten;
    }

    /**
     * Reads the requested amount of samples from the buffer.
     * @param data The sample array to store the read elements.
     * @param offset The offset within the destination buffer to put the items at.
     * @param count The number of items to read from this buffer.
     * @returns The number of items actually read from the buffer.
     */
    public read(data: Float32Array, offset: number, count: number): number {
        if (count > this.count) {
            count = this.count;
        }

        let samplesRead: number = 0;
        const readToEnd: number = Math.min(this._buffer.length - this._readPosition, count);
        data.set(this._buffer.subarray(this._readPosition, this._readPosition + readToEnd), offset);
        samplesRead += readToEnd;
        this._readPosition += readToEnd;
        this._readPosition %= this._buffer.length;

        if (samplesRead < count) {
            data.set(
                this._buffer.subarray(this._readPosition, this._readPosition + count - samplesRead),
                offset + samplesRead
            );
            this._readPosition += count - samplesRead;
            samplesRead = count;
        }

        this.count -= samplesRead;
        return samplesRead;
    }
}
