import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import type { IWriteable } from '@coderline/alphatab/io/IWriteable';
import { Crc32 } from '@coderline/alphatab/zip/Crc32';
import { Deflater } from '@coderline/alphatab/zip/Deflater';
import { ZipEntry } from '@coderline/alphatab/zip/ZipEntry';

/**
 * @internal
 */
class ZipCentralDirectoryHeader {
    public entry: ZipEntry;
    public localHeaderOffset: number;
    public compressedSize: number;
    public crc32: number;
    public compressionMode: number;

    public constructor(
        entry: ZipEntry,
        crc32: number,
        localHeaderOffset: number,
        compressionMode: number,
        compressedSize: number
    ) {
        this.entry = entry;
        this.crc32 = crc32;
        this.localHeaderOffset = localHeaderOffset;
        this.compressionMode = compressionMode;
        this.compressedSize = compressedSize;
    }
}

/**
 * @internal
 */
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

        const crc = new Crc32();
        crc.update(entry.data, 0, entry.data.length);
        const crc32 = crc.value;
        const compressedDataArray = this._deflater.deflate(entry.data);
        const directoryHeader = new ZipCentralDirectoryHeader(
            entry,
            crc32,
            this._data.bytesWritten,
            compressionMode,
            compressedDataArray.length
        );
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

    public end() {
        const startOfCentralDirectory = this._data.bytesWritten;
        for (const header of this._centralDirectoryHeaders) {
            this._writeCentralDirectoryHeader(header);
        }
        const endOfCentralDirectory = this._data.bytesWritten;

        this._writeEndOfCentralDirectoryRecord(startOfCentralDirectory, endOfCentralDirectory);
    }

    private _writeEndOfCentralDirectoryRecord(startOfCentralDirectory: number, endOfCentralDirectory: number) {
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

    private _writeCentralDirectoryHeader(header: ZipCentralDirectoryHeader) {
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
