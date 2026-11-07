/**
 * Resizing in small steps (most systems keep their bars between passes) must lay out like a fresh
 * render at the same width.
 */
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { Score } from '@coderline/alphatab/model/Score';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import type { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { TestPlatform } from '../TestPlatform';

describe('IncrementalResize', () => {
    const widths = [1295, 1290, 1300, 900, 1290, 1000, 990, 1005];

    function createSettings(barCount: number): Settings {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;
        settings.core.includeNoteBounds = true;
        settings.display.barCount = barCount;
        return settings;
    }

    async function loadScore(source: string, settings: Settings): Promise<Score> {
        if (source.startsWith('\\')) {
            const importer = new AlphaTexImporter();
            importer.initFromString(source, settings);
            return importer.readScore();
        }
        return ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile(source), settings);
    }

    async function createRenderer(
        source: string,
        width: number,
        hideEmptyStaves: boolean,
        barCount: number
    ): Promise<ScoreRenderer> {
        const settings = createSettings(barCount);
        const score = await loadScore(source, settings);
        score.stylesheet.hideEmptyStaves = hideEmptyStaves;
        const renderer = new ScoreRenderer(settings);
        renderer.width = width;
        const tracks: number[] = [];
        for (const t of score.tracks) {
            tracks.push(t.index);
        }
        renderer.renderScore(score, tracks);
        return renderer;
    }

    function addBounds(out: number[], b: Bounds) {
        out.push(b.x);
        out.push(b.y);
        out.push(b.w);
        out.push(b.h);
    }

    function flatten(lookup: BoundsLookup): number[] {
        const out: number[] = [];
        for (const system of lookup.staffSystems) {
            out.push(system.bars.length);
            addBounds(out, system.realBounds);
            addBounds(out, system.visualBounds);
            for (const masterBar of system.bars) {
                out.push(masterBar.index);
                addBounds(out, masterBar.realBounds);
                addBounds(out, masterBar.visualBounds);
                addBounds(out, masterBar.lineAlignedBounds);
                for (const bar of masterBar.bars) {
                    out.push(bar.bar.staff.track.index);
                    out.push(bar.bar.staff.index);
                    addBounds(out, bar.realBounds);
                    addBounds(out, bar.visualBounds);
                    for (const beat of bar.beats) {
                        out.push(beat.beat.index);
                        out.push(beat.onNotesX);
                        addBounds(out, beat.realBounds);
                        addBounds(out, beat.visualBounds);
                        if (beat.notes) {
                            for (const note of beat.notes) {
                                out.push(note.note.index);
                                addBounds(out, note.noteHeadBounds);
                            }
                        }
                    }
                }
            }
        }
        return out;
    }

    function expectNear(actual: number[], expected: number[], step: number) {
        expect(actual.length).toBe(expected.length);
        let firstDifference = -1;
        for (let i = 0; i < expected.length; i++) {
            if (Math.abs(actual[i] - expected[i]) >= 0.001) {
                firstDifference = i;
                break;
            }
        }
        expect(`step ${step}: ${firstDifference}`).toBe(`step ${step}: -1`);
    }

    /**
     * @param source A test data file path, or alphaTex starting with a backslash.
     */
    async function checkSequence(source: string, hideEmptyStaves: boolean, barCount: number) {
        const resized = await createRenderer(source, 1300, hideEmptyStaves, barCount);
        for (let i = 0; i < widths.length; i++) {
            resized.width = widths[i];
            resized.resizeRender();
            const fresh = await createRenderer(source, widths[i], hideEmptyStaves, barCount);
            expect(resized.layout!.systems.length).toBe(fresh.layout!.systems.length);
            expectNear(flatten(resized.boundsLookup!), flatten(fresh.boundsLookup!), i);
        }
    }

    it('single-track', async () => {
        await checkSequence('test-data/guitarpro5/canon.gp5', false, -1);
    });

    it('multi-track-hidden-empty-staves', async () => {
        await checkSequence('test-data/audio/full-song.gp5', true, 60);
    });

    it('whammy-bar-helper-notes', async () => {
        await checkSequence('test-data/visual-tests/effects-and-annotations/tremolo-bar.gp', false, -1);
    });

    it('numbered-chord-slots', async () => {
        // chords with and without octave dots in their gaps spread over the bars, a second voice in the first
        // bars only: the bars change systems on resize and with them the slots of their system
        const bars =
            '(C4 E4).4 (C5 G5).4 (D4 F4).4 r.4 | (C4 E4 G4).2 (D4 G4).2 | (E4 G4).4 (C4 E4).4 r.2 | (C6 E6).2 r.2 |';
        await checkSequence(
            `\\track \\staff {numbered} ${bars.repeat(5)} \\voice C3.1 | C3.1 | C3.1 | C3.1`,
            false,
            -1
        );
    });

    it('numbered-voices', async () => {
        // the second voice ends after bar 6 (later bars have an empty second voice), so systems with and
        // without its row re-form on resize
        const upper = 'C5.4 D5 (E5 G5) F5 | G5.2 E5.8 D5 C5.4 |';
        const lower = 'C4.8 D4 E4 F4 G4.2 | (C3 G3).2 r.2 |';
        const single = 'C5.1 | D5.2 E5.2 |';
        await checkSequence(
            `\\track \\staff {score numbered}
            \\voice ${upper.repeat(3)} ${single.repeat(4)}
            \\voice ${lower.repeat(3)}`,
            false,
            -1
        );
    });
});
