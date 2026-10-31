/**
 * Reads the bits of a Vorbis packet, least significant bit first (Vorbis I specification, section 2).
 *
 * Reading past the end of the packet returns zero bits and sets {@link overrun}: the 'end-of-packet' condition.
 * Callers check it when it matters, e.g. a codeword is valid if it ends within the packet.
 *
 * alphaTab is transpiled to C# and Kotlin where `number` becomes a `double` and every bit operation
 * converts its operands to a 32-bit integer. To produce identical results on all platforms, the
 * Vorbis decoder follows these rules:
 * - values taking part in bit operations stay within [0, 2^31) (Huffman tree links `~node` are the only negative values),
 * - a single read is at most 24 bits so the bit buffer never exceeds 31 bits, 32-bit fields are read in parts,
 * - no `>>>` (it becomes a signed shift) and no compound bit assignments (`x >>= n`),
 * - unsigned 32-bit header values are assembled arithmetically,
 * - float buffers are `Float32Array` (there is no `Float64Array` on all platforms), integer tables `Int32Array`,
 * - no writes through `subarray` (it copies on Kotlin), no `fill` with values other than zero,
 * - every index taken from the file is validated in the setup or clamped during audio decode.
 * @internal
 */
export class VorbisBitReader {
    private _data: Uint8Array = new Uint8Array(0);
    private _pos: number = 0;
    private _end: number = 0;
    private _bits: number = 0;
    private _count: number = 0;

    /**
     * Whether more bits were consumed than the packet holds.
     */
    public get overrun(): boolean {
        return (this._pos - this._end) * 8 > this._count;
    }

    /**
     * The number of bits left in the packet.
     */
    public get remaining(): number {
        return (this._end - this._pos) * 8 + this._count;
    }

    public reset(data: Uint8Array, start: number, end: number) {
        this._data = data;
        this._pos = start;
        this._end = end;
        this._bits = 0;
        this._count = 0;
    }

    /**
     * Returns the next bits without consuming them.
     * @param count The number of bits, at most 24.
     */
    public peek(count: number): number {
        while (this._count < count) {
            const value = this._pos < this._end ? this._data[this._pos] : 0;
            this._bits = this._bits | (value << this._count);
            this._pos++;
            this._count += 8;
        }
        return this._bits & ((1 << count) - 1);
    }

    /**
     * Consumes bits which were peeked before.
     */
    public skip(count: number) {
        this._bits = this._bits >> count;
        this._count -= count;
    }

    /**
     * Reads an unsigned value of at most 24 bits.
     */
    public read(count: number): number {
        const value = this.peek(count);
        this.skip(count);
        return value;
    }

    /**
     * The number of bits needed to represent the given value (Vorbis I specification, section 9.2.1).
     */
    public static ilog(value: number): number {
        let bits = 0;
        for (let v = value; v > 0; v = v >> 1) {
            bits++;
        }
        return bits;
    }
}
