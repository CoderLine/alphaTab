/** @target web */
import zlib from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { Deflater } from '@coderline/alphatab/zip/Deflater';
import { Inflater } from '@coderline/alphatab/zip/Inflater';
import { ZipReader } from '@coderline/alphatab/zip/ZipReader';
import { TestPlatform } from 'test/TestPlatform';

/**
 * Checks the DEFLATE implementation against zlib, the reference implementation: our compressed data must be
 * accepted by zlib (which rejects incomplete and over-subscribed codes), and zlib's output in all its modes must
 * be accepted by us.
 */
describe('DeflateInteropTests', () => {
    async function corpus(): Promise<Uint8Array[]> {
        const result: Uint8Array[] = [];
        const folders = [
            'test-data/guitarpro7',
            'test-data/guitarpro8',
            'test-data/musicxml-samples',
            'test-data/visual-tests/layout'
        ];
        for (const folder of folders) {
            for (const file of await TestPlatform.listDirectory(folder)) {
                if (!file.endsWith('.gp') && !file.endsWith('.mxl')) {
                    continue;
                }
                const data = await TestPlatform.loadFile(`${folder}/${file}`);
                for (const entry of new ZipReader(ByteBuffer.fromBuffer(data), 100000000).read()) {
                    result.push(entry.data);
                }
            }
        }

        // synthetic data: long runs, incompressible data and a larger text
        result.push(new Uint8Array(300000));
        const noise = new Uint8Array(200000);
        let x = 1;
        for (let i = 0; i < noise.length; i++) {
            x = (x * 75 + 74) % 65537;
            noise[i] = x & 0xff;
        }
        result.push(noise);
        result.push(new TextEncoder().encode('<Note id="1"><Pitch>C4</Pitch></Note>\n'.repeat(20000)));
        return result;
    }

    function expectEqual(actual: Uint8Array, expected: Uint8Array) {
        expect(actual.length).toBe(expected.length);
        expect(Buffer.compare(Buffer.from(actual), Buffer.from(expected))).toBe(0);
    }

    it('zlib-inflates-our-data', async () => {
        const deflater = new Deflater();
        let compressedSize = 0;
        let zlibSize = 0;
        for (const data of await corpus()) {
            const compressed = deflater.deflate(data);
            expectEqual(zlib.inflateRawSync(compressed), data);
            compressedSize += compressed.length;
            zlibSize += zlib.deflateRawSync(data).length;
        }
        // within 2% of zlib's default level
        expect(compressedSize).toBeLessThan(zlibSize * 1.02);
    });

    it('we-inflate-zlib-data', async () => {
        const options: zlib.ZlibOptions[] = [
            { level: 0 },
            { level: 1 },
            { level: 6 },
            { level: 9 },
            { level: 9, memLevel: 1, windowBits: 9 },
            { strategy: zlib.constants.Z_FIXED },
            { strategy: zlib.constants.Z_RLE },
            { strategy: zlib.constants.Z_HUFFMAN_ONLY },
            { strategy: zlib.constants.Z_FILTERED }
        ];
        for (const data of await corpus()) {
            for (const option of options) {
                const compressed = zlib.deflateRawSync(data, option);
                const inflated = new Inflater(ByteBuffer.fromBuffer(compressed)).inflate(0, 100000000);
                expectEqual(inflated!, data);
            }
        }
    });
});
