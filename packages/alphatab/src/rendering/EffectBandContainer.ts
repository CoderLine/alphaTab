import type { Voice } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectBandInfo } from '@coderline/alphatab/rendering/BarRendererFactory';
import { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBandSizingInfo } from '@coderline/alphatab/rendering/EffectBandSizingInfo';
import type { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';

/**
 * Wraps the whole effect band staff for having two times the same container
 * holding bands (one for the top effects, one for the bottom effects)
 * @internal
 */
export class EffectBandContainer {
    private _bands: EffectBand[] = [];
    private _bandLookup: Map<string, EffectBand> = new Map();
    private _effectBandSizingInfo: EffectBandSizingInfo | null = null;
    private _effectInfosSortOrder: Map<EffectInfo, number> = new Map<EffectInfo, number>();
    public height: number = 0;

    public infos!: EffectBandInfo[];
    private _renderer: BarRendererBase;
    private _isTopContainer: boolean;

    public alignGlyphs() {
        for (const effectBand of this._bands) {
            effectBand.alignGlyphs();
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
        return this._bands.some(b => b.isLinkedToPrevious);
    }

    public constructor(renderer: BarRendererBase, isTopContainer: boolean) {
        this._renderer = renderer;
        this._isTopContainer = isTopContainer;
    }

    public reLayout() {
        this.resetEffectBandSizingInfo();
        this.sizeAndAlignEffectBands();
    }

    public afterStaffBarReverted() {
        this.resetEffectBandSizingInfo();
        this.sizeAndAlignEffectBands();
    }

    public createVoiceGlyphs(voice: Voice) {
        let i = 0;
        const renderer = this._renderer;
        for (const info of this.infos) {
            let band: EffectBand | undefined = undefined;

            for (const b of voice.beats) {
                // lazy create band to avoid creating and managing bands for all events
                // even if only a few exist
                if (!band && EffectBand.shouldCreateGlyph(b, info.effect, renderer)) {
                    band = new EffectBand(voice, info.effect, this);
                    band.renderer = this._renderer;
                    band.doLayout();
                    this._bands.push(band);
                    this._bandLookup.set(`${voice.index}.${info.effect.effectId}`, band);
                    this._effectInfosSortOrder.set(info.effect, info.order ?? i);
                }

                if (band !== undefined) {
                    band.createGlyph(b);
                }
            }
            i++;
        }
    }

    public doLayout() {
        this._effectInfosSortOrder.clear();

        this._bands = [];
        this._bandLookup = new Map<string, EffectBand>();
        this.resetEffectBandSizingInfo();
    }

    public resetEffectBandSizingInfo() {
        if (this._renderer.index > 0) {
            this._effectBandSizingInfo = this.previousContainer!._effectBandSizingInfo;
        } else {
            // try reusing current one to avoid GC pressure
            if (this._effectBandSizingInfo && this._effectBandSizingInfo.owner === this) {
                this._effectBandSizingInfo.reset();
            } else {
                this._effectBandSizingInfo = new EffectBandSizingInfo(this);
            }
        }
    }

    public finalizeEffects() {
        return this._updateEffectBandHeights(true);
    }

    public updateEffectBandHeights(): boolean {
        return this._updateEffectBandHeights(false);
    }

    private _updateEffectBandHeights(finalize: boolean): boolean {
        if (!this._effectBandSizingInfo) {
            return false;
        }

        let y: number = 0;
        for (const slot of this._effectBandSizingInfo.slots) {
            if (y > 0) {
                y += this._renderer.settings.display.effectBandPaddingBottom;
            }
            slot.shared.y = y;
            for (const band of slot.bands) {
                band.y = y;
                if (finalize) {
                    band.finalize();
                }
                band.height = slot.shared.height;
            }
            y += slot.shared.height;
        }
        y = Math.ceil(y);

        if (y !== this.height) {
            this.height = y;
            return true;
        }
        return false;
    }

    public sizeAndAlignEffectBands(register: boolean = true) {
        for (const effectBand of this._bands) {
            effectBand.resetHeight();
            effectBand.alignGlyphs();
            if (register && !effectBand.isEmpty) {
                // find a slot that ended before the start of the band
                this._effectBandSizingInfo!.register(effectBand);
            }
        }

        // if we're registering new slots for the effects, we need to sort the
        // slots afterwards to keep the registered order. we don't want the "first occured" effect on top but the "first registered"
        if (register) {
            this._effectBandSizingInfo!.sortSlots(this._effectInfosSortOrder);
        }
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
        const id: string = `${voice.index}.${effectId}`;
        if (this._bandLookup.has(id)) {
            return this._bandLookup.get(id)!;
        }
        return null;
    }
}
