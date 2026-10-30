/** @target web */
import type { IObjectReader } from '@coderline/alphatab/io/IObjectReader';
import type { IObjectWriter } from '@coderline/alphatab/io/IObjectWriter';
import { MapObjectReader } from '@coderline/alphatab/io/MapObjectReader';
import { MapObjectWriter } from '@coderline/alphatab/io/MapObjectWriter';
import { MessagePackObjectReader } from '@coderline/alphatab/io/MessagePackObjectReader';
import { MessagePackObjectWriter } from '@coderline/alphatab/io/MessagePackObjectWriter';
import { describe, expect, it } from 'vitest';
import { SerializerFill, type SerializerFillCase } from '../generated/SerializerFill';

/**
 * Every serialized property of every `@json` class, filled with a non-default value, must survive the round
 * trips of all object reader/writer realisations.
 */
describe('SerializerRoundTripTests', () => {
    const formats: {
        name: string;
        writer(initialCapacity: number): IObjectWriter & { toUint8Array(): Uint8Array };
        reader(data: Uint8Array): IObjectReader;
    }[] = [
        {
            name: 'MessagePack',
            writer: c => new MessagePackObjectWriter(c),
            reader: d => new MessagePackObjectReader(d)
        }
    ];

    function mapReplacer(_: string, v: unknown) {
        if (v instanceof Map) {
            return Object.fromEntries(v);
        }
        if (ArrayBuffer.isView(v)) {
            return Array.from(v as unknown as ArrayLike<number>);
        }
        return v;
    }

    /**
     * Equality including key order, undefined entries and Map vs plain object.
     */
    function expectSame(actual: unknown, expected: unknown, path: string) {
        if (expected instanceof Map) {
            expect(actual, path).toBeInstanceOf(Map);
            const a = actual as Map<string, unknown>;
            expect(Array.from(a.keys()), path).toEqual(Array.from(expected.keys()));
            for (const [k, v] of expected) {
                expectSame(a.get(k), v, `${path}.${k}`);
            }
        } else if (Array.isArray(expected)) {
            expect(Array.isArray(actual), path).toBe(true);
            const a = actual as unknown[];
            expect(a.length, path).toBe(expected.length);
            for (let i = 0; i < expected.length; i++) {
                expectSame(a[i], expected[i], `${path}[${i}]`);
            }
        } else if (expected !== null && typeof expected === 'object') {
            expect(actual, path).toEqual(expected);
        } else {
            expect(Object.is(actual, expected), `${path}: ${String(actual)} vs ${String(expected)}`).toBe(true);
        }
    }

    function filled(c: SerializerFillCase) {
        const obj = c.create();
        c.fill(obj);
        return obj;
    }

    function toJson(c: SerializerFillCase, obj: unknown) {
        const w = new MapObjectWriter();
        c.write(obj, w);
        return w.result as Map<string, unknown>;
    }

    function check(c: SerializerFillCase) {
        const obj = filled(c);
        const expected = toJson(c, obj);

        // every written property differs from its default
        const defaults = toJson(c, c.create());
        const unfilled = SerializerFill.unfilled.get(c.name) ?? [];
        for (const [k, v] of expected) {
            if (unfilled.indexOf(k) < 0) {
                expect(JSON.stringify(v, mapReplacer), `${c.name}.${k} is not filled`).not.toBe(
                    JSON.stringify(defaults.get(k), mapReplacer)
                );
            }
        }

        // Map tree
        const fromMap = c.create();
        c.fromJson(fromMap, new MapObjectReader(expected));
        expectSame(toJson(c, fromMap), expected, `${c.name} (Map)`);

        // JSON text
        const fromJson = c.create();
        c.fromJson(fromJson, new MapObjectReader(JSON.parse(JSON.stringify(expected, mapReplacer))));
        expect(JSON.stringify(toJson(c, fromJson), mapReplacer), `${c.name} (JSON)`).toBe(
            JSON.stringify(expected, mapReplacer)
        );

        for (const format of formats) {
            const w = format.writer(64);
            c.write(obj, w);
            const data = w.toUint8Array();
            const fromBinary = c.create();
            c.read(fromBinary, format.reader(data));
            expectSame(toJson(c, fromBinary), expected, `${c.name} (${format.name})`);

            // every field is keyed by its id
            const tree = format.reader(data).readValue() as Map<string, unknown>;
            expect(tree.size, `${c.name} (${format.name} entries)`).toBe(expected.size);
            for (const k of tree.keys()) {
                expect(k, `${c.name} (${format.name} keys)`).toMatch(/^\d+$/);
            }
        }
    }

    for (const c of SerializerFill.cases) {
        it(c.name, () => check(c));
    }
});
