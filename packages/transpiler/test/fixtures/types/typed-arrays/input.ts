/**
 * @public
 */
export class TypedArrays {
    public bytes: Uint8Array = new Uint8Array(0);
    public floats: Float32Array = new Float32Array(0);

    public byteAt(i: number): number {
        return this.bytes[i];
    }

    public makeBuffer(size: number): Uint8Array {
        return new Uint8Array(size);
    }
}
