/** @target web */
import fs from 'node:fs';
import path from 'node:path';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { Logger } from '@coderline/alphatab/Logger';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import { Score } from '@coderline/alphatab/model/Score';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { BoundsLookupWire } from '@coderline/alphatab/rendering/utils/BoundsLookupWire';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { LayoutCorpus } from '../layoutFlow/LayoutCorpus';

// The worker hands the bounds lookup to the main thread as BoundsLookupWire; the result must equal
// the public toJson/fromJson round trip.
describe('BoundsLookupWire', () => {
    const configurations = [
        { includeNoteBounds: false, scale: 1 },
        { includeNoteBounds: true, scale: 1 },
        { includeNoteBounds: false, scale: 1.25 },
        { includeNoteBounds: true, scale: 1.25 }
    ];

    function renderLookup(
        file: string,
        includeNoteBounds: boolean,
        scale: number
    ): { score: Score; lookup: BoundsLookup } | null {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = true;
        settings.core.includeNoteBounds = includeNoteBounds;
        settings.core.logLevel = LogLevel.None;
        settings.display.scale = scale;
        Logger.logLevel = LogLevel.None;
        let score: Score;
        try {
            score = ScoreLoader.loadScoreFromBytes(new Uint8Array(fs.readFileSync(file)), settings);
        } catch {
            return null;
        }
        const renderer = new ScoreRenderer(settings);
        renderer.width = 1300;
        renderer.renderScore(
            score,
            score.tracks.map(t => t.index)
        );
        return renderer.boundsLookup ? { score, lookup: renderer.boundsLookup } : null;
    }

    function pushBounds(out: unknown[], b: Bounds) {
        out.push(b.x, b.y, b.w, b.h);
    }

    // every value and reference a consumer of the lookup can observe, in traversal order
    function observe(lookup: BoundsLookup): unknown[] {
        const out: unknown[] = [lookup.isFinished, lookup.staffSystems.length];
        for (const system of lookup.staffSystems) {
            out.push(system.index, system.isFinished, system.boundsLookup === lookup, system.bars.length);
            pushBounds(out, system.visualBounds);
            pushBounds(out, system.realBounds);
            for (const masterBar of system.bars) {
                out.push(
                    masterBar.index,
                    masterBar.isFirstOfLine,
                    masterBar.staffSystemBounds === system,
                    lookup.findMasterBarByIndex(masterBar.index) === masterBar,
                    masterBar.bars.length
                );
                pushBounds(out, masterBar.lineAlignedBounds);
                pushBounds(out, masterBar.visualBounds);
                pushBounds(out, masterBar.realBounds);
                for (const bar of masterBar.bars) {
                    out.push(bar.bar, bar.masterBarBounds === masterBar, bar.beats.length);
                    pushBounds(out, bar.visualBounds);
                    pushBounds(out, bar.realBounds);
                    for (const beat of bar.beats) {
                        const registered = lookup.findBeats(beat.beat)!;
                        out.push(
                            beat.beat,
                            beat.barBounds === bar,
                            beat.onNotesX,
                            registered.length,
                            registered.indexOf(beat),
                            beat.notes === null ? -1 : beat.notes.length
                        );
                        pushBounds(out, beat.visualBounds);
                        pushBounds(out, beat.realBounds);
                        if (beat.notes) {
                            for (const note of beat.notes) {
                                out.push(note.note, note.beatBounds === beat);
                                pushBounds(out, note.noteHeadBounds);
                            }
                        }
                    }
                }
            }
        }
        return out;
    }

    function countNoteBounds(lookup: BoundsLookup): number {
        let count = 0;
        for (const system of lookup.staffSystems) {
            for (const masterBar of system.bars) {
                for (const bar of masterBar.bars) {
                    for (const beat of bar.beats) {
                        count += beat.notes?.length ?? 0;
                    }
                }
            }
        }
        return count;
    }

    function expectSameAsJson(label: string, score: Score, lookup: BoundsLookup): number {
        const viaJson = BoundsLookup.fromJson(lookup.toJson(), score)!;
        viaJson.finish();
        const viaWire = BoundsLookupWire.decode(structuredClone(BoundsLookupWire.encode(lookup)), score);
        viaWire.finish();

        const expected = observe(viaJson);
        const actual = observe(viaWire);
        expect(actual.length, label).toBe(expected.length);
        for (let i = 0; i < expected.length; i++) {
            if (!Object.is(actual[i], expected[i])) {
                expect.fail(`${label}: value ${i} differs: ${String(actual[i])} vs ${String(expected[i])}`);
            }
        }
        return countNoteBounds(viaWire);
    }

    it('empty-lookup', () => {
        const data = BoundsLookupWire.encode(new BoundsLookup());
        expect(data.length).toBe(0);
        expect(BoundsLookupWire.decode(data, new Score()).staffSystems.length).toBe(0);
    });

    for (const c of configurations) {
        it(`corpus-notes-${c.includeNoteBounds}-scale-${c.scale}`, () => {
            let checked = 0;
            let noteBounds = 0;
            for (const file of LayoutCorpus.files(process.cwd())) {
                const rendered = renderLookup(file, c.includeNoteBounds, c.scale);
                if (!rendered) {
                    continue;
                }
                noteBounds += expectSameAsJson(path.relative(process.cwd(), file), rendered.score, rendered.lookup);
                checked++;
            }
            expect(checked).toBeGreaterThan(100);
            expect(noteBounds > 0).toBe(c.includeNoteBounds);
        });
    }
});
