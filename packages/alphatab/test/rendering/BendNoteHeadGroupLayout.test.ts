/**
 * The helper note heads of bends and whammys are laid out again by every finalize pass, so their layout must give
 * the same result on every call.
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { BendNoteHeadGroupGlyph } from '@coderline/alphatab/rendering/glyphs/BendNoteHeadGroupGlyph';
import { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { TestUiFacade } from '../visualTests/TestUiFacade';
import { VisualTestHelper } from '../visualTests/VisualTestHelper';

/**
 * @internal
 */
class BendNoteHeadGroupLayoutHelper {
    public static async renderFirstScoreBar(tex: string): Promise<ScoreBarRenderer> {
        await VisualTestHelper.prepareAlphaSkia();
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), new Settings());
        const score = importer.readScore();
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);
        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = 1300;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);
        const found: ScoreBarRenderer[] = [];
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    const inner = (api.renderer as unknown as ScoreRendererWrapper)
                        .instance as unknown as ScoreRenderer;
                    for (const staff of inner.layout!.systems[0].allStaves) {
                        if (staff.staffId === ScoreBarRenderer.StaffId) {
                            found.push(staff.barRenderers[0] as ScoreBarRenderer);
                            break;
                        }
                    }
                    resolve();
                });
                api.error.on(e => {
                    reject(new AlphaTabError(AlphaTabErrorType.General, `Failed to render (${e.message})`, e));
                });
                api.renderScore(score, [0]);
                setTimeout(() => reject(new Error('render timed out')), 10000);
            });
        } finally {
            api.destroy();
        }
        expect(found.length).toBe(1);
        return found[0];
    }

    /**
     * Lays out a group with one helper note of the given value several times and returns the width after each call.
     */
    public static layoutRepeatedly(renderer: ScoreBarRenderer, noteValue: number, showParenthesis: boolean): number[] {
        const beat = renderer.bar.voices[0].beats[0];
        const group = new BendNoteHeadGroupGlyph(beat, showParenthesis);
        group.renderer = renderer;
        group.addGlyph(noteValue, false, undefined);
        const widths: number[] = [];
        for (let i = 0; i < 3; i++) {
            group.doLayout();
            widths.push(group.width);
            widths.push(group.noteStartX);
        }
        return widths;
    }

    public static expectRepeatable(widths: number[]): void {
        expect(widths[2]).toBe(widths[0]);
        expect(widths[3]).toBe(widths[1]);
        expect(widths[4]).toBe(widths[0]);
        expect(widths[5]).toBe(widths[1]);
    }
}

describe('BendNoteHeadGroupLayout', () => {
    // C major: C#4 (61) needs an accidental, D4 (62) does not
    const tex = '\\track \\staff {score} C4 D4 E4 F4';

    it('repeatable-with-accidental', async () => {
        const renderer = await BendNoteHeadGroupLayoutHelper.renderFirstScoreBar(tex);
        const withAccidental = BendNoteHeadGroupLayoutHelper.layoutRepeatedly(renderer, 61, false);
        const withoutAccidental = BendNoteHeadGroupLayoutHelper.layoutRepeatedly(renderer, 62, false);
        // the accidental takes part in the layout
        expect(withAccidental[1]).toBeGreaterThan(withoutAccidental[1]);
        BendNoteHeadGroupLayoutHelper.expectRepeatable(withAccidental);
        BendNoteHeadGroupLayoutHelper.expectRepeatable(withoutAccidental);
    });

    it('repeatable-with-parenthesis', async () => {
        const renderer = await BendNoteHeadGroupLayoutHelper.renderFirstScoreBar(tex);
        const withAccidental = BendNoteHeadGroupLayoutHelper.layoutRepeatedly(renderer, 61, true);
        const withoutAccidental = BendNoteHeadGroupLayoutHelper.layoutRepeatedly(renderer, 62, true);
        expect(withAccidental[1]).toBeGreaterThan(withoutAccidental[1]);
        BendNoteHeadGroupLayoutHelper.expectRepeatable(withAccidental);
        BendNoteHeadGroupLayoutHelper.expectRepeatable(withoutAccidental);
    });

    it('accidental-space-without-parenthesis', async () => {
        // a fresh bar per group: the bar's accidental state decides whether the accidental is shown
        const r1 = await BendNoteHeadGroupLayoutHelper.renderFirstScoreBar(tex);
        const plainWithAccidental = BendNoteHeadGroupLayoutHelper.layoutRepeatedly(r1, 61, false);
        const r2 = await BendNoteHeadGroupLayoutHelper.renderFirstScoreBar(tex);
        const plainWithoutAccidental = BendNoteHeadGroupLayoutHelper.layoutRepeatedly(r2, 62, false);
        const r3 = await BendNoteHeadGroupLayoutHelper.renderFirstScoreBar(tex);
        const parenthesisWithAccidental = BendNoteHeadGroupLayoutHelper.layoutRepeatedly(r3, 61, true);
        const r4 = await BendNoteHeadGroupLayoutHelper.renderFirstScoreBar(tex);
        const parenthesisWithoutAccidental = BendNoteHeadGroupLayoutHelper.layoutRepeatedly(r4, 62, true);
        // the accidental moves the note head by the same amount with and without parenthesis
        expect(parenthesisWithAccidental[1]).toBeGreaterThan(parenthesisWithoutAccidental[1]);
        expect(plainWithAccidental[1] - plainWithoutAccidental[1]).toBeCloseTo(
            parenthesisWithAccidental[1] - parenthesisWithoutAccidental[1],
            6
        );
    });
});
