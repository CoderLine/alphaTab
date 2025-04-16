import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { BarLineStyle } from '@src/model/Bar';
import { LeftToRightLayoutingGlyphGroup } from '@src/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import type { LineBarRenderer } from '@src/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

abstract class BarLineGlyphBase extends Glyph {
    public override doLayout(): void {
        this.width = 1;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const left: number = cx + this.x;
        const top: number = cy + this.y + this.renderer.topPadding;
        const bottom: number = cy + this.y + this.renderer.height - this.renderer.bottomPadding;
        const h: number = bottom - top;
        this.paintInternal(left, top, h, canvas);
    }
    protected abstract paintInternal(left: number, top: number, h: number, canvas: ICanvas): void;
}
class BarLineLightGlyph extends BarLineGlyphBase {
    protected override paintInternal(left: number, top: number, h: number, canvas: ICanvas): void {
        canvas.fillRect(left, top, 1, h);
    }
}

class BarLineDottedGlyph extends BarLineGlyphBase {
    protected override paintInternal(left: number, top: number, h: number, canvas: ICanvas): void {
        const circleRadius: number = 1;
        const x = left;

        const lineHeight = (this.renderer as LineBarRenderer).getLineHeight(1);

        let circleY = top + lineHeight * 0.5 + circleRadius;

        const bottom = top + h;
        while (circleY < bottom) {
            canvas.fillCircle(x, circleY, circleRadius);
            circleY += lineHeight;
        }
    }
}

class BarLineDashedGlyph extends BarLineGlyphBase {
    private static readonly DashSize: number = 4;

    protected override paintInternal(left: number, top: number, h: number, canvas: ICanvas): void {
        const dashSize: number = BarLineDashedGlyph.DashSize;
        const x = left + 0.5;
        const dashes: number = Math.ceil(h / 2 / dashSize);
        const bottom = top + h;

        canvas.beginPath();
        if (dashes < 1) {
            canvas.moveTo(x, top);
            canvas.lineTo(x, bottom);
        } else {
            let dashY = top;

            // spread the dashes so they complete directly on the end-Y
            const freeSpace = h - dashes * dashSize;
            const freeSpacePerDash = freeSpace / (dashes - 1);

            while (dashY < bottom) {
                canvas.moveTo(x, dashY);
                canvas.lineTo(x, dashY + dashSize);
                dashY += dashSize + freeSpacePerDash;
            }
        }
        canvas.stroke();
    }
}

class BarLineHeavyGlyph extends BarLineGlyphBase {
    public override doLayout(): void {
        this.width = 4;
    }

    protected override paintInternal(left: number, top: number, h: number, canvas: ICanvas): void {
        canvas.fillRect(left, top, this.width, h);
    }
}

class BarLineRepeatDotsGlyph extends BarLineGlyphBase {
    protected override paintInternal(left: number, top: number, h: number, canvas: ICanvas): void {
        const bottom = top + h;
        const circleSize: number = 1.5;
        const middle: number = (top + bottom) / 2;
        const dotOffset: number = 3;
        canvas.fillCircle(left, middle - circleSize * dotOffset, circleSize);
        canvas.fillCircle(left, middle + circleSize * dotOffset, circleSize);
    }
}
class BarLineShortGlyph extends BarLineGlyphBase {
    protected override paintInternal(left: number, top: number, h: number, canvas: ICanvas): void {
        const renderer = this.renderer as LineBarRenderer;
        const lines = renderer.drawnLineCount;
        const gaps = lines - 1;
        if (gaps <= 2) {
            return;
        }

        const lineHeight = renderer.getLineHeight(1);
        const height = lineHeight * 2;
        const centerY = (gaps / 2) * lineHeight;
        const lineY = centerY - height / 2;

        canvas.fillRect(left, top + lineY, 1, height);
    }
}
class BarLineTickGlyph extends BarLineGlyphBase {
    protected override paintInternal(left: number, top: number, h: number, canvas: ICanvas): void {
        const renderer = this.renderer as LineBarRenderer;

        const lineHeight = renderer.getLineHeight(1);
        const lineY = -(lineHeight / 2) + 1;

        canvas.fillRect(left, top + lineY, 1, lineHeight);
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

        const barLineSpace = 3;

        if (this._isRight) {
            if (masterBar.isRepeatEnd) {
                this.addGlyph(new BarLineRepeatDotsGlyph(0, 0));
                this.width += barLineSpace;
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
                this.width += barLineSpace;
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
                this.width += barLineSpace;
                this.addGlyph(new BarLineLightGlyph(0, 0));
                break;

            case BarLineStyle.LightHeavy:
                // use previous light bar
                if (
                    previousLineType !== BarLineStyle.HeavyLight &&
                    previousLineType !== BarLineStyle.Regular &&
                    previousLineType !== BarLineStyle.LightLight
                ) {
                    this.addGlyph(new BarLineLightGlyph(0, 0));
                }
                this.width += barLineSpace;
                this.addGlyph(new BarLineHeavyGlyph(0, 0));
                break;
            case BarLineStyle.LightLight:
                // use previous light bar
                if (previousLineType !== BarLineStyle.HeavyLight && previousLineType !== BarLineStyle.Regular) {
                    this.addGlyph(new BarLineLightGlyph(0, 0));
                }
                this.width += barLineSpace;
                this.addGlyph(new BarLineLightGlyph(0, 0));
                break;
            case BarLineStyle.None:
                break;
            case BarLineStyle.Regular:
                // use previous light bar
                if (previousLineType !== BarLineStyle.HeavyLight && previousLineType !== BarLineStyle.LightLight) {
                    this.addGlyph(new BarLineLightGlyph(0, 0));
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
                this.width += barLineSpace;
                this.addGlyph(new BarLineRepeatDotsGlyph(0, 0));
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer as LineBarRenderer;
        using _ = ElementStyleHelper.bar(canvas, renderer.barLineBarSubElement, this.renderer.bar, true);
        super.paint(cx, cy, canvas);
    }
}
