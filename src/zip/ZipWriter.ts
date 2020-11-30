import { IOHelper } from '@src/io/IOHelper';
import { IWriteable } from '@src/io/IWriteable';
import { ZipEntry } from './ZipEntry';

class ZipCentralDirectoryHeader {
    public entry: ZipEntry;
    public localHeaderOffset: number;
    public crc32: number;

    public constructor(entry: ZipEntry, crc32: number, localHeaderOffset: number) {
        this.entry = entry;
        this.crc32 = crc32;
        this.localHeaderOffset = localHeaderOffset;
    }
}

export class ZipWriter {
    private _data: IWriteable;
    private _centralDirectoryHeaders: ZipCentralDirectoryHeader[] = [];

    public constructor(data: IWriteable) {
        this._data = data;
    }

    public writeEntry(entry: ZipEntry) {
        // 4.3.7 local file header

        const crc32 = ZipWriter.crc32(entry.data);
        this._centralDirectoryHeaders.push(new ZipCentralDirectoryHeader(entry, crc32, this._data.bytesWritten));

        // Signature
        IOHelper.writeInt32LE(this._data, ZipEntry.LocalFileHeaderSignature);
        // Version
        IOHelper.writeUInt16LE(this._data, 10);
        // Flags
        IOHelper.writeUInt16LE(this._data, 0);
        // Compression
        IOHelper.writeUInt16LE(this._data, 0);
        // last mod file time
        IOHelper.writeInt16LE(this._data, 0);
        // last mod file date
        IOHelper.writeInt16LE(this._data, 0);
        // crc-32
        IOHelper.writeInt32LE(this._data, crc32);
        // compressed size
        IOHelper.writeInt32LE(this._data, entry.data.length);
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
        this._data.write(entry.data, 0, entry.data.length);
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
        IOHelper.writeUInt16LE(this._data, 0);
        // Compression
        IOHelper.writeUInt16LE(this._data, 0);
        // last mod file time
        IOHelper.writeInt16LE(this._data, 0);
        // last mod file date
        IOHelper.writeInt16LE(this._data, 0);
        // crc-32
        IOHelper.writeInt32LE(this._data, header.crc32);
        // compressed size
        IOHelper.writeInt32LE(this._data, header.entry.data.length);
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
