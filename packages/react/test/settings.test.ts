import { diffSettings, settingsEqual, snapshotSettings } from '@coderline/alphatab-react/settings';
import { describe, expect, it } from 'vitest';

describe('settingsEqual', () => {
    it('ignores key order and undefined values', () => {
        expect(settingsEqual({ a: 1, b: { c: 2, d: 3 } }, { b: { d: 3, c: 2 }, a: 1 })).toBe(true);
        expect(settingsEqual({ a: 1, b: undefined }, { a: 1 })).toBe(true);
        expect(settingsEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('compares arrays and Maps structurally', () => {
        expect(settingsEqual([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
        expect(settingsEqual([1, 2], [2, 1])).toBe(false);
        expect(settingsEqual(new Map([['x', { a: 1 }]]), new Map([['x', { a: 1 }]]))).toBe(true);
        expect(settingsEqual(new Map([['x', true]]), new Map([['x', false]]))).toBe(false);
        expect(settingsEqual(new Map([['x', true]]), new Map([['y', true]]))).toBe(false);
        expect(settingsEqual(new Map(), {})).toBe(false);
    });

    it('compares DOM nodes and class instances by identity', () => {
        class Color {
            public constructor(public readonly value: number) {}
        }
        const element = document.createElement('div');
        expect(settingsEqual({ element }, { element })).toBe(true);
        expect(settingsEqual({ element }, { element: document.createElement('div') })).toBe(false);
        const color = new Color(1);
        expect(settingsEqual(color, color)).toBe(true);
        expect(settingsEqual(new Color(1), new Color(1))).toBe(false);
    });

    it('terminates on cycles', () => {
        const a: Record<string, unknown> = { x: 1 };
        a.self = a;
        const b: Record<string, unknown> = { x: 1 };
        b.self = b;
        expect(settingsEqual(a, b)).toBe(true);
        b.x = 2;
        expect(settingsEqual(a, b)).toBe(false);
    });
});

describe('diffSettings', () => {
    it('returns only the changed leaves', () => {
        expect(
            diffSettings(
                { display: { scale: 1, layoutMode: 'page' }, player: { scrollMode: 1 } },
                { display: { scale: 2, layoutMode: 'page' }, player: { scrollMode: 1 } }
            )
        ).toEqual({ display: { scale: 2 } });
        expect(diffSettings({ display: { scale: 1 } }, { display: { scale: 1 } })).toBeUndefined();
    });

    it('returns the whole patch without a previous one', () => {
        expect(diffSettings(undefined, { display: { scale: 2 } })).toEqual({ display: { scale: 2 } });
        expect(diffSettings({ display: { scale: 2 } }, undefined)).toBeUndefined();
    });

    it('leaves removed and undefined keys out', () => {
        expect(diffSettings({ a: 1, b: 2 }, { a: 1 })).toBeUndefined();
        expect(diffSettings({ a: 1 }, { a: 1, b: undefined })).toBeUndefined();
    });

    it('takes changed Maps and arrays whole', () => {
        const elements = new Map([
            ['a', true],
            ['b', false]
        ]);
        expect(diffSettings({ notation: { elements } }, { notation: { elements: new Map(elements) } })).toBeUndefined();
        const changed = new Map([
            ['a', true],
            ['b', true]
        ]);
        expect(diffSettings({ notation: { elements } }, { notation: { elements: changed } })).toEqual({
            notation: { elements: changed }
        });
        expect(diffSettings({ core: { tracks: [0, 1] } }, { core: { tracks: [0, 2] } })).toEqual({
            core: { tracks: [0, 2] }
        });
    });

    it('terminates on cycles', () => {
        const next: Record<string, unknown> = { x: 2 };
        next.self = next;
        const previous: Record<string, unknown> = { x: 1 };
        previous.self = previous;
        expect(diffSettings(previous, next)).toEqual({ x: 2 });
    });
});

describe('snapshotSettings', () => {
    it('copies plain objects, arrays and Maps and keeps other objects', () => {
        const element = document.createElement('div');
        const original = { player: { scrollElement: element }, core: { tracks: [1] }, map: new Map([['a', { b: 1 }]]) };
        const copy = snapshotSettings(original);
        original.core.tracks.push(2);
        original.map.get('a')!.b = 2;
        expect(copy.core.tracks).toEqual([1]);
        expect(copy.map.get('a')).toEqual({ b: 1 });
        expect(copy.player.scrollElement).toBe(element);
    });

    it('keeps cycles', () => {
        const original: Record<string, unknown> = {};
        original.self = original;
        const copy = snapshotSettings(original);
        expect(copy.self).toBe(copy);
        expect(copy).not.toBe(original);
    });
});
