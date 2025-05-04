import { type Beat, BeatSubElement } from '@src/model/Beat';
import type { Voice } from '@src/model/Voice';
import type { ICanvas } from '@src/platform/ICanvas';
import type { EffectBandSlot } from '@src/rendering/EffectBandSlot';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import type { EffectBarRenderer } from '@src/rendering/EffectBarRenderer';
import type { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import type { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

export class EffectBand extends Glyph {
    private _uniqueEffectGlyphs: EffectGlyph[][] = [];
    private _effectGlyphs: Map<number, EffectGlyph>[] = [];
    public isEmpty: boolean = true;

    public previousBand: EffectBand | null = null;
    public isLinkedToPrevious: boolean = false;
    public firstBeat: Beat | null = null;
    public lastBeat: Beat | null = null;
    public override height: number = 0;
    public originalHeight: number = 0;
    public voice: Voice;
    public info: EffectBarRendererInfo;
    public slot: EffectBandSlot | null = null;

    public constructor(voice: Voice, info: EffectBarRendererInfo) {
        super(0, 0);
        this.voice = voice;
        this.info = info;
    }

    public override doLayout(): void {
        super.doLayout();
        for (let i: number = 0; i < this.renderer.bar.voices.length; i++) {
            this._effectGlyphs.push(new Map<number, EffectGlyph>());
            this._uniqueEffectGlyphs.push([]);
        }
    }

    public createGlyph(beat: Beat): void {
        if (beat.voice !== this.voice) {
            return;
        }
        // NOTE: the track order will never change. even if the staff behind the renderer changes, the trackIndex will not.
        // so it's okay to access the staff here while creating the glyphs.
        if (
            this.info.shouldCreateGlyph(this.renderer.settings, beat) &&
            (!this.info.hideOnMultiTrack || this.renderer.staff.trackIndex === 0)
        ) {
            this.isEmpty = false;
            if (!this.firstBeat || beat.isBefore(this.firstBeat)) {
                this.firstBeat = beat;
            }
            if (!this.lastBeat || beat.isAfter(this.lastBeat)) {
                this.lastBeat = beat;
                // for "toEnd" sizing occupy until next follow-up-beat
                switch (this.info.sizingMode) {
                    case EffectBarGlyphSizing.SingleOnBeatToEnd:
                    case EffectBarGlyphSizing.GroupedOnBeatToEnd:
                        if (this.lastBeat.nextBeat) {
                            this.lastBeat = this.lastBeat.nextBeat;
                        }
                        break;
                }
            }
            const glyph: EffectGlyph = this.createOrResizeGlyph(this.info.sizingMode, beat);
            if (glyph.height > this.height) {
                this.height = glyph.height;
                this.originalHeight = glyph.height;
            }
        }
    }

    public resetHeight() {
        this.height = this.originalHeight;
    }

    private createOrResizeGlyph(sizing: EffectBarGlyphSizing, b: Beat): EffectGlyph {
        let g: EffectGlyph;
        switch (sizing) {
            case EffectBarGlyphSizing.FullBar:
                g = this.info.createNewGlyph(this.renderer, b);
                g.renderer = this.renderer;
                g.beat = b;
                g.doLayout();
                this._effectGlyphs[b.voice.index].set(b.index, g);
                this._uniqueEffectGlyphs[b.voice.index].push(g);
                return g;
            case EffectBarGlyphSizing.SinglePreBeat:
            case EffectBarGlyphSizing.SingleOnBeat:
            case EffectBarGlyphSizing.SingleOnBeatToEnd:
                g = this.info.createNewGlyph(this.renderer, b);
                g.renderer = this.renderer;
                g.beat = b;
                g.doLayout();
                this._effectGlyphs[b.voice.index].set(b.index, g);
                this._uniqueEffectGlyphs[b.voice.index].push(g);
                return g;
            case EffectBarGlyphSizing.GroupedOnBeat:
            case EffectBarGlyphSizing.GroupedOnBeatToEnd:
                const singleSizing: EffectBarGlyphSizing =
                    sizing === EffectBarGlyphSizing.GroupedOnBeat
                        ? EffectBarGlyphSizing.SingleOnBeat
                        : EffectBarGlyphSizing.SingleOnBeatToEnd;
                if (b.index > 0 || this.renderer.index > 0) {
                    // check if the previous beat also had this effect
                    const prevBeat = b.previousBeat!;
                    if (this.info.shouldCreateGlyph(this.renderer.settings, prevBeat)) {
                        // first load the effect bar renderer and glyph
                        let prevEffect: EffectGlyph | null = null;
                        if (b.index > 0 && this._effectGlyphs[b.voice.index].has(prevBeat.index)) {
                            // load effect from previous beat in the same renderer
                            prevEffect = this._effectGlyphs[b.voice.index].get(prevBeat.index)!;
                        } else if (this.renderer.index > 0) {
                            // load the effect from the previous renderer if possible.
                            const previousRenderer: EffectBarRenderer = this.renderer
                                .previousRenderer as EffectBarRenderer;
                            const previousBand = previousRenderer.getBand(prevBeat.voice, this.info.effectId);
                            // it can happen that we have an empty voice and then we don't have an effect band
                            if (previousBand) {
                                const voiceGlyphs: Map<number, EffectGlyph> =
                                    previousBand._effectGlyphs[prevBeat.voice.index];
                                if (voiceGlyphs.has(prevBeat.index)) {
                                    prevEffect = voiceGlyphs.get(prevBeat.index)!;
                                }
                            }
                        }
                        // if the effect cannot be expanded, create a new glyph
                        // in case of expansion also create a new glyph, but also link the glyphs together
                        // so for rendering it might be expanded.
                        const newGlyph: EffectGlyph = this.createOrResizeGlyph(singleSizing, b);
                        if (prevEffect && this.info.canExpand(prevBeat, b)) {
                            // link glyphs
                            prevEffect.nextGlyph = newGlyph;
                            newGlyph.previousGlyph = prevEffect;
                            // mark renderers as linked for consideration when layouting the renderers (line breaking, partial breaking)
                            this.isLinkedToPrevious = true;
                        }
                        return newGlyph;
                    }
                    // in case the previous beat did not have the same effect, we simply create a new glyph
                    return this.createOrResizeGlyph(singleSizing, b);
                }
                // in case of the very first beat, we simply create the glyph.
                return this.createOrResizeGlyph(singleSizing, b);
            default:
                return this.createOrResizeGlyph(EffectBarGlyphSizing.SingleOnBeat, b);
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);

        // const c = canvas.color;
        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y, this.renderer.width, this.slot!.shared.height);
        // canvas.color = c;

        for (let i: number = 0, j: number = this._uniqueEffectGlyphs.length; i < j; i++) {
            const v: EffectGlyph[] = this._uniqueEffectGlyphs[i];
            for (let k: number = 0, l: number = v.length; k < l; k++) {
                const g: EffectGlyph = v[k];
                using _ = ElementStyleHelper.beat(canvas, BeatSubElement.Effects, g.beat!, false);
                g.paint(cx + this.x, cy + this.y, canvas);
            }
        }
    }

    public alignGlyphs(): void {
        for (let v: number = 0; v < this._effectGlyphs.length; v++) {
            for (const beatIndex of this._effectGlyphs[v].keys()) {
                this.alignGlyph(this.info.sizingMode, this.renderer.bar.voices[v].beats[beatIndex]);
            }
        }
    }

    private alignGlyph(sizing: EffectBarGlyphSizing, beat: Beat): void {
        const g: EffectGlyph = this._effectGlyphs[beat.voice.index].get(beat.index)!;
        const container: BeatContainerGlyph = this.renderer.getBeatContainer(beat)!;

        // container is aligned with the "onTimeX" position of the beat in effect renders

        switch (sizing) {
            case EffectBarGlyphSizing.SinglePreBeat:
                // shift to the start using the biggest pre-beat size of the respective beat
                const offsetToBegin = this.renderer.layoutingInfo.getPreBeatSize(beat);
                g.x = this.renderer.beatGlyphsStart + container.x - offsetToBegin;
                break;
            case EffectBarGlyphSizing.SingleOnBeat:
            case EffectBarGlyphSizing.GroupedOnBeat:
                g.x = this.renderer.beatGlyphsStart + container.x;
                break;
            case EffectBarGlyphSizing.SingleOnBeatToEnd:
            case EffectBarGlyphSizing.GroupedOnBeatToEnd:
                g.x = this.renderer.beatGlyphsStart + container.x;
                if (container.beat.isLastOfVoice) {
                    g.width = this.renderer.width - g.x;
                } else {
                    // shift to the start using the biggest post-beat size of the respective beat
                    const offsetToEnd = this.renderer.layoutingInfo.getPostBeatSize(beat);
                    g.width = offsetToEnd;
                }
                break;
            case EffectBarGlyphSizing.FullBar:
                g.width = this.renderer.width;
                break;
        }
    }
}
