import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { BarLineStyle } from '@src/model/Bar';
import { LeftToRightLayoutingGlyphGroup } from '@src/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import type { LineBarRenderer } from '@src/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

abstract class BarLineGlyphBase extends Glyph {
    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.thinBarlineThickness;
    }
}
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

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillRect(cx + this.x, cy + this.y, this.renderer.smuflMetrics.thinBarlineThickness, this.height);
    }
}

class BarLineDottedGlyph extends BarLineGlyphBase {
    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const circleRadius: number = this.renderer.smuflMetrics.thinBarlineThickness / 2;

        const lineHeight = (this.renderer as LineBarRenderer).getLineHeight(1);

        let circleY = cy + this.y + lineHeight * 0.5 + circleRadius;

        const bottom = cy + this.y + this.height;
        while (circleY < bottom) {
            canvas.fillCircle(cx + this.x, circleY, circleRadius);
            circleY += lineHeight;
        }
    }
}

class BarLineDashedGlyph extends BarLineGlyphBase {
    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const dashSize: number = this.renderer.smuflMetrics.dashedBarlineDashLength;
        const x = cx + this.x - this.width / 2;
        const dashes: number = Math.ceil(this.height / 2 / dashSize);
        const bottom = cy + this.y + this.height;
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

class BarLineHeavyGlyph extends BarLineGlyphBase {
    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.thickBarlineThickness;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);
    }
}

class BarLineRepeatDotsGlyph extends BarLineGlyphBase {
    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.RepeatDot)!;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer as LineBarRenderer;

        const lineOffset = renderer.heightLineCount % 2 === 0 ? 1 : 0.5;

        const exactCenter = cy + this.y + this.height / 2;
        const lineHeight = renderer.getLineHeight(lineOffset);

        // SMuFL: the baseline of repeat dots seem inconsistent across fonts
        // we need to use the bounding box info to align.
        const dotTop = renderer.smuflMetrics.glyphTop.get(MusicFontSymbol.RepeatDot)!;
        const dotHeight = renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.RepeatDot)!;

        const dotOffset = dotTop - dotHeight / 2;

        canvas.fillMusicFontSymbol(cx + this.x, exactCenter + dotOffset - lineHeight, 1, MusicFontSymbol.RepeatDot);
        canvas.fillMusicFontSymbol(cx + this.x, exactCenter + dotOffset + lineHeight, 1, MusicFontSymbol.RepeatDot);
    }
}
class BarLineShortGlyph extends BarLineGlyphBase {
    public override paint(cx: number, cy: number, canvas: ICanvas): void {
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

class BarLineTickGlyph extends BarLineGlyphBase {
    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer as LineBarRenderer;

        const lineHeight = renderer.getLineHeight(1);
        const lineY = -(lineHeight / 2) + 1;

        canvas.fillRect(cx + this.x, cy + this.y + lineY, 1, lineHeight);
    }
}

export class BarLineGlyph extends LeftToRightLayoutingGlyphGroup {
    private _isRight: boolean;

    public constructor(isRight: boolean) {
        super();
        this._isRight = isRight;
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

        const top: number = this.y + this.renderer.topPadding;
        const bottom: number = this.y + this.renderer.height - this.renderer.bottomPadding;
        const h: number = (bottom - top) + lineRenderer.smuflMetrics.staffLineThickness / 2;

        for (const g of this.glyphs!) {
            g.y = top;
            g.height = h;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer as LineBarRenderer;
        using _ = ElementStyleHelper.bar(canvas, renderer.barLineBarSubElement, this.renderer.bar, true);
        super.paint(cx, cy, canvas);
    }
}
