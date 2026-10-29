/**
 * Painting must not change the layout: the note bounds of a painted renderer after resizes equal
 * those of a fresh render at the same width.
 */
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { NoteXPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import type { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

describe('TabNoteBoundsPaint', () => {
    // chords whose fret numbers differ in width
    const tex = '\\track \\staff {score tabs} (0.1 12.2) (3.3 10.4) 5.2 (1.5 15.6) | (0.1 12.2) 7.3 (2.2 11.1) 0.6 |';

    function createRenderer(width: number, paint: boolean = true): ScoreRenderer {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = !paint;
        settings.core.includeNoteBounds = true;
        const renderer = new ScoreRenderer(settings);
        renderer.width = width;
        renderer.renderScore(ScoreLoader.loadAlphaTex(tex, settings), [0]);
        return renderer;
    }

    function noteBounds(lookup: BoundsLookup): number[] {
        const out: number[] = [];
        for (const system of lookup.staffSystems) {
            for (const masterBar of system.bars) {
                for (const bar of masterBar.bars) {
                    for (const beat of bar.beats) {
                        if (beat.notes) {
                            for (const note of beat.notes) {
                                const b = note.noteHeadBounds;
                                out.push(note.note.id, b.x, b.y, b.w, b.h);
                            }
                        }
                    }
                }
            }
        }
        return out;
    }

    it('fret-number-widths', () => {
        const lookup = createRenderer(1300).boundsLookup!;
        const chord = lookup.staffSystems[0].bars[0].bars[1].beats[0];
        expect(chord.notes!.length).toBe(2);
        expect(chord.notes![0].noteHeadBounds.w).not.toBeCloseTo(chord.notes![1].noteHeadBounds.w, 3);
    });

    it('resize-equals-fresh-render', () => {
        const painted = createRenderer(1300);
        const initial = noteBounds(painted.boundsLookup!);
        expect(initial.length).toBeGreaterThan(0);

        painted.width = 1000;
        painted.resizeRender();
        expect(noteBounds(painted.boundsLookup!)).toEqual(noteBounds(createRenderer(1000).boundsLookup!));

        painted.width = 1300;
        painted.resizeRender();
        expect(noteBounds(painted.boundsLookup!)).toEqual(initial);
    });

    it('right-note-position-is-column-edge', () => {
        // slides and bends start at the right edge of the column in which the fret numbers are centered
        for (const paint of [false, true]) {
            const renderer = createRenderer(1300, paint);
            const beat = renderer.score!.tracks[0].staves[0].bars[0].voices[0].beats[0];
            const tab = renderer.layout!.getRendererForBar(TabBarRenderer.StaffId, beat.voice.bar)!;
            const narrow = tab.getNoteX(beat.notes[0], NoteXPosition.Right);
            const wide = tab.getNoteX(beat.notes[1], NoteXPosition.Right);
            expect(narrow).toBeCloseTo(wide, 6);
        }
    });
});
