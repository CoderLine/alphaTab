import { IOHelper } from '@src/io/IOHelper';
import { IWriteable } from '@src/io/IWriteable';
import { Deflate } from './Deflate';
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
        IOHelper.writeUInt16LE(this._data, ZipEntry.CompressionMethodDeflate);
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
        const fileNameBuffer = IOHelper.stringToBytes(entry.fullName, 'utf-8');
        this._data.write(fileNameBuffer, 0, fileNameBuffer.length);
        // extra field (variable size)
        // <empty>

        // 4.3.8 File Data
        let z: Deflate = new Deflate();
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
        IOHelper.writeInt32LE(this._data, z.crc32); // real crc
        IOHelper.writeInt32LE(this._data, z.compressedSize); // compressed size
        IOHelper.writeInt32LE(this._data, entry.data.length); // uncompressed size
    }

    public end() {
        // TODO Central dictionary
    }
}
