import { CanvasHelper, type ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { BarLineStyle } from '@coderline/alphatab/model/Bar';
import { LeftToRightLayoutingGlyphGroup } from '@coderline/alphatab/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';

/**
 * @internal
 */
abstract class BarLineGlyphBase extends Glyph {
    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.thinBarlineThickness;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintExtended(cx, cy, canvas, this.height);
    }

    public abstract paintExtended(cx: number, cy: number, canvas: ICanvas, newHeight: number): void;
}

/**
 * @internal
 */
class BarLineLightGlyph extends BarLineGlyphBase {
    private _isRepeat: boolean;
    constructor(x: number, y: number, isRepeat: boolean) {
        super(x, y);
        this._isRepeat = isRepeat;
    }

    public override doLayout(): void {
        this.width = this._isRepeat
            ? this.renderer.smuflMetrics.repeatEndingLineThickness
            : this.renderer.smuflMetrics.thinBarlineThickness;
    }

    public override paintExtended(cx: number, cy: number, canvas: ICanvas, newHeight: number): void {
        canvas.fillRect(cx + this.x, cy + this.y, this.renderer.smuflMetrics.thinBarlineThickness, newHeight);
    }
}

/**
 * @internal
 */
class BarLineDottedGlyph extends BarLineGlyphBase {
    public override paintExtended(cx: number, cy: number, canvas: ICanvas, newHeight: number): void {
        const circleRadius: number = this.renderer.smuflMetrics.thinBarlineThickness / 2;

        const lineHeight = (this.renderer as LineBarRenderer).getLineHeight(1);

        let circleY = cy + this.y + lineHeight * 0.5 + circleRadius;

        const bottom = cy + this.y + newHeight;
        while (circleY < bottom) {
            canvas.fillCircle(cx + this.x, circleY, circleRadius);
            circleY += lineHeight;
        }
    }
}

/**
 * @internal
 */
class BarLineDashedGlyph extends BarLineGlyphBase {
    public override paintExtended(cx: number, cy: number, canvas: ICanvas, newHeight: number): void {
        const dashSize: number = this.renderer.smuflMetrics.dashedBarlineDashLength;
        const x = cx + this.x - this.width / 2;
        const dashes: number = Math.ceil(newHeight / 2 / dashSize);
        const bottom = cy + this.y + newHeight;
        const dashGapLength = this.renderer.smuflMetrics.dashedBarlineGapLength;

        const lw = canvas.lineWidth;
        canvas.lineWidth = this.renderer.smuflMetrics.dashedBarlineThickness;
        canvas.beginPath();
        if (dashes < 1) {
            canvas.moveTo(x, cy + this.y);
            canvas.lineTo(x, bottom);
        } else {
            let dashY = cy + this.y;
            while (dashY < bottom) {
                canvas.moveTo(x, dashY);
                const remaining = Math.min(bottom - dashY, dashSize);
                canvas.lineTo(x, dashY + remaining);
                dashY += dashSize + dashGapLength;
            }
        }
        canvas.stroke();
        canvas.lineWidth = lw;
    }
}

/**
 * @internal
 */
class BarLineHeavyGlyph extends BarLineGlyphBase {
    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.thickBarlineThickness;
    }

    public override paintExtended(cx: number, cy: number, canvas: ICanvas, newHeight: number): void {
        canvas.fillRect(cx + this.x, cy + this.y, this.width, newHeight);
    }
}

/**
 * @internal
 */
class BarLineRepeatDotsGlyph extends BarLineGlyphBase {
    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.RepeatDot)!;
    }

    public override paintExtended(cx: number, cy: number, canvas: ICanvas, _newHeight: number): void {
        const renderer = this.renderer as LineBarRenderer;

        const lineOffset = renderer.heightLineCount % 2 === 0 ? 1 : 0.5;

        const exactCenter = cy + this.y + this.height / 2;
        const lineHeight = renderer.getLineHeight(lineOffset);

        // SMuFL: the baseline of repeat dots seem inconsistent across fonts
        // we need to use the bounding box info to align.
        const dotTop = renderer.smuflMetrics.glyphTop.get(MusicFontSymbol.RepeatDot)!;
        const dotHeight = renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.RepeatDot)!;

        const dotOffset = dotTop - dotHeight / 2;

        CanvasHelper.fillMusicFontSymbolSafe(
            canvas,
            cx + this.x,
            exactCenter + dotOffset - lineHeight,
            1,
            MusicFontSymbol.RepeatDot
        );
        CanvasHelper.fillMusicFontSymbolSafe(
            canvas,
            cx + this.x,
            exactCenter + dotOffset + lineHeight,
            1,
            MusicFontSymbol.RepeatDot
        );
    }
}

/**
 * @internal
 */
class BarLineShortGlyph extends BarLineGlyphBase {
    public override paintExtended(cx: number, cy: number, canvas: ICanvas, _newHeight: number): void {
        const renderer = this.renderer as LineBarRenderer;
        const lines = renderer.drawnLineCount;
        const gaps = lines - 1;
        if (gaps <= 2) {
            return;
        }

        const padding = renderer.smuflMetrics.staffLineThickness / 2;
        const centerLine = (renderer.drawnLineCount - 1) / 2;
        const top = renderer.getLineY(centerLine - 1) - padding;
        const bottom = renderer.getLineY(centerLine + 1) + padding;

        canvas.fillRect(cx + this.x, cy + top, renderer.smuflMetrics.thinBarlineThickness, bottom - top);
    }
}

/**
 * @internal
 */
class BarLineTickGlyph extends BarLineGlyphBase {
    public override paintExtended(cx: number, cy: number, canvas: ICanvas, _newHeight: number): void {
        const renderer = this.renderer as LineBarRenderer;

        const lineHeight = renderer.getLineHeight(1);
        const lineY = -(lineHeight / 2) + 1;

        canvas.fillRect(cx + this.x, cy + this.y + lineY, 1, lineHeight);
    }
}

/**
 * @internal
 */
export class BarLineGlyph extends LeftToRightLayoutingGlyphGroup {
    private _isRight: boolean;
    private _extendToNextStaff: boolean;

    public constructor(isRight: boolean, extendToNextStaff: boolean) {
        super();
        this._isRight = isRight;
        this._extendToNextStaff = extendToNextStaff;
    }

    public override doLayout(): void {
        const bar = this.renderer.bar;
        const masterBar = bar.masterBar;
        const actualLineType = this._isRight
            ? bar.getActualBarLineRight()
            : bar.getActualBarLineLeft(this.renderer.index === 0);

        const isRepeatHeavy = (this._isRight && masterBar.isRepeatEnd) || (!this._isRight && masterBar.isRepeatStart);

        // ensure we don't draw the same line type twice (we prefer drawing it as part of the "right" line)
        let previousLineType = BarLineStyle.Automatic;
        if (!this._isRight) {
            const previousRenderer = this.renderer.previousRenderer;
            if (previousRenderer && previousRenderer.staff === this.renderer.staff) {
                previousLineType = previousRenderer.bar.getActualBarLineRight();
                if (actualLineType === previousLineType) {
                    return;
                }
            }
        }

        if (this._isRight) {
            if (masterBar.isRepeatEnd) {
                this.addGlyph(new BarLineRepeatDotsGlyph(0, 0));
                this.width += this.renderer.smuflMetrics.repeatBarlineDotSeparation;
            }
        }

        switch (actualLineType) {
            case BarLineStyle.Dashed:
                this.addGlyph(new BarLineDashedGlyph(0, 0));
                break;
            case BarLineStyle.Dotted:
                this.addGlyph(new BarLineDottedGlyph(0, 0));
                break;
            case BarLineStyle.Heavy:
                // use previous heavy bar (no double heavy)
                if (previousLineType !== BarLineStyle.LightHeavy && previousLineType !== BarLineStyle.HeavyHeavy) {
                    this.addGlyph(new BarLineHeavyGlyph(0, 0));
                }
                break;
            case BarLineStyle.HeavyHeavy:
                // use previous heavy bar (no double heavy)
                if (previousLineType !== BarLineStyle.LightHeavy && previousLineType !== BarLineStyle.Heavy) {
                    this.addGlyph(new BarLineHeavyGlyph(0, 0));
                }
                this.width += this.renderer.smuflMetrics.barlineSeparation;
                this.addGlyph(new BarLineHeavyGlyph(0, 0));
                break;
            case BarLineStyle.HeavyLight:
                // use previous heavy bar (no double heavy)
                if (
                    previousLineType !== BarLineStyle.LightHeavy &&
                    previousLineType !== BarLineStyle.Heavy &&
                    previousLineType !== BarLineStyle.HeavyHeavy
                ) {
                    this.addGlyph(new BarLineHeavyGlyph(0, 0));
                }
                this.width += this.renderer.smuflMetrics.thinThickBarlineSeparation;
                this.addGlyph(new BarLineLightGlyph(0, 0, isRepeatHeavy));
                break;

            case BarLineStyle.LightHeavy:
                // use previous light bar
                if (
                    previousLineType !== BarLineStyle.HeavyLight &&
                    previousLineType !== BarLineStyle.Regular &&
                    previousLineType !== BarLineStyle.LightLight
                ) {
                    this.addGlyph(new BarLineLightGlyph(0, 0, isRepeatHeavy));
                }
                this.width += this.renderer.smuflMetrics.thinThickBarlineSeparation;
                this.addGlyph(new BarLineHeavyGlyph(0, 0));
                break;
            case BarLineStyle.LightLight:
                // use previous light bar
                if (previousLineType !== BarLineStyle.HeavyLight && previousLineType !== BarLineStyle.Regular) {
                    this.addGlyph(new BarLineLightGlyph(0, 0, isRepeatHeavy));
                }
                this.width += this.renderer.smuflMetrics.barlineSeparation;
                this.addGlyph(new BarLineLightGlyph(0, 0, isRepeatHeavy));
                break;
            case BarLineStyle.None:
                break;
            case BarLineStyle.Regular:
                // use previous light bar
                if (previousLineType !== BarLineStyle.HeavyLight && previousLineType !== BarLineStyle.LightLight) {
                    this.addGlyph(new BarLineLightGlyph(0, 0, isRepeatHeavy));
                }
                break;
            case BarLineStyle.Short:
                this.addGlyph(new BarLineShortGlyph(0, 0));
                break;

            case BarLineStyle.Tick:
                this.addGlyph(new BarLineTickGlyph(0, 0));
                break;
        }

        if (!this._isRight) {
            if (masterBar.isRepeatStart) {
                this.width += this.renderer.smuflMetrics.repeatBarlineDotSeparation;
                this.addGlyph(new BarLineRepeatDotsGlyph(0, 0));
            }
        }

        const lineRenderer = this.renderer as LineBarRenderer;

        const lineYOffset = lineRenderer.smuflMetrics.staffLineThickness;
        const top: number = this.y - lineYOffset;
        const bottom: number = this.y + this.renderer.height;
        const h: number = bottom - top;

        // round up to have pixel-aligned bar lines, x-shift will be used during rendering
        // to avoid shifting again all glyphs
        let xShift = 0;
        if (this._isRight) {
            const fullWidth = Math.ceil(this.width);
            xShift = fullWidth - this.width;
            this.width = fullWidth;
        }

        for (const g of this.glyphs!) {
            g.y = top;
            g.x += xShift;
            g.height = h;
        }
        this.height = h;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const lines = this.glyphs;
        if (!lines) {
            return;
        }

        const renderer = this.renderer as LineBarRenderer;
        using _ = ElementStyleHelper.bar(canvas, renderer.barLineBarSubElement, this.renderer.bar, true);

        // extending across systems needs some more dynamic lookup, we do that during drawing
        // as during layout things are still moving
        let actualLineHeight = this.height;
        const thisStaff = renderer.staff;
        const allStaves = renderer.staff.system.allStaves;
        if (this._extendToNextStaff && thisStaff.index < allStaves.length - 1) {
            const nextStaff = allStaves[thisStaff.index + 1];
            const lineTop = thisStaff.y + renderer.y;
            const lineBottom = nextStaff.y + nextStaff.topOverflow + renderer.smuflMetrics.staffLineThickness;
            actualLineHeight = lineBottom - lineTop;
        }

        for (const line of lines) {
            (line as BarLineGlyphBase).paintExtended(cx, cy, canvas, actualLineHeight);
        }
    }
}
