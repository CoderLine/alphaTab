/** @target web */
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Score } from '@coderline/alphatab/model/Score';
import type { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import type { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';

/**
 * A text form of a {@link BoundsLookup} that two renders of equal scores can be compared by: every
 * bounds value in registration order, the parent links, the model references (as indices, checked
 * against the rendered score) and the master bar and beat lookups.
 * @internal
 */
export class BoundsDump {
    /** One block of lines per staff system. */
    public systems: string[][] = [];
    /** The lookup tables, keyed by model position. */
    public lookups: string[] = [];

    private static _n(v: number): string {
        return String(v);
    }

    /**
     * Whether both texts are equal except for numbers differing by less than the tolerance (the
     * resize and the fresh path sum widths in different orders).
     */
    public static nearlyEqual(a: string, b: string, tolerance: number = 1e-3): boolean {
        if (a === b) {
            return true;
        }
        const number = /-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/g;
        if (a.replace(number, '#') !== b.replace(number, '#')) {
            return false;
        }
        const na = a.match(number) ?? [];
        const nb = b.match(number) ?? [];
        for (let i = 0; i < na.length; i++) {
            if (Math.abs(Number.parseFloat(na[i]) - Number.parseFloat(nb[i])) >= tolerance) {
                return false;
            }
        }
        return true;
    }

    private static _b(b: Bounds | undefined, maskWidth: boolean = false): string {
        if (!b) {
            return 'none';
        }
        const w = maskWidth ? '*' : BoundsDump._n(b.w);
        return `${BoundsDump._n(b.x)},${BoundsDump._n(b.y)},${w},${BoundsDump._n(b.h)}`;
    }

    /** The key of a beat as {@link of} prints it, e.g. `t0s0b3v0e1`. */
    public static beatKey(beat: Beat): string {
        const v = beat.voice;
        return `t${v.bar.staff.track.index}s${v.bar.staff.index}b${v.bar.index}v${v.index}e${beat.index}`;
    }

    /**
     * @param maskedBeatWidths Beats (by {@link beatKey}) whose visual width is left out.
     */
    public static of(
        lookup: BoundsLookup | null,
        score: Score,
        maskedBeatWidths: Set<string> | null = null
    ): BoundsDump {
        const d = new BoundsDump();
        if (!lookup) {
            d.lookups.push('no lookup');
            return d;
        }
        d.lookups.push(`finished=${lookup.isFinished} systems=${lookup.staffSystems.length}`);
        const position = new Map<object, string>();
        for (let si = 0; si < lookup.staffSystems.length; si++) {
            const s = lookup.staffSystems[si];
            const lines: string[] = [];
            const links = s.index === si && s.boundsLookup === lookup ? '' : ' LINK';
            lines.push(`system ${si} v=${BoundsDump._b(s.visualBounds)} r=${BoundsDump._b(s.realBounds)}${links}`);
            for (let mi = 0; mi < s.bars.length; mi++) {
                const mb = s.bars[mi];
                position.set(mb, `${si}/${mi}`);
                const mbLinks = mb.staffSystemBounds === s ? '' : ' LINK';
                lines.push(
                    ` mb ${mb.index} first=${mb.isFirstOfLine} la=${BoundsDump._b(mb.lineAlignedBounds)} ` +
                        `v=${BoundsDump._b(mb.visualBounds)} r=${BoundsDump._b(mb.realBounds)}${mbLinks}`
                );
                for (let bi = 0; bi < mb.bars.length; bi++) {
                    const b = mb.bars[bi];
                    const bar = b.bar;
                    const t = bar.staff.track.index;
                    const st = bar.staff.index;
                    const modelOk = score.tracks[t].staves[st].bars[bar.index] === bar ? '' : ' MODEL';
                    const bLinks = b.masterBarBounds === mb ? '' : ' LINK';
                    lines.push(
                        `  bar t${t}s${st}b${bar.index} v=${BoundsDump._b(b.visualBounds)} ` +
                            `r=${BoundsDump._b(b.realBounds)}${modelOk}${bLinks}`
                    );
                    for (let ei = 0; ei < b.beats.length; ei++) {
                        const e = b.beats[ei];
                        const beat = e.beat;
                        position.set(e, `${si}/${mi}/${bi}/${ei}`);
                        const v = beat.voice;
                        const eModelOk =
                            v.bar === bar && v.bar.voices[v.index] === v && v.beats[beat.index] === beat
                                ? ''
                                : ' MODEL';
                        const eLinks = e.barBounds === b ? '' : ' LINK';
                        const key = BoundsDump.beatKey(beat);
                        const masked = maskedBeatWidths !== null && maskedBeatWidths.has(key);
                        lines.push(
                            `   beat ${key} x=${BoundsDump._n(e.onNotesX)} ` +
                                `v=${BoundsDump._b(e.visualBounds, masked)} r=${BoundsDump._b(e.realBounds)}${eModelOk}${eLinks}`
                        );
                        if (e.notes) {
                            for (const n of e.notes) {
                                const nModelOk = beat.notes[n.note.index] === n.note ? '' : ' MODEL';
                                const nLinks = n.beatBounds === e ? '' : ' LINK';
                                lines.push(
                                    `    note ${n.note.index} h=${BoundsDump._b(n.noteHeadBounds)}${nModelOk}${nLinks}`
                                );
                            }
                        }
                    }
                }
            }
            d.systems.push(lines);
        }

        for (const mb of score.masterBars) {
            const found = lookup.findMasterBarByIndex(mb.index);
            const same = lookup.findMasterBar(mb) === found ? '' : ' MISMATCH';
            d.lookups.push(`mb ${mb.index} -> ${found ? (position.get(found) ?? 'unlisted') : 'none'}${same}`);
        }
        for (const track of score.tracks) {
            for (const staff of track.staves) {
                for (const bar of staff.bars) {
                    for (const voice of bar.voices) {
                        for (const beat of voice.beats) {
                            const all = lookup.findBeats(beat);
                            if (!all) {
                                continue;
                            }
                            const at = all.map(e => (e.beat === beat ? (position.get(e) ?? 'unlisted') : 'MODEL'));
                            const first = lookup.findBeat(beat) === all[0] ? '' : ' MISMATCH';
                            d.lookups.push(`beat ${BoundsDump.beatKey(beat)} -> ${at.join(' ')}${first}`);
                        }
                    }
                }
            }
        }
        return d;
    }

    /** The first difference to the other dump, or `null` when both are equal. */
    public static firstDifference(expected: BoundsDump, actual: BoundsDump): string | null {
        let differing = 0;
        let first = '';
        const count = Math.max(expected.systems.length, actual.systems.length);
        for (let i = 0; i < count; i++) {
            const d = BoundsDump._firstLine(expected.systems[i] ?? [], actual.systems[i] ?? []);
            if (d !== null) {
                differing++;
                if (!first) {
                    first = `system ${i}: ${d}`;
                }
            }
        }
        const l = BoundsDump._firstLine(expected.lookups, actual.lookups);
        if (differing === 0 && l === null) {
            return null;
        }
        const systems = differing > 0 ? `${differing}/${count} systems, first at ${first}` : 'systems equal';
        return l === null ? systems : `${systems}; lookups: ${l}`;
    }

    /** All lines of the systems that differ, as `fresh / resized` pairs. */
    public static differingLines(expected: BoundsDump, actual: BoundsDump): string[] {
        const result: string[] = [];
        const count = Math.max(expected.systems.length, actual.systems.length);
        for (let i = 0; i < count; i++) {
            const e = expected.systems[i] ?? [];
            const a = actual.systems[i] ?? [];
            for (let j = 0; j < Math.max(e.length, a.length); j++) {
                if (!BoundsDump._lineEqual(e[j], a[j])) {
                    result.push(`${(e[j] ?? '<missing>').trim()} / ${(a[j] ?? '<missing>').trim()}`);
                }
            }
        }
        return result;
    }

    private static _lineEqual(a: string | undefined, b: string | undefined): boolean {
        return a !== undefined && b !== undefined ? BoundsDump.nearlyEqual(a, b) : a === b;
    }

    private static _firstLine(expected: string[], actual: string[]): string | null {
        const count = Math.max(expected.length, actual.length);
        for (let i = 0; i < count; i++) {
            if (!BoundsDump._lineEqual(expected[i], actual[i])) {
                return `fresh '${(expected[i] ?? '<missing>').trim()}' / resized '${(actual[i] ?? '<missing>').trim()}'`;
            }
        }
        return null;
    }
}
