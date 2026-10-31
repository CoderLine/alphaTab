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
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// The worker hands the bounds lookup to the main thread as BoundsLookupWire; the result must equal
// the public toJson/fromJson round trip.
describe('BoundsLookupWire', () => {
    let previousLogLevel = LogLevel.Info;
    beforeAll(() => {
        previousLogLevel = Logger.logLevel;
        Logger.logLevel = LogLevel.None;
    });
    afterAll(() => {
        Logger.logLevel = previousLogLevel;
    });

    const configurations = [
        { includeNoteBounds: false, scale: 1 },
        { includeNoteBounds: true, scale: 1 },
        { includeNoteBounds: false, scale: 1.25 },
        { includeNoteBounds: true, scale: 1.25 }
    ];

    // The format is structural: every model index (track, staff, bar, voice, beat, note), the system and
    // master bar nesting, beats listed on several staves and beats with and without note bounds.
    // These scores cover all of them, which `coverage` checks.
    const files = [
        // one staff as score, tab, slash and numbered notation: each beat listed several times; chords, voices
        { file: 'test-data/visual-tests/general/colors.gp', firstTrackOnly: false },
        // several tracks per master bar over several systems
        { file: 'test-data/visual-tests/layout/multi-track.gp', firstTrackOnly: false },
        // tracks with several staves each
        { file: 'test-data/visual-tests/layout/brackets-braces-staves.gp', firstTrackOnly: false },
        // a grand staff over several systems
        { file: 'test-data/visual-tests/special-tracks/grand-staff.gp', firstTrackOnly: false },
        // rests and chords in several voices
        { file: 'test-data/visual-tests/music-notation/rest-collisions.gp', firstTrackOnly: false },
        // master bars collapsed into multi-bar rests (only when the other tracks are not shown)
        { file: 'test-data/visual-tests/layout/multibar-rest.gp', firstTrackOnly: true }
    ];

    function renderLookup(
        file: string,
        firstTrackOnly: boolean,
        includeNoteBounds: boolean,
        scale: number
    ): { score: Score; lookup: BoundsLookup } | null {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = true;
        settings.core.includeNoteBounds = includeNoteBounds;
        settings.core.logLevel = LogLevel.None;
        settings.display.scale = scale;
        let score: Score;
        try {
            score = ScoreLoader.loadScoreFromBytes(new Uint8Array(fs.readFileSync(file)), settings);
        } catch {
            return null;
        }
        const renderer = new ScoreRenderer(settings);
        renderer.width = 1300;
        renderer.renderScore(score, firstTrackOnly ? [0] : score.tracks.map(t => t.index));
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

    function coverage(score: Score, lookup: BoundsLookup, covered: Set<string>) {
        if (lookup.staffSystems.length > 1) {
            covered.add('several systems');
        }
        let masterBars = 0;
        for (const system of lookup.staffSystems) {
            masterBars += system.bars.length;
            for (const masterBar of system.bars) {
                if (!masterBar.isFirstOfLine) {
                    covered.add('master bar not first of line');
                }
                for (const bar of masterBar.bars) {
                    if (bar.bar.staff.track.index > 0) {
                        covered.add('track index');
                    }
                    if (bar.bar.staff.index > 0) {
                        covered.add('staff index');
                    }
                    for (const beat of bar.beats) {
                        if (beat.beat.voice.index > 0) {
                            covered.add('voice index');
                        }
                        if (lookup.findBeats(beat.beat)!.length > 1) {
                            covered.add('beat on several staves');
                        }
                        if (!beat.notes) {
                            covered.add('beat without note bounds');
                        } else if (beat.notes.length > 0) {
                            covered.add('note bounds');
                            if (beat.notes.some(n => n.note.index > 0)) {
                                covered.add('note index');
                            }
                        }
                    }
                }
            }
        }
        if (masterBars < score.masterBars.length) {
            covered.add('multi-bar rest');
        }
    }

    function expectSameAsJson(label: string, score: Score, lookup: BoundsLookup, covered: Set<string>) {
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
        coverage(score, viaWire, covered);
    }

    it('empty-lookup', () => {
        const data = BoundsLookupWire.encode(new BoundsLookup());
        expect(data.length).toBe(0);
        expect(BoundsLookupWire.decode(data, new Score()).staffSystems.length).toBe(0);
    });

    for (const c of configurations) {
        it(`corpus-notes-${c.includeNoteBounds}-scale-${c.scale}`, () => {
            const covered = new Set<string>();
            for (const f of files) {
                const file = path.join(process.cwd(), f.file);
                const rendered = renderLookup(file, f.firstTrackOnly, c.includeNoteBounds, c.scale);
                expect(rendered, f.file).not.toBeNull();
                expectSameAsJson(f.file, rendered!.score, rendered!.lookup, covered);
            }
            const expected = [
                'beat on several staves',
                'beat without note bounds',
                'master bar not first of line',
                'multi-bar rest',
                'several systems',
                'staff index',
                'track index',
                'voice index'
            ];
            if (c.includeNoteBounds) {
                expected.push('note bounds');
                expected.push('note index');
            }
            expect(Array.from(covered).sort()).toEqual(expected.sort());
        });
    }
});
