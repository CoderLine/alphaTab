/** @target web */
import type { IObjectReader } from '@coderline/alphatab/io/IObjectReader';
import type { IObjectWriter } from '@coderline/alphatab/io/IObjectWriter';
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

    function check(c: SerializerFillCase) {
        const obj = filled(c);
        const expected = c.serializer.toJson(obj)!;

        // every written property differs from its default
        const defaults = c.serializer.toJson(c.create())!;
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
        c.serializer.fromJson(fromMap, expected);
        expectSame(c.serializer.toJson(fromMap), expected, `${c.name} (Map)`);

        // JSON text
        const fromJson = c.create();
        c.serializer.fromJson(fromJson, JSON.parse(JSON.stringify(expected, mapReplacer)));
        expect(JSON.stringify(c.serializer.toJson(fromJson), mapReplacer), `${c.name} (JSON)`).toBe(
            JSON.stringify(expected, mapReplacer)
        );

        for (const format of formats) {
            const w = format.writer(64);
            c.serializer.write(obj, w);
            const data = w.toUint8Array();
            const fromBinary = c.create();
            c.serializer.read(fromBinary, format.reader(data));
            expectSame(c.serializer.toJson(fromBinary), expected, `${c.name} (${format.name})`);

            // decoded as a Map tree
            const tree = format.reader(data).readValue();
            expectSame(tree, expected, `${c.name} (${format.name} tree)`);
            const fromTree = c.create();
            c.serializer.fromJson(fromTree, tree);
            expectSame(c.serializer.toJson(fromTree), expected, `${c.name} (${format.name} tree read)`);
        }
    }

    for (const c of SerializerFill.cases) {
        it(c.name, () => check(c));
    }
});
