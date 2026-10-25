/**
 * Shared working storage for skyline merges: a merge writes its result into
 * these buffers and copies it back into the target skyline, so the buffers
 * grow to the largest merge once and are reused by every following merge.
 * Must not be shared between concurrently running layouts.
 * @internal
 */
export class SkylineScratch {
    public static readonly initialCapacity: number = 4;

    public xStarts: number[] = new Array<number>(SkylineScratch.initialCapacity);
    public heights: number[] = new Array<number>(SkylineScratch.initialCapacity);

    /**
     * Returns `buffer` if it holds at least `capacity` entries, otherwise a new
     * buffer with at least that capacity holding a copy of the first `count`
     * entries of `buffer`.
     */
    public static ensureCapacity(buffer: number[], count: number, capacity: number): number[] {
        let newCapacity: number = buffer.length;
        if (newCapacity >= capacity) {
            return buffer;
        }
        if (newCapacity < SkylineScratch.initialCapacity) {
            newCapacity = SkylineScratch.initialCapacity;
        }
        while (newCapacity < capacity) {
            newCapacity = newCapacity * 2;
        }
        const grown: number[] = new Array<number>(newCapacity);
        for (let k: number = 0; k < count; k = k + 1) {
            grown[k] = buffer[k];
        }
        return grown;
    }
}
