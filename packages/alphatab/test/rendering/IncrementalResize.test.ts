/**
 * Resizing in small steps (most systems keep their bars between passes) must lay out like a fresh
 * render at the same width.
 */
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
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

    async function createRenderer(
        file: string,
        width: number,
        hideEmptyStaves: boolean,
        barCount: number
    ): Promise<ScoreRenderer> {
        const settings = createSettings(barCount);
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile(file), settings);
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

    async function checkSequence(file: string, hideEmptyStaves: boolean, barCount: number) {
        const resized = await createRenderer(file, 1300, hideEmptyStaves, barCount);
        for (let i = 0; i < widths.length; i++) {
            resized.width = widths[i];
            resized.resizeRender();
            const fresh = await createRenderer(file, widths[i], hideEmptyStaves, barCount);
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
});
