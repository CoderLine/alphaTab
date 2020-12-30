import { IReadable } from '@src/io/IReadable';
import { IWriteable } from '@src/io/IWriteable';

export class ByteBuffer implements IWriteable, IReadable {
    private _buffer!: Uint8Array;
    private _capacity: number = 0;

    public length: number = 0;
    public position: number = 0;

    public get bytesWritten(): number {
        return this.position;
    }

    public getBuffer(): Uint8Array {
        return this._buffer;
    }

    public static empty(): ByteBuffer {
        return ByteBuffer.withCapacity(0);
    }

    public static withCapacity(capacity: number): ByteBuffer {
        let buffer: ByteBuffer = new ByteBuffer();
        buffer._buffer = new Uint8Array(capacity);
        buffer._capacity = capacity;
        return buffer;
    }

    public static fromBuffer(data: Uint8Array): ByteBuffer {
        let buffer: ByteBuffer = new ByteBuffer();
        buffer._buffer = data;
        buffer._capacity = buffer.length = data.length;
        return buffer;
    }

    public static fromString(contents: string): ByteBuffer {
        let byteArray: Uint8Array = new Uint8Array(contents.length);
        for (let i: number = 0; i < contents.length; i++) {
            byteArray[i] = contents.charCodeAt(i);
        }
        return ByteBuffer.fromBuffer(byteArray);
    }

    public reset(): void {
        this.position = 0;
    }

    public skip(offset: number): void {
        this.position += offset;
    }

    private setCapacity(value: number): void {
        if (value !== this._capacity) {
            if (value > 0) {
                let newBuffer: Uint8Array = new Uint8Array(value);
                if (this.length > 0) {
                    newBuffer.set(this._buffer.subarray(0, 0 + this.length), 0);
                }
                this._buffer = newBuffer;
            }
            this._capacity = value;
        }
    }

    public readByte(): number {
        let n: number = this.length - this.position;
        if (n <= 0) {
            return -1;
        }
        return this._buffer[this.position++];
    }

    public read(buffer: Uint8Array, offset: number, count: number): number {
        let n: number = this.length - this.position;
        if (n > count) {
            n = count;
        }
        if (n <= 0) {
            return 0;
        }
        if (n <= 8) {
            let byteCount: number = n;
            while (--byteCount >= 0) {
                buffer[offset + byteCount] = this._buffer[this.position + byteCount];
            }
        } else {
            buffer.set(this._buffer.subarray(this.position, this.position + n), offset);
        }
        this.position += n;
        return n;
    }

    public writeByte(value: number): void {
        let buffer: Uint8Array = new Uint8Array(1);
        buffer[0] = value;
        this.write(buffer, 0, 1);
    }

    public write(buffer: Uint8Array, offset: number, count: number): void {
        let i: number = this.position + count;
        if (i > this.length) {
            if (i > this._capacity) {
                this.ensureCapacity(i);
            }
            this.length = i;
        }
        if (count <= 8 && buffer !== this._buffer) {
            let byteCount: number = count;
            while (--byteCount >= 0) {
                this._buffer[this.position + byteCount] = buffer[offset + byteCount];
            }
        } else {
            let count1: number = Math.min(count, buffer.length - offset);
            this._buffer.set(buffer.subarray(offset, offset + count1), this.position);
        }
        this.position = i;
    }

    private ensureCapacity(value: number): void {
        if (value > this._capacity) {
            let newCapacity: number = value;
            if (newCapacity < 256) {
                newCapacity = 256;
            }
            if (newCapacity < this._capacity * 2) {
                newCapacity = this._capacity * 2;
            }
            this.setCapacity(newCapacity);
        }
    }

    public readAll(): Uint8Array {
        return this.toArray();
    }

    public toArray(): Uint8Array {
        let copy: Uint8Array = new Uint8Array(this.length);
        copy.set(this._buffer.subarray(0, 0 + this.length), 0);
        return copy;
    }
}
