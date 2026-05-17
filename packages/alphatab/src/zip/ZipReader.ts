import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { OverflowError, type IReadable } from '@coderline/alphatab/io/IReadable';
import { Inflate } from '@coderline/alphatab/zip/Inflate';
import { ZipEntry } from '@coderline/alphatab/zip/ZipEntry';

/**
 * @internal
 */
export class ZipReader {
    private _readable: IReadable;
    private _maxDecodingBufferSize: number;

    public constructor(readable: IReadable, maxDecodingBufferSize: number) {
        this._readable = readable;
        this._maxDecodingBufferSize = maxDecodingBufferSize;
    }

    public read(): ZipEntry[] {
        const entries: ZipEntry[] = [];
        while (true) {
            const e: ZipEntry | null = this._readEntry();
            if (!e) {
                break;
            }
            entries.push(e);
        }
        return entries;
    }

    private _readEntry(): ZipEntry | null {
        const readable: IReadable = this._readable;
        const h: number = IOHelper.readInt32LE(readable);
        if (h !== ZipEntry.LocalFileHeaderSignature) {
            return null;
        }
        // 4.3.7 local file header
        IOHelper.readUInt16LE(readable); // version

        const flags: number = IOHelper.readUInt16LE(readable);
        const compressionMethod: number = IOHelper.readUInt16LE(readable);
        const compressed: boolean = compressionMethod !== 0;
        if (compressed && compressionMethod !== ZipEntry.CompressionMethodDeflate) {
            return null;
        }

        IOHelper.readInt16LE(this._readable); // last mod file time
        IOHelper.readInt16LE(this._readable); // last mod file date
        IOHelper.readInt32LE(readable); // crc-32
        IOHelper.readInt32LE(readable); // compressed size

        const uncompressedSize: number = IOHelper.readInt32LE(readable);
        if (uncompressedSize > this._maxDecodingBufferSize) {
            throw new OverflowError(`Zip contains files exceeding the configured maxDecodingBufferSize`);
        }
        const fileNameLength: number = IOHelper.readInt16LE(readable);
        if (fileNameLength > this._maxDecodingBufferSize) {
            throw new OverflowError(`Zip contains file names exceeding the configured maxDecodingBufferSize`);
        }

        const extraFieldLength: number = IOHelper.readInt16LE(readable);

        const fname: string = IOHelper.toString(IOHelper.readByteArray(readable, fileNameLength), 'utf-8');
        readable.skip(extraFieldLength);

        // 4.3.8 File Data
        let data: Uint8Array;
        if (compressed) {
            const target: ByteBuffer = ByteBuffer.empty();
            const z: Inflate = new Inflate(this._readable);
            const buffer: Uint8Array = new Uint8Array(65536);
            while (true) {
                const bytes: number = z.readBytes(buffer, 0, buffer.length);
                target.write(buffer, 0, bytes);
                if (target.length > this._maxDecodingBufferSize) {
                    throw new OverflowError(
                        `Zip entry "${fname}" contains data exceeding the configured maxDecodingBufferSize`
                    );
                }
                if (bytes < buffer.length) {
                    break;
                }
            }
            data = target.toArray();
        } else {
            data = IOHelper.readByteArray(this._readable, uncompressedSize);
        }

        // 4.3.9 Data Descriptor
        // 4.3.9.1
        if ((flags & 8) !== 0) {
            const crc32: number = IOHelper.readInt32LE(this._readable);
            // 4.3.9.3
            if (crc32 === ZipEntry.OptionalDataDescriptorSignature) {
                IOHelper.readInt32LE(this._readable); // real crc
            }
            IOHelper.readInt32LE(this._readable); // compressed size
            IOHelper.readInt32LE(this._readable); // uncompressed size
        }

        return new ZipEntry(fname, data);
    }
}
