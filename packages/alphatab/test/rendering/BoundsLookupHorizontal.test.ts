/**
 * The horizontal layout renders one system split into several partials: the bounds lookup must hold
 * that system exactly once, with one beat bounds per beat and rendered staff.
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import type { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { TestUiFacade } from '../visualTests/TestUiFacade';
import { VisualTestHelper } from '../visualTests/VisualTestHelper';

/**
 * @internal
 */
class BoundsLookupHorizontalHelper {
    public static createScore(): Score {
        let tex = '\\track \\staff {score tabs} ';
        for (let i = 0; i < 12; i++) {
            tex += '3.3.4 5.2 0.1 (3.3 5.2) |';
        }
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), new Settings());
        return importer.readScore();
    }

    public static allBeatBounds(lookup: BoundsLookup): BeatBounds[] {
        const result: BeatBounds[] = [];
        for (const system of lookup.staffSystems) {
            for (const masterBar of system.bars) {
                for (const bar of masterBar.bars) {
                    for (const beat of bar.beats) {
                        result.push(beat);
                    }
                }
            }
        }
        return result;
    }

    public static async check(score: Score): Promise<void> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.barCountPerPartial = 2;

        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = 1300;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        const errors: string[] = [];
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    BoundsLookupHorizontalHelper._collectErrors(api, errors);
                    resolve();
                });
                api.error.on(e => {
                    reject(
                        new AlphaTabError(
                            AlphaTabErrorType.General,
                            `Failed to render bounds score (${e.message} ${e.stack})`,
                            e
                        )
                    );
                });
                const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), settings);
                api.renderScore(renderScore, [0]);
                setTimeout(() => reject(new Error('bounds render timed out')), 10000);
            });
        } finally {
            api.destroy();
        }

        expect(errors.join('\n')).toBe('');
    }

    private static _collectErrors(api: AlphaTabApiBase<unknown>, errors: string[]) {
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        const inner = wrapper.instance as unknown as ScoreRenderer;
        const lookup = inner.boundsLookup!;
        const systems = inner.layout!.systems;
        if (systems.length !== 1) {
            errors.push(`expected a single layout system, got ${systems.length}`);
            return;
        }
        if (lookup.staffSystems.length !== 1) {
            errors.push(`expected one staff system in the bounds lookup, got ${lookup.staffSystems.length}`);
        }

        let beatCount = 0;
        for (const bar of api.score!.tracks[0].staves[0].bars) {
            for (const beat of bar.voices[0].beats) {
                beatCount++;
                const all = lookup.findBeats(beat);
                const count = all ? all.length : 0;
                if (count !== 2) {
                    errors.push(
                        `beat ${beat.index} in bar ${bar.index}: expected 2 beat bounds (score, tabs), got ${count}`
                    );
                } else if (all![0].barBounds === all![1].barBounds) {
                    errors.push(
                        `beat ${beat.index} in bar ${bar.index}: both beat bounds belong to the same bar bounds`
                    );
                }
            }
        }

        const actual = BoundsLookupHorizontalHelper.allBeatBounds(lookup);
        if (actual.length !== beatCount * 2) {
            errors.push(`expected ${beatCount * 2} beat bounds in total, got ${actual.length}`);
        }

        // the bounds of the system built once into a fresh lookup
        const rebuilt = new BoundsLookup();
        inner.boundsLookup = rebuilt;
        try {
            systems[0].buildBoundingsLookup(0, 0);
            rebuilt.finish(inner.settings.display.scale);
        } finally {
            inner.boundsLookup = lookup;
        }
        const expected = BoundsLookupHorizontalHelper.allBeatBounds(rebuilt);
        if (expected.length !== actual.length) {
            errors.push(`a single build has ${expected.length} beat bounds, the lookup ${actual.length}`);
            return;
        }
        for (let i = 0; i < expected.length; i++) {
            const e = expected[i];
            const a = actual[i];
            if (
                e.beat !== a.beat ||
                e.realBounds.x !== a.realBounds.x ||
                e.realBounds.y !== a.realBounds.y ||
                e.realBounds.w !== a.realBounds.w ||
                e.realBounds.h !== a.realBounds.h ||
                e.visualBounds.x !== a.visualBounds.x ||
                e.visualBounds.w !== a.visualBounds.w ||
                e.onNotesX !== a.onNotesX
            ) {
                errors.push(`beat bounds ${i} differ from a single build of the system`);
            }
        }
    }
}

describe('BoundsLookupHorizontal', () => {
    it('holds-the-system-once', async () => {
        await BoundsLookupHorizontalHelper.check(BoundsLookupHorizontalHelper.createScore());
    });
});
