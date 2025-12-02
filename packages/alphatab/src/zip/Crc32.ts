/**
 * CRC-32 with reversed data and unreversed output
 * @internal
 */
export class Crc32 {
    private static readonly _crc32Lookup: Uint32Array = Crc32._buildCrc32Lookup();
    private static _buildCrc32Lookup(): Uint32Array {
        const poly = 0xedb88320;
        const lookup = new Uint32Array(256);
        for (let i = 0; i < lookup.length; i++) {
            let crc = i;
            for (let bit = 0; bit < 8; bit++) {
                crc = (crc & 1) === 1 ? (crc >>> 1) ^ poly : crc >>> 1;
            }
            lookup[i] = crc;
        }

        return lookup;
    }

    private static readonly _crcInit: number = 0xffffffff;

    /**
     * The CRC data checksum so far.
     */
    private _checkValue: number = Crc32._crcInit;

    /**
     * Returns the CRC data checksum computed so far.
     */
    public get value() {
        return ~this._checkValue;
    }

    /**
     * Initialise a default instance of Crc32.
     */
    public constructor() {
        this.reset();
    }

    /**
     * Update CRC data checksum based on a portion of a block of data
     * @param data The array containing the data to add
     * @param offset Range start for data (inclusive)
     * @param count The number of bytes to checksum starting from offset
     */
    public update(data: Uint8Array, offset: number, count: number) {
        for (let i = 0; i < count; i++) {
            this._checkValue =
                Crc32._crc32Lookup[(this._checkValue ^ data[offset + i]) & 0xff] ^ (this._checkValue >>> 8);
        }
    }

    /**
     * Resets the CRC data checksum as if no update was ever called.
     */
    public reset() {
        this._checkValue = Crc32._crcInit;
    }
}
