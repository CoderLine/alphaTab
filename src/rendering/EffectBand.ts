import { Beat } from '@src/model/Beat';
import { Voice } from '@src/model/Voice';
import { ICanvas } from '@src/platform/ICanvas';
import { EffectBandSlot } from '@src/rendering/EffectBandSlot';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectBarRenderer } from '@src/rendering/EffectBarRenderer';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';

export class EffectBand extends Glyph {
    private _uniqueEffectGlyphs: EffectGlyph[][] = [];
    private _effectGlyphs: Map<number, EffectGlyph>[] = [];
    public isEmpty: boolean = true;

    public previousBand: EffectBand | null = null;
    public isLinkedToPrevious: boolean = false;
    public firstBeat: Beat | null = null;
    public lastBeat: Beat | null = null;
    public height: number = 0;
    public voice: Voice;
    public info: EffectBarRendererInfo;
    public slot: EffectBandSlot | null = null;

    public constructor(voice: Voice, info: EffectBarRendererInfo) {
        super(0, 0);
        this.voice = voice;
        this.info = info;
    }

    public doLayout(): void {
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
            let glyph: EffectGlyph = this.createOrResizeGlyph(this.info.sizingMode, beat);
            if (glyph.height > this.height) {
                this.height = glyph.height;
            }
        }
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
                let singleSizing: EffectBarGlyphSizing =
                    sizing === EffectBarGlyphSizing.GroupedOnBeat
                        ? EffectBarGlyphSizing.SingleOnBeat
                        : EffectBarGlyphSizing.SingleOnBeatToEnd;
                if (b.index > 0 || this.renderer.index > 0) {
                    // check if the previous beat also had this effect
                    let prevBeat = b.previousBeat!;
                    if (this.info.shouldCreateGlyph(this.renderer.settings, prevBeat)) {
                        // first load the effect bar renderer and glyph
                        let prevEffect: EffectGlyph | null = null;
                        if (b.index > 0 && this._effectGlyphs[b.voice.index].has(prevBeat.index)) {
                            // load effect from previous beat in the same renderer
                            prevEffect = this._effectGlyphs[b.voice.index].get(prevBeat.index)!;
                        } else if (this.renderer.index > 0) {
                            // load the effect from the previous renderer if possible.
                            let previousRenderer: EffectBarRenderer = this.renderer
                                .previousRenderer as EffectBarRenderer;
                            let previousBand: EffectBand = previousRenderer.getBand(this.voice, this.info.effectId)!;
                            let voiceGlyphs: Map<number, EffectGlyph> = previousBand._effectGlyphs[b.voice.index];
                            if (voiceGlyphs.has(prevBeat.index)) {
                                prevEffect = voiceGlyphs.get(prevBeat.index)!;
                            }
                        }
                        // if the effect cannot be expanded, create a new glyph
                        // in case of expansion also create a new glyph, but also link the glyphs together
                        // so for rendering it might be expanded.
                        let newGlyph: EffectGlyph = this.createOrResizeGlyph(singleSizing, b);
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

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        // canvas.LineWidth = 1;
        // canvas.StrokeRect(cx + X, cy + Y, Renderer.Width, Slot.Shared.Height);
        // canvas.LineWidth = 1.5f;
        for (let i: number = 0, j: number = this._uniqueEffectGlyphs.length; i < j; i++) {
            let v: EffectGlyph[] = this._uniqueEffectGlyphs[i];
            for (let k: number = 0, l: number = v.length; k < l; k++) {
                let g: EffectGlyph = v[k];
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
        let g: EffectGlyph = this._effectGlyphs[beat.voice.index].get(beat.index)!;
        let pos: Glyph;
        let container: BeatContainerGlyph = this.renderer.getBeatContainer(beat)!;
        switch (sizing) {
            case EffectBarGlyphSizing.SinglePreBeat:
                pos = container.preNotes;
                g.x = this.renderer.beatGlyphsStart + pos.x + container.x;
                g.width = pos.width;
                break;
            case EffectBarGlyphSizing.SingleOnBeat:
            case EffectBarGlyphSizing.GroupedOnBeat:
                pos = container.onNotes;
                g.x = this.renderer.beatGlyphsStart + pos.x + container.x;
                g.width = pos.width;
                break;
            case EffectBarGlyphSizing.SingleOnBeatToEnd:
            case EffectBarGlyphSizing.GroupedOnBeatToEnd:
                pos = container.onNotes;
                g.x = this.renderer.beatGlyphsStart + pos.x + container.x;
                if (container.beat.isLastOfVoice) {
                    g.width = this.renderer.width - g.x;
                } else {
                    g.width = container.width - container.preNotes.width - container.preNotes.x;
                }
                break;
            case EffectBarGlyphSizing.FullBar:
                g.width = this.renderer.width;
                break;
        }
    }
}
