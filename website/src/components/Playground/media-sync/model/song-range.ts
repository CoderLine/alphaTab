/**
 * Finds the first and last stretch of at least a second of sound (gaps under 200 ms allowed),
 * searching at most 10 s or 10% from either end.
 */
export function findSongRange(left: Float32Array, right: Float32Array, sampleRate: number): [number, number] {
    const audible = 1 * sampleRate;
    const allowedGap = 0.2 * sampleRate;
    const threshold = 0.001;
    const searchLength = Math.min(10 * sampleRate, left.length * 0.1);
    const loud = (i: number) => Math.abs(left[i]) >= threshold || Math.abs(right[i]) >= threshold;

    const scan = (from: number, to: number, step: 1 | -1): number => {
        let sectionStart = from;
        let sound = 0;
        let silence = 0;
        for (let i = from; step > 0 ? i < to : i >= to; i += step) {
            if (loud(i)) {
                if (sound === 0) { sectionStart = i; }
                sound++;
                silence = 0;
            } else {
                silence++;
            }
            if (silence > allowedGap) {
                sectionStart = i + step;
                sound = 0;
                silence = 0;
            } else if (sound > audible) {
                return sectionStart;
            }
        }
        return to;
    };

    const start = scan(0, searchLength, 1);
    const end = scan(left.length - 1, left.length - searchLength, -1);
    return [(start / sampleRate) * 1000, (end / sampleRate) * 1000];
}
