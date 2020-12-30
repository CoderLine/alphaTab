import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import { IWriteable } from '@src/io/IWriteable';
import { Crc32 } from './Crc32';
import { Deflater } from './Deflater';
import { ZipEntry } from './ZipEntry';

class ZipCentralDirectoryHeader {
    public entry: ZipEntry;
    public localHeaderOffset: number;
    public compressedSize: number;
    public crc32: number;
    public compressionMode: number;

    public constructor(entry: ZipEntry,
        crc32: number,
        localHeaderOffset: number,
        compressionMode: number,
        compressedSize: number) {
        this.entry = entry;
        this.crc32 = crc32;
        this.localHeaderOffset = localHeaderOffset;
        this.compressionMode = compressionMode;
        this.compressedSize = compressedSize;
    }
}

export class ZipWriter {
    private _data: IWriteable;
    private _centralDirectoryHeaders: ZipCentralDirectoryHeader[] = [];
    private _deflater: Deflater = new Deflater();

    public constructor(data: IWriteable) {
        this._data = data;
    }

    public writeEntry(entry: ZipEntry) {
        // 4.3.7 local file header
        const compressionMode = ZipEntry.CompressionMethodDeflate;

        const compressedData = ByteBuffer.empty();
        const crc32 = this.compress(compressedData, entry.data, compressionMode);
        const compressedDataArray = compressedData.toArray();
        const directoryHeader = new ZipCentralDirectoryHeader(entry, crc32, this._data.bytesWritten, compressionMode, compressedData.length);
        this._centralDirectoryHeaders.push(directoryHeader);

        // Signature
        IOHelper.writeInt32LE(this._data, ZipEntry.LocalFileHeaderSignature);
        // Version
        IOHelper.writeUInt16LE(this._data, 10);
        // Flags
        IOHelper.writeUInt16LE(this._data, 0x0800);
        // Compression
        IOHelper.writeUInt16LE(this._data, compressionMode);
        // last mod file time
        IOHelper.writeInt16LE(this._data, 0);
        // last mod file date
        IOHelper.writeInt16LE(this._data, 0);
        // crc-32
        IOHelper.writeInt32LE(this._data, crc32);
        // compressed size
        IOHelper.writeInt32LE(this._data, compressedDataArray.length);
        // uncompressed size
        IOHelper.writeInt32LE(this._data, entry.data.length);
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
        this._data.write(compressedDataArray, 0, compressedDataArray.length);
    }

    private compress(output: IWriteable, data: Uint8Array, compressionMode: number): number {
        if (compressionMode != ZipEntry.CompressionMethodDeflate) {
            const crc = new Crc32();
            crc.update(data, 0, data.length);
            output.write(data, 0, data.length);
            return crc.value;
        } else {
            let buffer: Uint8Array = new Uint8Array(512);

            // init deflater
            this._deflater.reset();

            // write data
            this._deflater.setInput(data, 0, data.length);
            while (!this._deflater.isNeedingInput) {
                const len = this._deflater.deflate(buffer, 0, buffer.length);
                if (len <= 0) {
                    break;
                }

                output.write(buffer, 0, len);
            }

            // let deflater finish up
            this._deflater.finish();
            while (!this._deflater.isFinished) {
                const len = this._deflater.deflate(buffer, 0, buffer.length);
                if (len <= 0) {
                    break;
                }

                output.write(buffer, 0, len);
            }

            return this._deflater.inputCrc;
        }
    }

    public end() {
        const startOfCentralDirectory = this._data.bytesWritten;
        for (const header of this._centralDirectoryHeaders) {
            this.writeCentralDirectoryHeader(header);
        }
        const endOfCentralDirectory = this._data.bytesWritten;

        this.writeEndOfCentralDirectoryRecord(startOfCentralDirectory, endOfCentralDirectory);
    }

    private writeEndOfCentralDirectoryRecord(startOfCentralDirectory: number, endOfCentralDirectory: number) {
        // Signature
        IOHelper.writeInt32LE(this._data, ZipEntry.EndOfCentralDirSignature);
        // number of this disk             2 bytes
        IOHelper.writeInt16LE(this._data, 0);

        // number of the disk with the
        // start of the central directory  2 bytes
        IOHelper.writeInt16LE(this._data, 0);

        // total number of entries in the
        // central directory on this disk  2 bytes
        IOHelper.writeInt16LE(this._data, this._centralDirectoryHeaders.length);

        // total number of entries in
        // the central directory           2 bytes
        IOHelper.writeInt16LE(this._data, this._centralDirectoryHeaders.length);

        // size of the central directory   4 bytes
        IOHelper.writeInt32LE(this._data, endOfCentralDirectory - startOfCentralDirectory);

        // offset of start of central
        // directory with respect to
        // the starting disk number        4 bytes
        IOHelper.writeInt32LE(this._data, startOfCentralDirectory);

        // .ZIP file comment length        2 bytes
        IOHelper.writeInt16LE(this._data, 0);

        // .ZIP file comment       (variable size)
        // <empty>
    }

    private writeCentralDirectoryHeader(header: ZipCentralDirectoryHeader) {
        // Signature
        IOHelper.writeInt32LE(this._data, ZipEntry.CentralFileHeaderSignature);
        // version made by
        IOHelper.writeUInt16LE(this._data, 10);
        // version needed to extract
        IOHelper.writeUInt16LE(this._data, 10);
        // Flags
        IOHelper.writeUInt16LE(this._data, 0x0800);
        // Compression
        IOHelper.writeUInt16LE(this._data, header.compressionMode);
        // last mod file time
        IOHelper.writeInt16LE(this._data, 0);
        // last mod file date
        IOHelper.writeInt16LE(this._data, 0);
        // crc-32
        IOHelper.writeInt32LE(this._data, header.crc32);
        // compressed size
        IOHelper.writeInt32LE(this._data, header.compressedSize);
        // uncompressed size
        IOHelper.writeInt32LE(this._data, header.entry.data.length);
        // file name length
        IOHelper.writeInt16LE(this._data, header.entry.fullName.length);
        // extra field length
        IOHelper.writeInt16LE(this._data, 0);
        // file comment length
        IOHelper.writeInt16LE(this._data, 0);
        // disk number start
        IOHelper.writeInt16LE(this._data, 0);
        // internal file attributes
        IOHelper.writeInt16LE(this._data, 0);
        // external file attributes
        IOHelper.writeInt32LE(this._data, 0);
        // relative offset of local header
        IOHelper.writeInt32LE(this._data, header.localHeaderOffset);
        // file name (variable size)
        const fileNameBuffer = IOHelper.stringToBytes(header.entry.fullName);
        this._data.write(fileNameBuffer, 0, fileNameBuffer.length);
        // extra field (variable size)
        // <empty>
        // file comment (variable size)
        // <empty>
    }
}
