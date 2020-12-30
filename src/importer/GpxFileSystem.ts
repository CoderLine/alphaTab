import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { BitReader, EndOfReaderError } from '@src/io/BitReader';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IReadable } from '@src/io/IReadable';

/**
 * this public class represents a file within the GpxFileSystem
 */
export class GpxFile {
    public fileName: string = '';
    public fileSize: number = 0;
    public data: Uint8Array | null = null;
}

/**
 * This public class represents the file system structure
 * stored within a GPX container file.
 */
export class GpxFileSystem {
    public static readonly HeaderBcFs: string = 'BCFS';
    public static readonly HeaderBcFz: string = 'BCFZ';
    public static readonly ScoreGpif: string = 'score.gpif';
    public static readonly BinaryStylesheet: string = 'BinaryStylesheet';
    public static readonly PartConfiguration: string = 'PartConfiguration';

    /**
     * You can set a file filter method using this setter. On parsing
     * the filestructure this function can determine based on the filename
     * whether this file will be available after loading.
     * This way we can reduce the amount of memory we store.
     */
    public fileFilter: (fileName: string) => boolean;

    /**
     * Gets the list of files stored in this FileSystem.
     */
    public files: GpxFile[] = [];

    /**
     * Creates a new GpxFileSystem instance
     */
    public constructor() {
        this.files = [];
        this.fileFilter = s => {
            return true;
        };
    }

    /**
     * Load a complete FileSystem to the memory.
     * @param s the binary source to read from.
     * @returns
     */
    public load(s: IReadable): void {
        let src: BitReader = new BitReader(s);
        this.readBlock(src);
    }

    /**
     * Reads the 4 byte header as a string.
     * @param src the BitInput to read from
     * @returns a string with 4 characters representing the header.
     */
    public readHeader(src: BitReader): string {
        return this.getString(src.readBytes(4), 0, 4);
    }

    /**
     * Decompresses the given bitinput using the GPX compression format. Only use this method
     * if you are sure the binary data is compressed using the GPX format. Otherwise unexpected
     * behavior can occure.
     * @param src the bitInput to read the data from
     * @param skipHeader true if the header should NOT be included in the result byteset, otherwise false
     * @returns the decompressed byte data. if skipHeader is set to false the BCFS header is included.
     */
    public decompress(src: BitReader, skipHeader: boolean = false): Uint8Array {
        let uncompressed: ByteBuffer = ByteBuffer.empty();
        let buffer: Uint8Array;
        let expectedLength: number = this.getInteger(src.readBytes(4), 0);
        try {
            // as long we reach our expected length we try to decompress, a EOF might occure.
            while (uncompressed.length < expectedLength) {
                // compression flag
                let flag: number = src.readBits(1);
                if (flag === 1) {
                    // get offset and size of the content we need to read.
                    // compressed does mean we already have read the data and need
                    // to copy it from our uncompressed buffer to the end
                    let wordSize: number = src.readBits(4);
                    let offset: number = src.readBitsReversed(wordSize);
                    let size: number = src.readBitsReversed(wordSize);
                    // the offset is relative to the end
                    let sourcePosition: number = uncompressed.length - offset;
                    let toRead: number = Math.min(offset, size);
                    // get the subbuffer storing the data and add it again to the end
                    buffer = uncompressed.getBuffer();
                    uncompressed.write(buffer, sourcePosition, toRead);
                } else {
                    // on raw content we need to read the data from the source buffer
                    let size: number = src.readBitsReversed(2);
                    for (let i: number = 0; i < size; i++) {
                        uncompressed.writeByte(src.readByte());
                    }
                }
            }
        } catch (e) {
            if (!(e instanceof EndOfReaderError)) {
                throw e;
            }
        }
        buffer = uncompressed.getBuffer();
        let resultOffset: number = skipHeader ? 4 : 0;
        let resultSize: number = uncompressed.length - resultOffset;
        let result: Uint8Array = new Uint8Array(resultSize);
        let count: number = resultSize;
        result.set(buffer.subarray(resultOffset, resultOffset + count), 0);
        return result;
    }

    /**
     * Reads a block from the given data source.
     * @param data the data source
     * @returns
     */
    private readBlock(data: BitReader): void {
        let header: string = this.readHeader(data);
        if (header === 'BCFZ') {
            // decompress the data and use this
            // we will skip the header
            this.readUncompressedBlock(this.decompress(data, true));
        } else if (header === 'BCFS') {
            this.readUncompressedBlock(data.readAll());
        } else {
            throw new UnsupportedFormatError('Unsupported format');
        }
    }

    /**
     * Reads an uncompressed data block into the model.
     * @param data the data store to read from.
     */
    private readUncompressedBlock(data: Uint8Array): void {
        // the uncompressed block contains a list of filesystem entires
        // as long we have data we will try to read more entries
        // the first sector (0x1000 bytes) is empty (filled with 0xFF)
        // so the first sector starts at 0x1000
        // (we already skipped the 4 byte header so we don't have to take care of this)
        let sectorSize: number = 0x1000;
        let offset: number = sectorSize;
        // we always need 4 bytes (+3 including offset) to read the type
        while (offset + 3 < data.length) {
            let entryType: number = this.getInteger(data, offset);
            if (entryType === 2) {
                // file structure:
                //   offset |   type   |   size   | what
                //  --------+----------+----------+------
                //    0x04  |  string  |  127byte | FileName (zero terminated)
                //    0x83  |    ?     |    9byte | Unknown
                //    0x8c  |   int    |    4byte | FileSize
                //    0x90  |    ?     |    4byte | Unknown
                //    0x94  |   int[]  |  n*4byte | Indices of the sector containing the data (end is marked with 0)
                // The sectors marked at 0x94 are absolutely positioned ( 1*0x1000 is sector 1, 2*0x1000 is sector 2,...)
                let file: GpxFile = new GpxFile();
                file.fileName = this.getString(data, offset + 0x04, 127);
                file.fileSize = this.getInteger(data, offset + 0x8c);
                // store file if needed
                let storeFile: boolean = !this.fileFilter || this.fileFilter(file.fileName);
                if (storeFile) {
                    this.files.push(file);
                }
                // we need to iterate the blocks because we need to move after the last datasector
                let dataPointerOffset: number = offset + 0x94;
                let sector: number = 0;
                // this var is storing the sector index
                let sectorCount: number = 0;
                // we're keeping count so we can calculate the offset of the array item
                // as long we have data blocks we need to iterate them,
                let fileData: ByteBuffer | null = storeFile ? ByteBuffer.withCapacity(file.fileSize) : null;
                // tslint:disable-next-line: no-conditional-assignment
                while ((sector = this.getInteger(data, dataPointerOffset + 4 * sectorCount++)) !== 0) {
                    // the next file entry starts after the last data sector so we
                    // move the offset along
                    offset = sector * sectorSize;
                    // write data only if needed
                    if (storeFile) {
                        fileData!.write(data, offset, sectorSize);
                    }
                }
                if (storeFile) {
                    // trim data to filesize if needed
                    file.data = new Uint8Array(Math.min(file.fileSize, fileData!.length));
                    // we can use the getBuffer here because we are intelligent and know not to read the empty data.
                    let raw: Uint8Array = fileData!.toArray();
                    file.data.set(raw.subarray(0, 0 + file.data.length), 0);
                }
            }
            // let's move to the next sector
            offset += sectorSize;
        }
    }

    /**
     * Reads a zeroterminated ascii string from the given source
     * @param data the data source to read from
     * @param offset the offset to start reading from
     * @param length the max length to read
     * @returns the ascii string read from the datasource.
     */
    private getString(data: Uint8Array, offset: number, length: number): string {
        let buf: string = '';
        for (let i: number = 0; i < length; i++) {
            let code: number = data[offset + i] & 0xff;
            if (code === 0) {
                break;
                // zero terminated string
            }
            buf += String.fromCharCode(code);
        }
        return buf;
    }

    /**
     * Reads an 4 byte signed integer from the given source
     * @param data the data source to read from
     * @param offset offset the offset to start reading from
     * @returns
     */
    private getInteger(data: Uint8Array, offset: number): number {
        return (data[offset + 3] << 24) | (data[offset + 2] << 16) | (data[offset + 1] << 8) | data[offset];
    }
}
