import type { Automation } from '@coderline/alphatab/model/Automation';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { CanvasHelper, type ICanvas, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * @record
 * @internal
 */
interface TempoAutomationLayout {
    textWidth: number;
    valueWidth: number;
    textPrefix: string;
    valuePostfix: string;
}

/**
 * This glyph renders tempo annotations for tempo automations
 * where the drawing position is determined more dynamically while rendering.
 * @internal
 */
export class BarTempoGlyph extends EffectGlyph {
    private _tempoAutomations: Automation[];

    private _automationLayouts: TempoAutomationLayout[] = [];
    private _symbolWidth: number = 0;
    private _noteShift: number = 0;

    // Bbox cache; invalidated in doLayout and in populateSkyline (post-scaleToWidth).
    private _cachedBoundingBoxLeft: number = 0;
    private _cachedBoundingBoxRight: number = 0;
    private _cachedBoundingBoxLeftValid: boolean = false;
    private _cachedBoundingBoxRightValid: boolean = false;

    public constructor(tempoAutomations: Automation[]) {
        super(0, 0);
        this._tempoAutomations = tempoAutomations;
    }

    public override doLayout(): void {
        this._cachedBoundingBoxLeftValid = false;
        this._cachedBoundingBoxRightValid = false;
        super.doLayout();
        const res = this.renderer.resources;
        const scale = res.engravingSettings.tempoNoteScale;
        this._symbolWidth = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.MetNoteQuarterUp)! * scale;
        // Engraving-settings width (matches the text-less branch in paint), not smufl metric.
        this._noteShift = res.engravingSettings.glyphWidths.get(MusicFontSymbol.MetNoteQuarterUp)! / 2;
        this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.MetNoteQuarterUp)! * scale;

        const canvas = this.renderer.scoreRenderer.canvas!;
        canvas.font = res.elementFonts.get(NotationElement.EffectMarker)!;
        this._automationLayouts = [];
        for (const automation of this._tempoAutomations) {
            // Pre-format paint-time strings once; model is immutable per render.
            const textPrefix = automation.text ? `${automation.text} ` : '';
            const valuePostfix = ` = ${automation.value.toString()}`;
            const textWidth = automation.text ? canvas.measureText(textPrefix).width : 0;
            const valueWidth = canvas.measureText(valuePostfix).width;
            const layout: TempoAutomationLayout = {
                textWidth: textWidth,
                valueWidth: valueWidth,
                textPrefix: textPrefix,
                valuePostfix: valuePostfix
            };
            this._automationLayouts.push(layout);
        }
    }

    public override getBoundingBoxLeft(): number {
        if (this._cachedBoundingBoxLeftValid) {
            return this._cachedBoundingBoxLeft;
        }
        let min = 0;
        let found = false;
        for (const a of this._tempoAutomations) {
            let startX = this.renderer.getRatioPositionX(a.ratioPosition);
            if (!a.text) {
                startX -= this._noteShift;
            }
            if (!found || startX < min) {
                min = startX;
                found = true;
            }
        }
        const result = found ? min : this.x;
        this._cachedBoundingBoxLeft = result;
        this._cachedBoundingBoxLeftValid = true;
        return result;
    }

    public override getBoundingBoxRight(): number {
        if (this._cachedBoundingBoxRightValid) {
            return this._cachedBoundingBoxRight;
        }
        let max = 0;
        let found = false;
        for (let i = 0; i < this._tempoAutomations.length; i++) {
            const a = this._tempoAutomations[i];
            const layout = this._automationLayouts[i];
            let startX = this.renderer.getRatioPositionX(a.ratioPosition);
            if (!a.text) {
                startX -= this._noteShift;
            }
            const rightX = startX + layout.textWidth + this._symbolWidth + layout.valueWidth;
            if (!found || rightX > max) {
                max = rightX;
                found = true;
            }
        }
        const result = found ? max : this.x;
        this._cachedBoundingBoxRight = result;
        this._cachedBoundingBoxRightValid = true;
        return result;
    }

    public override populateSkyline(): void {
        // Post-scaleToWidth: invalidate cache so insert reads final extents.
        this._cachedBoundingBoxLeftValid = false;
        this._cachedBoundingBoxRightValid = false;
        this.renderer.insertSkylineFromBbox(this);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        for (let i = 0; i < this._tempoAutomations.length; i++) {
            const automation = this._tempoAutomations[i];
            const layout = this._automationLayouts[i];
            let x = cx + this.renderer.getRatioPositionX(automation.ratioPosition);

            const res = this.renderer.resources;
            canvas.font = res.elementFonts.get(NotationElement.EffectMarker)!;

            const notePosY =
                cy +
                this.y +
                this.height +
                this.renderer.smuflMetrics.glyphBottom.get(MusicFontSymbol.MetNoteQuarterUp)! *
                    res.engravingSettings.tempoNoteScale;

            const b = canvas.textBaseline;
            canvas.textBaseline = TextBaseline.Alphabetic;
            if (automation.text) {
                canvas.fillText(layout.textPrefix, x, notePosY);
                x += layout.textWidth;
            } else {
                x -= res.engravingSettings.glyphWidths.get(MusicFontSymbol.MetNoteQuarterUp)! / 2;
            }

            CanvasHelper.fillMusicFontSymbolSafe(
                canvas,
                x,
                notePosY,
                res.engravingSettings.tempoNoteScale,
                MusicFontSymbol.MetNoteQuarterUp
            );
            x +=
                this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.MetNoteQuarterUp)! *
                res.engravingSettings.tempoNoteScale;

            canvas.fillText(layout.valuePostfix, x, notePosY);
            canvas.textBaseline = b;

            x += layout.valueWidth;
        }
    }
}
