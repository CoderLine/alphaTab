import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';

/**
 * Represents a stream of binary data that can be read from.
 * @public
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

/**
 * Thrown whenever we hit the end of input data unexpectedly.
 * @public
 */
export class EndOfReaderError extends AlphaTabError {
    public constructor() {
        super(AlphaTabErrorType.Format, 'Unexpected end of data within reader');
    }
}

/**
 * Thrown whenever an overflow in data or buffer sizes is detected.
 * @public
 */
export class OverflowError extends AlphaTabError {
    public constructor(message: string) {
        super(AlphaTabErrorType.Format, message);
    }
}

/**
 * An {@see IReadable} implementation throwing when the end of stream is reached guarding against
 * corrupted or maliciously crafted files leading to endless reading
 * @internal
 */
export class ThrowingReadable implements IReadable {
    private _readable: IReadable;
    public constructor(readable: IReadable) {
        this._readable = readable;
    }
    public get position(): number {
        return this._readable.position;
    }

    public set position(value: number) {
        this._readable.position = value;
    }

    public get length(): number {
        return this._readable.length;
    }

    public reset(): void {
        this._readable.reset();
    }

    public skip(offset: number): void {
        this._readable.skip(offset);
    }

    private _requireBytes(bytes: number) {
        const remaining = this.length - this.position;
        if (remaining < bytes) {
            throw new EndOfReaderError();
        }
    }

    public readByte(): number {
        this._requireBytes(1);
        return this._readable.readByte();
    }

    public read(buffer: Uint8Array, offset: number, count: number): number {
        this._requireBytes(count);
        return this._readable.read(buffer, offset, count);
    }

    public readAll(): Uint8Array {
        return this._readable.readAll();
    }
}
