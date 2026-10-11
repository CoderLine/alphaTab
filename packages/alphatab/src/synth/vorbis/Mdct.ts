/**
 * The inverse MDCT of Vorbis (Vorbis I specification, section 1.3.2) for one block size `n`:
 * `y[i] = sum(k < n/2) x[k] * cos(2pi/n * (i + 1/2 + n/4) * (k + 1/2))` for `i < n`, without normalization.
 *
 * It is computed through a DCT-IV of size `m = n/2`, which in turn uses a complex FFT of size `n/4`
 * (the standard construction, e.g. Duhamel, Mahieux, Petit 1991):
 * 1. pre-twiddle: `v[j] = (x[2j] + i * x[m-1-2j]) * e^(-i * pi * (j + 1/4) / m)`,
 * 2. forward FFT of `v` (iterative radix-2, the input is stored in bit-reversed order),
 * 3. post-twiddle: `w[j] = V[j] * e^(-i * pi * j / m)` giving the DCT-IV `u[2j] = re(w[j])`, `u[m-1-2j] = -im(w[j])`,
 * 4. the IMDCT output follows from the DCT-IV by symmetry:
 *    `y[i] = u[i + m/2]` for `i < m/2`, `y[i] = -u[3m/2 - 1 - i]` for `i < 3m/2`, `y[i] = -u[i - 3m/2]` for the rest.
 * @internal
 */
export class Mdct {
    private readonly _n: number;
    /**
     * cos/sin pairs of the pre-twiddle angles `pi * (j + 1/4) / m`, followed by the post-twiddle angles `pi * j / m`.
     */
    private readonly _twiddles: Float32Array;
    /**
     * cos/sin pairs of the FFT angles `2pi * k / (n/4)` for `k < n/8`.
     */
    private readonly _fftTwiddles: Float32Array;
    private readonly _bitReverse: Int32Array;

    public constructor(n: number) {
        this._n = n;
        const m = n >> 1;
        const l = n >> 2;

        const twiddles = new Float32Array(n);
        for (let j = 0; j < l; j++) {
            const pre = (Math.PI * (j + 0.25)) / m;
            const post = (Math.PI * j) / m;
            twiddles[2 * j] = Math.cos(pre);
            twiddles[2 * j + 1] = Math.sin(pre);
            twiddles[m + 2 * j] = Math.cos(post);
            twiddles[m + 2 * j + 1] = Math.sin(post);
        }
        this._twiddles = twiddles;

        const fftTwiddles = new Float32Array(l);
        for (let k = 0; k < l >> 1; k++) {
            const angle = (2 * Math.PI * k) / l;
            fftTwiddles[2 * k] = Math.cos(angle);
            fftTwiddles[2 * k + 1] = Math.sin(angle);
        }
        this._fftTwiddles = fftTwiddles;

        const bitReverse = new Int32Array(l);
        for (let j = 0; j < l; j++) {
            let reversed = 0;
            for (let bit = 1; bit < l; bit = bit << 1) {
                reversed = (reversed << 1) | ((j & bit) !== 0 ? 1 : 0);
            }
            bitReverse[j] = reversed;
        }
        this._bitReverse = bitReverse;
    }

    /**
     * Computes the inverse MDCT.
     * @param input The `n/2` spectral coefficients.
     * @param output Receives the `n` time domain samples.
     * @param work A buffer of at least `n/2` values used as complex FFT buffer.
     */
    public inverse(input: Float32Array, output: Float32Array, work: Float32Array) {
        const n = this._n;
        const m = n >> 1;
        const l = n >> 2;
        const twiddles = this._twiddles;
        const bitReverse = this._bitReverse;

        // 1. pre-twiddle into bit-reversed positions, `work` holds re/im pairs
        for (let j = 0; j < l; j++) {
            const re = input[2 * j];
            const im = input[m - 1 - 2 * j];
            const c = twiddles[2 * j];
            const s = twiddles[2 * j + 1];
            const p = bitReverse[j] * 2;
            work[p] = re * c + im * s;
            work[p + 1] = im * c - re * s;
        }

        // 2. FFT: the first two stages (twiddles 1 and -i) in one pass
        for (let p = 0; p < m; p += 8) {
            const r0 = work[p] + work[p + 2];
            const i0 = work[p + 1] + work[p + 3];
            const r1 = work[p] - work[p + 2];
            const i1 = work[p + 1] - work[p + 3];
            const r2 = work[p + 4] + work[p + 6];
            const i2 = work[p + 5] + work[p + 7];
            const r3 = work[p + 4] - work[p + 6];
            const i3 = work[p + 5] - work[p + 7];
            work[p] = r0 + r2;
            work[p + 1] = i0 + i2;
            work[p + 4] = r0 - r2;
            work[p + 5] = i0 - i2;
            // (r3 + i * i3) * -i = i3 - i * r3
            work[p + 2] = r1 + i3;
            work[p + 3] = i1 - r3;
            work[p + 6] = r1 - i3;
            work[p + 7] = i1 + r3;
        }
        const fftTwiddles = this._fftTwiddles;
        for (let size = 8; size <= l; size = size << 1) {
            const half = size >> 1;
            const step = (l / size) * 2;
            for (let k = 0; k < half; k++) {
                // e^(-2pi * i * k / size)
                const c = fftTwiddles[k * step];
                const s = fftTwiddles[k * step + 1];
                for (let p = 2 * k; p < m; p += 2 * size) {
                    const q = p + size;
                    const tr = work[q] * c + work[q + 1] * s;
                    const ti = work[q + 1] * c - work[q] * s;
                    work[q] = work[p] - tr;
                    work[q + 1] = work[p + 1] - ti;
                    work[p] += tr;
                    work[p + 1] += ti;
                }
            }
        }

        // 3. + 4. post-twiddle and unfold the DCT-IV values u[2j] and u[m-1-2j] into the output
        const quarter = m >> 1;
        for (let j = 0; j < l; j++) {
            const re = work[2 * j];
            const im = work[2 * j + 1];
            const c = twiddles[m + 2 * j];
            const s = twiddles[m + 2 * j + 1];
            const even = re * c + im * s;
            const odd = re * s - im * c;
            const i = 2 * j;
            const o = m - 1 - 2 * j;
            if (j < l >> 1) {
                output[i + m + quarter] = -even;
                output[o - quarter] = odd;
            } else {
                output[i - quarter] = even;
                output[o + m + quarter] = -odd;
            }
            output[m + quarter - 1 - i] = -even;
            output[m + quarter - 1 - o] = -odd;
        }
    }
}
