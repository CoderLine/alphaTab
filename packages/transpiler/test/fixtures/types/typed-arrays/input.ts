/**
 * @public
 */
export class TypedArrays {
    public bytes: Uint8Array = new Uint8Array(0);
    public floats: Float32Array = new Float32Array(0);
    public signedBytes: Int8Array = new Int8Array(0);
    public shorts: Int16Array = new Int16Array(0);
    public unsignedShorts: Uint16Array = new Uint16Array(0);

    public byteAt(i: number): number {
        return this.bytes[i];
    }

    public makeBuffer(size: number): Uint8Array {
        return new Uint8Array(size);
    }

    public resetSigned(size: number): void {
        this.signedBytes = new Int8Array(size);
        this.signedBytes.fill(-1);
        this.signedBytes[0] = -128;
        this.shorts = new Int16Array(size);
        this.shorts.fill(-1);
        this.shorts.set(this.shorts.subarray(0, 1), 1);
        this.unsignedShorts.fill(0);
    }
}
