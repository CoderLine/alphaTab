import type { Beat } from '@coderline/alphatab/model/Beat';
import { type Voice, VoiceSubElement } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBand, type EffectBandXRange } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * An effect of a staff that can create glyphs there: its notation element is visible and it is
 * not hidden for the staff's track.
 * @internal
 */
export class ActiveEffectBand {
    public readonly effect: EffectInfo;
    /** Visual-stack position within {@link EffectInfo.placementCategory}. Higher value = closer to staff. */
    public readonly order: number;
    public readonly shouldCreateGlyph: (renderer: BarRendererBase, beat: Beat) => boolean;

    public constructor(effect: EffectInfo, order: number) {
        this.effect = effect;
        this.order = order;
        this.shouldCreateGlyph = effect.shouldCreateGlyph;
    }
}

/**
 * Per-(voice × effect) {@link EffectBand} list for one side of a bar
 * renderer. Owns band lifecycle, glyph alignment, painting. Placement
 * is delegated to {@link EffectSystemPlacement}.
 * @internal
 */
export class EffectBandContainer {
    /** Shared by all containers without bands; never modified. */
    private static readonly _noBands: EffectBand[] = [];
    private _bands: EffectBand[] = EffectBandContainer._noBands;
    public height: number = 0;

    public infos!: ActiveEffectBand[];
    private _renderer: BarRendererBase;
    private _isTopContainer: boolean;

    public get bands(): EffectBand[] {
        return this._bands;
    }

    public get isTopContainer(): boolean {
        return this._isTopContainer;
    }

    public alignGlyphs() {
        const bands = this._bands;
        for (let i = 0, n = bands.length; i < n; i++) {
            const effectBand = bands[i];
            effectBand.resetHeight();
            effectBand.alignGlyphs();
        }
    }

    public registerLayoutingInfo(layoutings: BarLayoutingInfo): void {
        for (const band of this._bands) {
            band.registerLayoutingInfo(layoutings);
        }
    }

    public finalizeChainSpans(): void {
        for (const band of this._bands) {
            band.finalizeChainSpans();
        }
    }

    public populateSkyline(): void {
        const bands = this._bands;
        for (let i = 0, n = bands.length; i < n; i++) {
            bands[i].populateSkyline();
        }
    }

    public get previousContainer(): EffectBandContainer | undefined {
        return this._renderer.index === 0
            ? undefined
            : this._isTopContainer
              ? this._renderer.previousRenderer!.topEffects
              : this._renderer.previousRenderer!.bottomEffects;
    }

    public get isLinkedToPreviousRenderer() {
        for (let i = 0, n = this._bands.length; i < n; i++) {
            if (this._bands[i].isLinkedToPrevious) {
                return true;
            }
        }
        return false;
    }

    public constructor(renderer: BarRendererBase, isTopContainer: boolean) {
        this._renderer = renderer;
        this._isTopContainer = isTopContainer;
    }

    /**
     * @param barStartOnly Creates only the glyphs placed at the start of the bar
     * ({@link EffectBarGlyphSizing.SingleStartBar}), for renderers without beat glyphs like multi-bar rests.
     */
    public createVoiceGlyphs(voice: Voice, barStartOnly: boolean) {
        const renderer = this._renderer;
        const infos = this.infos;
        const beats = voice.beats;
        for (let i = 0, n = infos.length; i < n; i++) {
            const info = infos[i];
            if (barStartOnly && info.effect.sizingMode !== EffectBarGlyphSizing.SingleStartBar) {
                continue;
            }
            // bands are created on the first beat with a glyph
            let band: EffectBand | undefined = undefined;
            for (let j = 0, m = beats.length; j < m; j++) {
                const b = beats[j];
                if (band !== undefined) {
                    band.createGlyph(b);
                } else if (info.shouldCreateGlyph(renderer, b)) {
                    band = this._createBand(voice, info);
                    band.addBeatGlyph(b);
                }
            }
        }
    }

    private _createBand(voice: Voice, info: ActiveEffectBand): EffectBand {
        const band = new EffectBand(voice, info.effect, this, this._renderer, info.order);
        band.doLayout();
        if (this._bands.length === 0) {
            this._bands = [band];
        } else {
            this._bands.push(band);
        }
        return band;
    }

    public doLayout() {
        this._bands = EffectBandContainer._noBands;
        this.height = 0;
    }

    public paint(cx: number, cy: number, canvas: ICanvas) {
        for (const effectBand of this._bands) {
            ElementStyleHelper.applyVoice(canvas, VoiceSubElement.Glyphs, effectBand.voice, true);
            if (!effectBand.isEmpty) {
                effectBand.paint(cx, cy, canvas);
            }
        }
    }

    private static readonly _overhangRangeScratch: EffectBandXRange = { xStart: 0, xEnd: 0 };

    /**
     * Paints the bands which have glyphs left of the bar start.
     */
    public paintLeftOverhang(cx: number, cy: number, canvas: ICanvas) {
        const range = EffectBandContainer._overhangRangeScratch;
        for (const effectBand of this._bands) {
            if (effectBand.computeLocalXRange(range) && effectBand.x + range.xStart < 0) {
                ElementStyleHelper.applyVoice(canvas, VoiceSubElement.Glyphs, effectBand.voice, true);
                effectBand.paint(cx, cy, canvas);
            }
        }
    }

    public getBand(voice: Voice, effectId: string): EffectBand | null {
        const bands = this._bands;
        const voiceIndex = voice.index;
        for (let i = 0, n = bands.length; i < n; i++) {
            const band = bands[i];
            if (band.voice.index === voiceIndex && band.info.effectId === effectId) {
                return band;
            }
        }
        return null;
    }
}
