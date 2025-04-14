import type { Bar } from '@src/model/Bar';
import type { Voice } from '@src/model/Voice';
import type { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBand } from '@src/rendering/EffectBand';
import { EffectBandSizingInfo } from '@src/rendering/EffectBandSizingInfo';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import type { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';

/**
 * This renderer is responsible for displaying effects above or below the other staves
 * like the vibrato.
 */
export class EffectBarRenderer extends BarRendererBase {
    private _infos: EffectBarRendererInfo[];
    private _bands: EffectBand[] = [];
    private _bandLookup: Map<string, EffectBand> = new Map();
    public sizingInfo: EffectBandSizingInfo | null = null;

    public constructor(renderer: ScoreRenderer, bar: Bar, infos: EffectBarRendererInfo[]) {
        super(renderer, bar);
        this._infos = infos;
    }

    protected override updateSizes(): void {
        this.topOverflow = 0;
        this.bottomOverflow = 0;
        this.topPadding = 0;
        this.bottomPadding = 0;
        this.updateHeight();
        super.updateSizes();
    }

    public override finalizeRenderer(): boolean {
        let didChange = super.finalizeRenderer();
        if (this.updateHeight()) {
            didChange = true;
        }
        return didChange;
    }

    private updateHeight(): boolean {
        if (!this.sizingInfo) {
            return false;
        }
        let y: number = 0;
        for (const slot of this.sizingInfo.slots) {
            slot.shared.y = y;
            for (const band of slot.bands) {
                band.y = y;
                band.height = slot.shared.height;
            }
            y += slot.shared.height;
        }
        if (y !== this.height) {
            this.height = y;
            return true;
        }
        return false;
    }

    public override applyLayoutingInfo(): boolean {
        const result = !super.applyLayoutingInfo();
        // we create empty slots for the same group
        if (this.index > 0) {
            const previousRenderer: EffectBarRenderer = this.previousRenderer as EffectBarRenderer;
            this.sizingInfo = previousRenderer.sizingInfo;
        } else {
            this.sizingInfo = new EffectBandSizingInfo();
        }
        for (const effectBand of this._bands) {
            effectBand.resetHeight();
            effectBand.alignGlyphs();
            if (!effectBand.isEmpty) {
                // find a slot that ended before the start of the band
                this.sizingInfo!.register(effectBand);
            }
        }
        this.updateHeight();
        return result;
    }

    public override scaleToWidth(width: number): void {
        super.scaleToWidth(width);
        for (const effectBand of this._bands) {
            effectBand.alignGlyphs();
        }
    }

    protected override createBeatGlyphs(): void {
        this._bands = [];
        this._bandLookup = new Map<string, EffectBand>();
        for (const voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                for (const info of this._infos) {
                    const band: EffectBand = new EffectBand(voice, info);
                    band.renderer = this;
                    band.doLayout();
                    this._bands.push(band);
                    this._bandLookup.set(`${voice.index}.${info.effectId}`, band);
                }
            }
        }
        super.createBeatGlyphs();
        for (const effectBand of this._bands) {
            if (effectBand.isLinkedToPrevious) {
                this.isLinkedToPrevious = true;
            }
        }
    }

    protected override createVoiceGlyphs(v: Voice): void {
        for (const b of v.beats) {
            // we create empty glyphs as alignment references and to get the
            // effect bar sized
            const container: BeatContainerGlyph = new BeatContainerGlyph(b, this.getVoiceContainer(v)!);
            container.preNotes = new BeatGlyphBase();
            container.onNotes = new BeatOnNoteGlyphBase();
            this.addBeatGlyph(container);
            for (const effectBand of this._bands) {
                effectBand.createGlyph(b);
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintBackground(cx, cy, canvas);
        // canvas.color = new Color(255, 0, 0, 100);
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);

        for (const effectBand of this._bands) {
            canvas.color =
                effectBand.voice.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
            if (!effectBand.isEmpty) {
                effectBand.paint(cx + this.x, cy + this.y, canvas);
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
