/** @target web */
/// <reference types="vite/client" />
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';

/**
 * Visits of one method family during a window: how many calls, on how many distinct receivers,
 * split by receiver class.
 * @internal
 */
export class VisitStats {
    public calls = 0;
    public readonly perReceiver = new Map<object, number>();
    public readonly perClass = new Map<string, number>();

    public get receivers() {
        return this.perReceiver.size;
    }

    /** Average visits per receiver that was visited at all. */
    public get visitsPerReceiver() {
        return this.receivers === 0 ? 0 : this.calls / this.receivers;
    }

    public get maxPerReceiver() {
        let m = 0;
        for (const v of this.perReceiver.values()) {
            m = Math.max(m, v);
        }
        return m;
    }
}

/**
 * Wraps the traversal methods of every glyph class to count how often each glyph is visited per
 * layout pass. Overrides that call `super` count once per receiver and call (outermost only).
 * @internal
 */
export class GlyphVisitProbe {
    public static readonly methods = [
        'doLayout',
        'getBoundingBoxTop',
        'getBoundingBoxBottom',
        'getBoundingBoxLeft',
        'getBoundingBoxRight',
        'populateSkyline',
        'registerLayoutingInfo',
        'applyLayoutingInfo',
        'registerHeaderRod',
        'applyHeaderRod',
        'scaleToWidth',
        'updateWidth',
        'buildBoundingsLookup',
        'paint'
    ];

    private static _installed = false;
    private static _active = false;
    private static readonly _stats = new Map<string, VisitStats>();
    private static readonly _inside = new Map<string, Set<object>>();
    public static wrappedClasses = 0;

    public static install() {
        if (GlyphVisitProbe._installed) {
            return;
        }
        GlyphVisitProbe._installed = true;
        const modules = import.meta.glob('../../src/rendering/**/*.ts', { eager: true }) as Record<
            string,
            Record<string, unknown>
        >;
        const seen = new Set<unknown>();
        for (const mod of Object.values(modules)) {
            for (const exported of Object.values(mod)) {
                if (typeof exported !== 'function' || seen.has(exported)) {
                    continue;
                }
                seen.add(exported);
                const proto = (exported as { prototype?: unknown }).prototype;
                if (!proto || !(proto instanceof Glyph || exported === Glyph)) {
                    continue;
                }
                GlyphVisitProbe._wrapClass(exported as unknown as { name: string; prototype: Record<string, unknown> });
            }
        }
    }

    private static _wrapClass(cls: { name: string; prototype: Record<string, unknown> }) {
        let wrapped = false;
        for (const method of GlyphVisitProbe.methods) {
            const desc = Object.getOwnPropertyDescriptor(cls.prototype, method);
            if (!desc || typeof desc.value !== 'function') {
                continue;
            }
            const orig = desc.value as (...args: unknown[]) => unknown;
            let inside = GlyphVisitProbe._inside.get(method);
            if (!inside) {
                inside = new Set<object>();
                GlyphVisitProbe._inside.set(method, inside);
            }
            const insideSet = inside;
            cls.prototype[method] = function (this: object, ...args: unknown[]) {
                if (!GlyphVisitProbe._active || insideSet.has(this)) {
                    return orig.apply(this, args);
                }
                insideSet.add(this);
                try {
                    GlyphVisitProbe._record(method, this);
                    return orig.apply(this, args);
                } finally {
                    insideSet.delete(this);
                }
            };
            wrapped = true;
        }
        if (wrapped) {
            GlyphVisitProbe.wrappedClasses++;
        }
    }

    private static _record(method: string, receiver: object) {
        let s = GlyphVisitProbe._stats.get(method);
        if (!s) {
            s = new VisitStats();
            GlyphVisitProbe._stats.set(method, s);
        }
        s.calls++;
        s.perReceiver.set(receiver, (s.perReceiver.get(receiver) ?? 0) + 1);
        const cls = receiver.constructor.name;
        s.perClass.set(cls, (s.perClass.get(cls) ?? 0) + 1);
    }

    public static start() {
        GlyphVisitProbe.install();
        GlyphVisitProbe._stats.clear();
        GlyphVisitProbe._active = true;
    }

    public static stop(): Map<string, VisitStats> {
        GlyphVisitProbe._active = false;
        const result = new Map(GlyphVisitProbe._stats);
        GlyphVisitProbe._stats.clear();
        return result;
    }

    public static format(stats: Map<string, VisitStats>): string[] {
        const out: string[] = [];
        for (const method of GlyphVisitProbe.methods) {
            const s = stats.get(method);
            if (!s) {
                continue;
            }
            const top = Array.from(s.perClass.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([k, v]) => `${k} ${v}`)
                .join(', ');
            out.push(
                `${method.padEnd(22)} calls=${String(s.calls).padStart(8)} glyphs=${String(s.receivers).padStart(7)} ` +
                    `per glyph=${s.visitsPerReceiver.toFixed(2).padStart(6)} max=${String(s.maxPerReceiver).padStart(4)}  top: ${top}`
            );
        }
        return out;
    }
}
