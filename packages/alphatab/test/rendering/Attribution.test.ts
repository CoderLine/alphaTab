import { describe, expect, it } from 'vitest';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import type { Score } from '@coderline/alphatab/model/Score';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { Settings } from '@coderline/alphatab/Settings';
import { StaveProfile } from '@coderline/alphatab/StaveProfile';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

/**
 * @internal
 */
class AttributionRenderHints implements RenderHints {
    public reuseViewport?: boolean;
    public firstChangedMasterBar?: number;
}

/**
 * @internal
 */
class AttributionTestRun {
    public readonly settings: Settings;
    public readonly renderer: ScoreRenderer;
    public readonly layouts: RenderFinishedEventArgs[] = [];
    public readonly results: Map<string, RenderFinishedEventArgs> = new Map<string, RenderFinishedEventArgs>();

    public constructor(settings: Settings) {
        this.settings = settings;
        this.renderer = new ScoreRenderer(settings);
        this.renderer.partialLayoutFinished.on(e => {
            this.layouts.push(e);
        });
        this.renderer.partialRenderFinished.on(e => {
            this.results.set(e.id, e);
        });
        this.renderer.error.on(e => {
            throw e;
        });
    }

    public renderAllLazy(): void {
        for (const e of this.layouts) {
            this.renderer.renderResult(e.id);
        }
    }

    public get markColor(): string {
        return this.settings.display.resources.staffLineColor.rgba;
    }

    /**
     * The path data of every staff-line-coloured path, grouped by partial. Staff lines are rects unless the
     * attribution is filled together with them, so these are exactly the attribution paths.
     */
    public markPaths(): Map<string, string[]> {
        const marks = new Map<string, string[]>();
        for (const [id, e] of this.results) {
            const paths = AttributionTestRun.coloredPaths(e.renderResult as string, this.markColor);
            if (paths.length > 0) {
                marks.set(id, paths);
            }
        }
        return marks;
    }

    public allMarkPaths(): string[] {
        const all: string[] = [];
        for (const [_, paths] of this.markPaths()) {
            for (const p of paths) {
                all.push(p);
            }
        }
        return all;
    }

    public owners(): BarRendererBase[] {
        const owners: BarRendererBase[] = [];
        for (const system of this.renderer.layout!.systems) {
            for (const staff of system.allStaves) {
                for (const r of staff.barRenderers) {
                    if (r.attribution) {
                        owners.push(r);
                    }
                }
            }
        }
        return owners;
    }

    /**
     * Expects exactly one attribution, on the top staff of the first system, ending at `expectedBarIndex`
     * (default: the last bar of the first system).
     */
    public expectSingleMark(expectedBarIndex: number = -1): BarRendererBase {
        const owners = this.owners();
        expect(owners.length).toBe(1);
        const owner = owners[0];
        const firstSystem = this.renderer.layout!.systems[0];
        expect(owner.staff!.system).toBe(firstSystem);
        expect(owner.staff!.isFirstInSystem).toBe(true);
        expect(owner.lastBar.index).toBe(expectedBarIndex === -1 ? firstSystem.lastBarIndex : expectedBarIndex);

        const marks = this.markPaths();
        expect(marks.size).toBe(1);
        for (const [id, paths] of marks) {
            expect(paths.length).toBe(1);
            const e = this.results.get(id)!;
            expect(e.firstMasterBarIndex).not.toBe(-1);
            expect(e.lastMasterBarIndex).toBe(owner.lastBar.index);
            expect(AttributionTestRun.minX(paths[0])).toBeGreaterThanOrEqual(0);
        }

        const glyph = owner.attribution!;
        const staff: RenderStaff = owner.staff!;
        const markTop = -glyph.y;
        expect(staff.topOverflow).toBeGreaterThanOrEqual(markTop);
        expect(staff.topOverflow).toBeGreaterThanOrEqual(staff.systemSkyline.upSky.maxHeight());
        const markBottom = -(glyph.y + glyph.height);
        expect(markBottom).toBeGreaterThanOrEqual(
            owner.staffTopClearance + owner.smuflMetrics.oneStaffSpace * 0.5 - 0.01
        );
        return owner;
    }

    public static coloredPaths(svg: string, color: string): string[] {
        const paths: string[] = [];
        const chunks = svg.split('<path d="');
        for (let i = 1; i < chunks.length; i++) {
            const chunk = chunks[i];
            const end = chunk.indexOf('"');
            if (chunk.substring(end).startsWith(`" fill="${color}"`)) {
                paths.push(chunk.substring(0, end));
            }
        }
        return paths;
    }

    public static minX(d: string): number {
        let minX = Number.MAX_SAFE_INTEGER;
        for (const token of d.split(' ')) {
            if (token.length < 2) {
                continue;
            }
            const values = token.substring(1).split(',');
            for (let i = 0; i < values.length; i += 2) {
                minX = Math.min(minX, Number.parseFloat(values[i]));
            }
        }
        return minX;
    }
}

describe('AttributionTests', () => {
    // songs up to 10 bars are rendered without attribution
    const filler = ' | :4 r r r r'.repeat(10);
    const fourBars = `
        \\tempo 120
        .
        :4 C4 D4 E4 F4 | G4 A4 B4 C5 | C5 B4 A4 G4 | F4 E4 D4 C4 ${filler}
    `;

    async function render(
        tex: string,
        configure?: (settings: Settings, score: Score) => void,
        trackIndexes?: number[]
    ): Promise<AttributionTestRun> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;
        const score = ScoreLoader.loadAlphaTex(tex, settings);
        if (configure) {
            configure(settings, score);
        }
        const run = new AttributionTestRun(settings);
        run.renderer.width = 700;
        run.renderer.renderScore(score, trackIndexes ?? score.tracks.map(t => t.index));
        return run;
    }

    it('end-of-first-system', async () => {
        const run = await render(fourBars, (s, _score) => {
            s.display.barsPerRow = 2;
        });
        expect(run.renderer.layout!.systems.length).toBeGreaterThan(1);
        const owner = run.expectSingleMark(1);
        expect(owner.isLastOfStaff).toBe(true);
    });

    it('no-separate-partial', async () => {
        const run = await render(fourBars);
        for (const [_, e] of run.results) {
            const svg = e.renderResult as string;
            expect(svg.includes('alphaTab')).toBe(false);
            expect(svg.includes('<text') && e.firstMasterBarIndex === -1 && e.y > 0).toBe(false);
        }
        run.expectSingleMark();
    });

    it('encoding-differs-per-render', async () => {
        const first = await render(fourBars);
        const second = await render(fourBars);
        const a = first.allMarkPaths();
        const b = second.allMarkPaths();
        expect(a.length).toBe(1);
        expect(b.length).toBe(1);
        expect(a[0]).not.toBe(b[0]);
    });

    it('page-parchment-horizontal', async () => {
        for (const mode of [LayoutMode.Page, LayoutMode.Parchment, LayoutMode.Horizontal]) {
            const run = await render(fourBars, (s, _score) => {
                s.display.layoutMode = mode;
            });
            // horizontal: end of the first partial of 10 bars
            run.expectSingleMark(mode === LayoutMode.Horizontal ? 9 : -1);
        }
    });

    it('horizontal-end-of-first-partial', async () => {
        const run = await render(fourBars, (s, _score) => {
            s.display.layoutMode = LayoutMode.Horizontal;
            s.display.barCountPerPartial = 2;
        });
        run.expectSingleMark(1);
        for (const [id, _] of run.markPaths()) {
            expect(run.results.get(id)!.firstMasterBarIndex).toBe(0);
        }
    });

    it('stave-profiles-and-notations', async () => {
        const staffKinds = ['score', 'tabs', 'slash', 'numbered', 'score tabs', 'tabs slash'];
        for (const kind of staffKinds) {
            const run = await render(`\\staff {${kind}} :4 3.3 5.2 7.1 0.6 | 3.3 5.2 7.1 0.6 ${filler}`);
            run.expectSingleMark();
        }

        const profiles = [StaveProfile.Score, StaveProfile.Tab, StaveProfile.TabMixed, StaveProfile.ScoreTab];
        for (const profile of profiles) {
            const run = await render(
                `\\staff {score tabs} :4 3.3 5.2 7.1 0.6 | 3.3 5.2 7.1 0.6 ${filler}`,
                (s, _score) => {
                    s.display.staveProfile = profile;
                }
            );
            run.expectSingleMark();
        }
    });

    it('percussion', async () => {
        const run = await render(`
            \\instrument "percussion"
            \\articulation defaults
            .
            "Snare (hit)" "Snare (hit)" "Snare (hit)" "Snare (hit)" | "Snare (hit)" "Snare (hit)" "Snare (hit)" "Snare (hit)"
            ${filler}
        `);
        run.expectSingleMark();
    });

    it('multi-track-top-staff-only', async () => {
        const run = await render(`
            \\track "A"
            :4 C4 D4 E4 F4 | G4 A4 B4 C5 ${filler}
            \\track "B"
            :4 C3 D3 E3 F3 | G3 A3 B3 C4 ${filler}
        `);
        const owner = run.expectSingleMark();
        expect(owner.bar.staff.track.index).toBe(0);
    });

    it('hidden-empty-top-staff', async () => {
        const run = await render(
            `
            \\hideEmptyStaves
            \\hideEmptyStavesInFirstSystem
            \\track "A"
            :4 r r r r | C4 D4 E4 F4 ${filler}
            \\track "B"
            :4 C3 D3 E3 F3 | G3 A3 B3 C4 ${filler}
        `,
            (s, _score) => {
                s.display.barsPerRow = 1;
            }
        );
        const owner = run.expectSingleMark();
        expect(owner.bar.staff.track.index).toBe(1);
    });

    it('start-bar-and-bar-count', async () => {
        const run = await render(fourBars, (s, _score) => {
            s.display.startBar = 2;
            s.display.barCount = 2;
        });
        const owner = run.expectSingleMark();
        expect(owner.lastBar.index).toBe(2);
    });

    it('no-attribution-up-to-ten-bars', async () => {
        for (const barCount of [1, 10]) {
            const small = await render(`:4 C4 D4 E4 F4 ${' | :4 r r r r'.repeat(barCount - 1)}`);
            expect(small.renderer.score!.masterBars.length).toBe(barCount);
            expect(small.owners().length).toBe(0);
            expect(small.allMarkPaths().length).toBe(0);
        }

        const run = await render(`:4 C4 D4 E4 F4 ${' | :4 r r r r'.repeat(10)}`);
        expect(run.renderer.score!.masterBars.length).toBe(11);
        run.expectSingleMark();
    });

    it('more-than-two-rendered-tracks', async () => {
        const threeTracks = `
            \\track "A"
            :4 C4 D4 E4 F4
            \\track "B"
            :4 C3 D3 E3 F3
            \\track "C"
            :4 C2 D2 E2 F2
        `;
        const two = await render(threeTracks, undefined, [0, 2]);
        expect(two.owners().length).toBe(0);
        expect(two.allMarkPaths().length).toBe(0);

        const three = await render(threeTracks);
        const owner = three.expectSingleMark();
        expect(owner.bar.staff.track.index).toBe(0);
    });

    it('song-length-not-displayed-range', async () => {
        const run = await render(fourBars, (s, _score) => {
            s.display.barCount = 1;
        });
        run.expectSingleMark(0);
    });

    it('multi-bar-rest-at-end', async () => {
        const run = await render(
            `
            \\track "A" { multiBarRest }
            :4 C4 D4 E4 F4 | r r r r | r r r r | r r r r ${filler}
        `,
            (s, _score) => {
                s.display.barsPerRow = 2;
            }
        );
        const owner = run.expectSingleMark();
        expect(owner.additionalMultiRestBars).toBeTruthy();
        expect(owner.bar.index).toBe(1);
    });

    it('multi-bar-rest-count-below-mark', async () => {
        const run = await render(
            'C4.1 | C4.1 | C4.1 | r.1 | r.1 | r.1 | r.1 | C4.1 | C4.1 | C4.1 | C4.1 | r.1 | r.1 | r.1 | C4.1',
            (s, score) => {
                s.display.layoutMode = LayoutMode.Page;
                score.stylesheet.multiTrackMultiBarRest = true;
                score.stylesheet.perTrackMultiBarRest = new Set<number>([0]);
            }
        );
        run.results.clear();
        run.renderer.width = 500;
        run.renderer.resizeRender();
        const owner = run.expectSingleMark();
        expect(owner.additionalMultiRestBars).toBeTruthy();
        const markBottom = -(owner.attribution!.y + owner.attribution!.height);
        // the count above the multi-bar rest is the only content above this bar (overflow is rounded up)
        expect(owner.contentTopOverflow).toBeGreaterThan(0);
        expect(markBottom).toBeGreaterThanOrEqual(
            owner.contentTopOverflow - 1 + owner.smuflMetrics.oneStaffSpace * 0.5
        );
    });

    it('repeat-count-below-mark', async () => {
        const run = await render(`:4 C4 D4 E4 F4 | \\ro \\rc 3 G4 A4 B4 C5 ${filler}`, (s, _score) => {
            s.display.barsPerRow = 2;
        });
        const owner = run.expectSingleMark();
        const markBottom = -(owner.attribution!.y + owner.attribution!.height);
        const repeatCountTop = owner.postBeatLocalSkyline.upSky.maxHeight();
        expect(repeatCountTop).toBeGreaterThan(0);
        expect(markBottom).toBeGreaterThanOrEqual(repeatCountTop + owner.smuflMetrics.oneStaffSpace * 0.5 - 0.01);
    });

    it('rests-above-effect-bands', async () => {
        // the jump text spans the whole bar, so it lies under the attribution
        const run = await render(`:4 C4 D4 E4 F4 | \\jump DaCapoAlFine G4 A4 B4 C5 ${filler}`, (s, _score) => {
            s.display.barsPerRow = 2;
        });
        const owner = run.expectSingleMark();
        let bandTop = 0;
        for (const b of owner.topEffects.bands) {
            if (!b.isEmpty) {
                bandTop = Math.max(bandTop, b.placedMagnitude + b.height);
            }
        }
        expect(bandTop).toBeGreaterThan(0);
        const markBottom = -(owner.attribution!.y + owner.attribution!.height);
        expect(markBottom).toBeCloseTo(bandTop + owner.smuflMetrics.oneStaffSpace * 0.5, 5);
    });

    it('no-extra-height-below-higher-content', async () => {
        // the tempo at the bar start reaches higher than the attribution needs at the bar end
        const tex = `:4 C4 D4 E4 F4 | \\tempo 90 C6 D6 E6 F6 | G4 A4 B4 C5 ${filler}`;
        const threePerRow = (s: Settings, _score: Score) => {
            s.display.barsPerRow = 3;
        };
        const run = await render(tex, threePerRow);
        const owner = run.expectSingleMark();
        const staff = owner.staff!;
        let contentTop = 0;
        for (const r of staff.barRenderers) {
            contentTop = Math.max(contentTop, r.topOverflow);
        }
        expect(-owner.attribution!.y).toBeLessThan(contentTop);
        expect(staff.topOverflow).toBe(contentTop);
    });

    it('notation-unaffected', async () => {
        // the same first system once in a 10 bar song (no attribution) and once in an 11 bar song
        const music = ':4 C4 D4 E4 F4 | \\jump DaCapoAlFine \\tempo 90 \\ro \\rc 3 C6 D6 E6 F6';
        const twoPerRow = (s: Settings, _score: Score) => {
            s.display.barsPerRow = 2;
        };
        const without = await render(`${music}${' | :4 r r r r'.repeat(8)}`, twoPerRow);
        const withMark = await render(`${music}${' | :4 r r r r'.repeat(9)}`, twoPerRow);
        expect(without.owners().length).toBe(0);
        withMark.expectSingleMark();

        const a = without.renderer.layout!.systems[0].allStaves[0];
        const b = withMark.renderer.layout!.systems[0].allStaves[0];
        expect(b.barRenderers.length).toBe(a.barRenderers.length);
        for (let i = 0; i < a.barRenderers.length; i++) {
            const ra = a.barRenderers[i];
            const rb = b.barRenderers[i];
            expect(rb.x).toBe(ra.x);
            expect(rb.width).toBe(ra.width);
            expect(rb.contentTopOverflow).toBe(ra.contentTopOverflow);
            expect(rb.topEffects.height).toBe(ra.topEffects.height);
            expect(rb.topEffects.bands.length).toBe(ra.topEffects.bands.length);
            for (let k = 0; k < ra.topEffects.bands.length; k++) {
                expect(rb.topEffects.bands[k].placedMagnitude).toBe(ra.topEffects.bands[k].placedMagnitude);
            }
        }
        expect(b.topOverflow).toBeGreaterThanOrEqual(a.topOverflow);
    });

    it('narrow-last-bar', async () => {
        const run = await render(`:4 C4 D4 E4 F4 ${filler}`, (s, score) => {
            s.display.layoutMode = LayoutMode.Parchment;
            score.defaultSystemsLayout = 2;
            score.masterBars[0].displayScale = 10;
            score.tracks[0].staves[0].bars[0].displayScale = 10;
        });
        const owner = run.expectSingleMark();
        expect(owner.attribution!.width).toBeGreaterThan(owner.width);
        expect(owner.attribution!.x).toBeLessThan(0);
    });

    it('partial-update', async () => {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = true;
        settings.display.barsPerRow = 1;
        const score = ScoreLoader.loadAlphaTex(fourBars, settings);
        const run = new AttributionTestRun(settings);
        run.renderer.width = 700;
        run.renderer.renderScore(score, [0]);
        run.renderAllLazy();
        run.expectSingleMark(0);

        for (const changed of [2, 0]) {
            run.layouts.splice(0, run.layouts.length);
            run.results.clear();
            const hints = new AttributionRenderHints();
            hints.firstChangedMasterBar = changed;
            run.renderer.render(hints);
            expect(run.renderer.layout!.systems.length).toBe(14);
            run.renderAllLazy();
            run.expectSingleMark(0);
        }
    });

    it('resize', async () => {
        const run = await render(fourBars);
        const initialHeight = run.renderer.layout!.height;
        for (const width of [300, 500, 700]) {
            run.results.clear();
            run.renderer.width = width;
            run.renderer.resizeRender();
            run.expectSingleMark();
        }
        expect(run.renderer.layout!.height).toBe(initialHeight);
    });
});
