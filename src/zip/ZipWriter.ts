import { IOHelper } from '@src/io/IOHelper';
import { IWriteable } from '@src/io/IWriteable';
import { ZipEntry } from './ZipEntry';

export class ZipWriter {
    private _data: IWriteable;

    public constructor(data: IWriteable) {
        this._data = data;
    }

    public writeEntry(entry: ZipEntry) {
        // 4.3.7 local file header

        // Signature
        IOHelper.writeInt32LE(this._data, ZipEntry.LocalFileHeaderSignature);
        // Version
        IOHelper.writeUInt16LE(this._data, 20 /* File is compressed using Deflate compression */);
        // Flags
        IOHelper.writeUInt16LE(this._data, 1 << 3 /* sizes in descriptor header */);
        // Compression
        IOHelper.writeUInt16LE(this._data, /*ZipEntry.CompressionMethodDeflate*/ 0);
        // last mod file time
        IOHelper.writeInt16LE(this._data, 0);
        // last mod file date
        IOHelper.writeInt16LE(this._data, 0);
        // crc-32
        IOHelper.writeInt32LE(this._data, 0);
        // compressed size
        IOHelper.writeInt32LE(this._data, 0);
        // uncompressed size
        IOHelper.writeInt32LE(this._data, 0);
        // file name length
        IOHelper.writeInt16LE(this._data, entry.fullName.length);
        // extra field length
        IOHelper.writeInt16LE(this._data, 0);
        // file name (variable size)
        const fileNameBuffer = IOHelper.stringToBytes(entry.fullName);
        this._data.write(fileNameBuffer, 0, fileNameBuffer.length);
        // extra field (variable size)
        // <empty>

        // 4.3.8 File Data
        // TODO Compression
        this._data.write(entry.data, 0, entry.data.length);
        // let z: Deflate = new Deflate();
        // let buffer: Uint8Array = new Uint8Array(65536);
        // while (true) {
        //     let bytes: number = z.writeBytes(buffer, 0, buffer.length);
        //     this._data.write(buffer, 0, bytes);
        //     if (bytes < buffer.length) {
        //         break;
        //     }
        // }

        // 4.3.9 Data Descriptor
        // 4.3.9.1
        IOHelper.writeInt32LE(this._data, ZipEntry.OptionalDataDescriptorSignature);
        // 4.3.9.3
        IOHelper.writeInt32LE(this._data, ZipWriter.crc32(entry.data)); // real crc
        IOHelper.writeInt32LE(this._data, entry.data.length); // compressed size
        IOHelper.writeInt32LE(this._data, entry.data.length); // uncompressed size
    }

    private static readonly Crc32Lookup: Uint32Array = ZipWriter.buildCrc32Lookup();
    private static buildCrc32Lookup(): Uint32Array {
        const poly = 0xedb88320;
        const lookup = new Uint32Array(256);
        lookup.forEach((_, i, self) => {
            let crc = i;
            for (let bit = 0; bit < 8; bit++) {
                crc = crc & 1 ? (crc >>> 1) ^ poly : crc >>> 1;
            }
            self[i] = crc;
        });

        return lookup;
    }

    // TypeScript definition, for reference.
    // export default function crc32( data: Buffer | Uint8Array | number[] ) {
    private static crc32(input: Uint8Array) {
        return ~input.reduce((crc, byte) => ZipWriter.Crc32Lookup[(crc ^ byte) & 0xff] ^ (crc >>> 8), 0xffffffff);
    }

    public end() {
        // TODO Central dictionary
    }
}
