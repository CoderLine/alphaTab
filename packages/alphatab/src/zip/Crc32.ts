/**
 * CRC-32 (ISO-HDLC, the variant used by ZIP): reflected polynomial 0xEDB88320, initial value and final xor 0xFFFFFFFF.
 *
 * The checksum is kept as signed 32-bit integer: values at or above 2^31 would not survive the
 * integer conversions in the C# and Kotlin builds (see the rules in DeflateFormat).
 * @internal
 */
export class Crc32 {
    private static _table: Int32Array | null = null;

    private static _buildTable(): Int32Array {
        const table = new Int32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) {
                // -306674912 is 0xEDB88320, the mask turns the signed shift into a logical one
                c = (c & 1) !== 0 ? -306674912 ^ ((c >> 1) & 0x7fffffff) : (c >> 1) & 0x7fffffff;
            }
            table[n] = c;
        }
        return table;
    }

    private _crc: number = -1;

    /**
     * The checksum of the data added so far (signed 32-bit integer).
     */
    public get value(): number {
        return ~this._crc;
    }

    /**
     * Adds a portion of the given data to the checksum.
     * @param data The array containing the data to add
     * @param offset Range start for data (inclusive)
     * @param count The number of bytes to add starting from offset
     */
    public update(data: Uint8Array, offset: number, count: number) {
        let table = Crc32._table;
        if (!table) {
            table = Crc32._buildTable();
            Crc32._table = table;
        }
        let c = this._crc;
        const end = offset + count;
        for (let i = offset; i < end; i++) {
            c = table[(c ^ data[i]) & 0xff] ^ ((c >> 8) & 0xffffff);
        }
        this._crc = c;
    }

    /**
     * Resets the checksum as if no data was added.
     */
    public reset() {
        this._crc = -1;
    }
}
