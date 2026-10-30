/** @target web */
import { AlphaTabError } from '@coderline/alphatab/AlphaTabError';
import type { IObjectReader } from '@coderline/alphatab/io/IObjectReader';
import { MessagePackObjectReader } from '@coderline/alphatab/io/MessagePackObjectReader';
import { MessagePackObjectWriter } from '@coderline/alphatab/io/MessagePackObjectWriter';
import { describe, expect, it } from 'vitest';

function hex(data: Uint8Array): string {
    return Array.from(data)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
}

function fromHex(s: string): Uint8Array {
    return new Uint8Array(s.split(' ').map(b => Number.parseInt(b, 16)));
}

describe('MessagePackObjectIOTests', () => {
    function encode(value: Map<string, unknown>, initialCapacity: number = 16): Uint8Array {
        const w = new MessagePackObjectWriter(initialCapacity);
        w.writeValue(value);
        return w.toUint8Array();
    }

    function decode(data: Uint8Array): unknown {
        return new MessagePackObjectReader(data).readValue();
    }

    it('numbers', () => {
        const numbers = [
            0,
            -0,
            1,
            -1,
            7.25,
            2147483647,
            -2147483648,
            2147483648,
            -2147483649,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.MIN_VALUE
        ];
        const decoded = decode(encode(new Map<string, unknown>([['n', numbers]]))) as Map<string, unknown>;
        const actual = decoded.get('n') as number[];
        expect(actual.length).toBe(numbers.length);
        for (let i = 0; i < numbers.length; i++) {
            expect(Object.is(actual[i], numbers[i]), `${numbers[i]}`).toBe(true);
        }
    });

    it('strings', () => {
        const strings = ['', 'a', 'ä', '€', '𝄞', 'mixed ä € 𝄞 text', 'x'.repeat(100), 'ü'.repeat(100), '\uD834'];
        const decoded = decode(encode(new Map<string, unknown>([['s', strings]]))) as Map<string, unknown>;
        expect(decoded.get('s')).toEqual([
            '',
            'a',
            'ä',
            '€',
            '𝄞',
            'mixed ä € 𝄞 text',
            'x'.repeat(100),
            'ü'.repeat(100),
            '�'
        ]);
    });

    it('values', () => {
        const nested = new Map<string, unknown>([
            ['x', 1],
            ['y', new Map<string, unknown>()]
        ]);
        const value = new Map<string, unknown>([
            ['null', null],
            ['undefined', undefined],
            ['true', true],
            ['false', false],
            ['emptyArray', []],
            ['nested', nested],
            ['deep', [[1, [2, [3]]], nested]],
            ['bytes', new Uint8Array([0, 1, 255])],
            ['ä€𝄞', 'non-ascii key'],
            ['', 'empty key'],
            ['long', Array.from({ length: 25 }, (_, i) => i)]
        ]);
        // a small initial capacity grows the buffer several times
        const decoded = decode(encode(value, 8)) as Map<string, unknown>;
        expect(Array.from(decoded.keys())).toEqual(Array.from(value.keys()));
        expect(decoded.has('undefined')).toBe(true);
        expect(decoded.get('undefined')).toBeUndefined();
        expect(decoded.get('null')).toBeNull();
        expect(decoded).toEqual(value);
        expect(decoded.get('bytes')).toBeInstanceOf(Uint8Array);
    });

    it('typed-reads-of-other-types', () => {
        const w = new MessagePackObjectWriter(64);
        w.startObject();
        w.prop('n');
        w.writeNumber(null as unknown as number);
        w.prop('b');
        w.writeBoolean(undefined as unknown as boolean);
        w.prop('s');
        w.writeString(null as unknown as string);
        w.endObject();
        const r = new MessagePackObjectReader(w.toUint8Array());
        const values: unknown[] = [];
        r.readObject((k, rr) => {
            switch (k) {
                case 'n':
                    values.push(rr.readNumber());
                    break;
                case 'b':
                    values.push(rr.readBoolean());
                    break;
                case 's':
                    values.push(rr.readString());
                    break;
            }
            return true;
        });
        expect(values).toEqual([null, undefined, null]);
    });

    it('unconsumed-values-are-skipped', () => {
        const value = new Map<string, unknown>([
            ['skipDocument', new Map<string, unknown>([['a', [1, 'x', new Map<string, unknown>()]]])],
            ['skipArray', [1, 2, 3]],
            ['skipString', 'text'],
            ['skipDouble', 1.5],
            ['skipInt', 1],
            ['skipBool', true],
            ['skipNull', null],
            ['skipBytes', new Uint8Array([1, 2])],
            ['read', 42],
            ['peekOnly', null]
        ]);
        const r = new MessagePackObjectReader(encode(value));
        const seen: string[] = [];
        let read = 0;
        r.readObject((k, rr: IObjectReader) => {
            seen.push(k);
            if (k === 'read') {
                read = rr.readNumber();
                return true;
            }
            if (k === 'peekOnly') {
                return rr.isNullish();
            }
            return false;
        });
        expect(seen).toEqual(Array.from(value.keys()));
        expect(read).toBe(42);
    });

    it('spec-example', () => {
        // {"compact": true, "schema": 0} from msgpack.org; maps are written with a map 16 header
        const w = new MessagePackObjectWriter(16);
        w.writeValue(
            new Map<string, unknown>([
                ['compact', true],
                ['schema', 0]
            ])
        );
        expect(hex(w.toUint8Array())).toBe('de 00 02 a7 63 6f 6d 70 61 63 74 c3 a6 73 63 68 65 6d 61 00');
        // the shortest encoding as other writers produce it
        const shortest = fromHex('82 a7 63 6f 6d 70 61 63 74 c3 a6 73 63 68 65 6d 61 00');
        expect(new MessagePackObjectReader(shortest).readValue()).toEqual(
            new Map<string, unknown>([
                ['compact', true],
                ['schema', 0]
            ])
        );
    });

    it('integer-formats', () => {
        const values = [
            0, 127, 128, 255, 256, 65535, 65536, 4294967295, -1, -32, -33, -128, -129, -32768, -32769, -2147483648
        ];
        const w = new MessagePackObjectWriter(16);
        w.writeValue(values);
        expect(hex(w.toUint8Array())).toBe(
            'dc 00 10 00 7f cc 80 cc ff cd 01 00 cd ff ff ce 00 01 00 00 ce ff ff ff ff ff e0 d0 df d0 80 d1 ff 7f d1 80 00 d2 ff ff 7f ff d2 80 00 00 00'
        );
        // 64-bit integers from other writers
        expect(new MessagePackObjectReader(fromHex('cf 00 00 00 01 00 00 00 00')).readValue()).toBe(4294967296);
        expect(new MessagePackObjectReader(fromHex('d3 ff ff ff fe ff ff ff ff')).readValue()).toBe(-4294967297);
    });

    it('float-formats', () => {
        const w = new MessagePackObjectWriter(16);
        w.writeValue([1.5, 0.1, -0]);
        expect(hex(w.toUint8Array())).toBe('93 ca 3f c0 00 00 cb 3f b9 99 99 99 99 99 9a ca 80 00 00 00');
    });

    it('large-map', () => {
        const value = new Map<string, unknown>();
        for (let i = 0; i < 70000; i++) {
            value.set(`k${i}`, i);
        }
        const w = new MessagePackObjectWriter(16);
        w.writeValue(
            new Map<string, unknown>([
                ['m', value],
                ['after', true]
            ])
        );
        const data = w.toUint8Array();
        expect(data[5]).toBe(0xdf);
        expect(new MessagePackObjectReader(data).readValue()).toEqual(
            new Map<string, unknown>([
                ['m', value],
                ['after', true]
            ])
        );
    });

    it('invalid-data', () => {
        const w = new MessagePackObjectWriter(16);
        w.writeValue(new Map<string, unknown>([['key', 'value']]));
        const data = w.toUint8Array();
        expect(() => new MessagePackObjectReader(data.subarray(0, data.length - 3)).readValue()).toThrow(AlphaTabError);
        const unknownFormat = data.slice();
        unknownFormat[7] = 0xc1;
        expect(() => new MessagePackObjectReader(unknownFormat).readValue()).toThrow(AlphaTabError);
        expect(() => new MessagePackObjectReader(fromHex('d6 ff 00 00 00 00')).readValue()).toThrow(AlphaTabError);
    });

    it('array-length-is-checked', () => {
        const w = new MessagePackObjectWriter(16);
        w.startArray(2);
        w.writeNumber(1);
        expect(() => w.endArray()).toThrow(AlphaTabError);
    });
});
