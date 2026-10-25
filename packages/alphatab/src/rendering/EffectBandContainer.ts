import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Voice } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import type { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';

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
    private _bands: EffectBand[] = [];
    /** Per-voice (effectId → band) lookup; nested to avoid string-key allocation in `_createOrResizeGlyph`. */
    private _bandLookup: Map<number, Map<string, EffectBand>> | null = null;
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
        for (const effectBand of this._bands) {
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
        for (const band of this._bands) {
            band.populateSkyline();
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

    public createVoiceGlyphs(voice: Voice) {
        const renderer = this._renderer;
        const infos = this.infos;
        const beats = voice.beats;
        for (let i = 0, n = infos.length; i < n; i++) {
            const info = infos[i];
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
        this._bands.push(band);
        let bandLookup = this._bandLookup;
        if (!bandLookup) {
            bandLookup = new Map<number, Map<string, EffectBand>>();
            this._bandLookup = bandLookup;
        }
        let perVoice = bandLookup.get(voice.index);
        if (!perVoice) {
            perVoice = new Map<string, EffectBand>();
            bandLookup.set(voice.index, perVoice);
        }
        perVoice.set(info.effect.effectId, band);
        return band;
    }

    public doLayout() {
        // splice() instead of `.length = 0`: transpile-safe array clear.
        this._bands.splice(0, this._bands.length);
        this._bandLookup?.clear();
        this.height = 0;
    }

    public paint(cx: number, cy: number, canvas: ICanvas) {
        const resources = this._renderer.resources;
        for (const effectBand of this._bands) {
            canvas.color = effectBand.voice.index === 0 ? resources.mainGlyphColor : resources.secondaryGlyphColor;
            if (!effectBand.isEmpty) {
                effectBand.paint(cx, cy, canvas);
            }
        }
    }

    public getBand(voice: Voice, effectId: string): EffectBand | null {
        const bandLookup = this._bandLookup;
        if (!bandLookup) {
            return null;
        }
        const perVoice = bandLookup.get(voice.index);
        if (!perVoice) {
            return null;
        }
        return perVoice.get(effectId) ?? null;
    }
}
