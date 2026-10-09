import { describe, expect, it } from 'vitest';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { Crc32 } from '@coderline/alphatab/zip/Crc32';

describe('Crc32Tests', () => {
    function crc(data: Uint8Array): number {
        const c = new Crc32();
        c.update(data, 0, data.length);
        return c.value;
    }

    // check values of CRC-32/ISO-HDLC (as used by ZIP), as signed 32-bit integers
    it('empty', () => {
        expect(crc(new Uint8Array(0))).toBe(0);
    });

    it('check-value', () => {
        // 0xCBF43926
        expect(crc(IOHelper.stringToBytes('123456789'))).toBe(-873187034);
    });

    it('high-bytes', () => {
        const data = new Uint8Array(256);
        for (let i = 0; i < data.length; i++) {
            data[i] = 255 - i;
        }
        // 0xDA3BA10A
        expect(crc(data)).toBe(-633626358);
    });

    it('incremental', () => {
        const data = IOHelper.stringToBytes('123456789');
        const c = new Crc32();
        c.update(data, 0, 4);
        c.update(data, 4, 5);
        expect(c.value).toBe(-873187034);
        c.reset();
        c.update(data, 0, data.length);
        expect(c.value).toBe(-873187034);
    });
});
