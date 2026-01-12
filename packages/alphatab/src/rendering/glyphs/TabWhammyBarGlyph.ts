import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { BendPoint } from '@coderline/alphatab/model/BendPoint';
import { BendStyle } from '@coderline/alphatab/model/BendStyle';
import { WhammyType } from '@coderline/alphatab/model/WhammyType';
import { NotationElement, NotationMode } from '@coderline/alphatab/NotationSettings';
import { type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TabBendGlyph } from '@coderline/alphatab/rendering/glyphs/TabBendGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class TabWhammyBarGlyph extends EffectGlyph {
    private _beat: Beat;
    private _renderPoints: BendPoint[];
    private _isSimpleDip: boolean = false;

    public originalTopOffset = 0;
    public originalBottomOffset = 0;
    public topOffset = 0;
    public bottomOffset = 0;

    public constructor(beat: Beat) {
        super(0, 0);
        this._beat = beat;
        this._renderPoints = this._createRenderingPoints(beat);
    }

    private _createRenderingPoints(beat: Beat): BendPoint[] {
        // advanced rendering
        if (beat.whammyBarType === WhammyType.Custom) {
            return beat.whammyBarPoints!;
        }
        const renderingPoints: BendPoint[] = [];
        // Guitar Pro Rendering Note:
        // Last point of bend is always at end of the beat even
        // though it might not be 100% correct from timing perspective.
        switch (beat.whammyBarType) {
            case WhammyType.Dive:
            case WhammyType.Hold:
            case WhammyType.PrediveDive:
            case WhammyType.Predive:
                renderingPoints.push(new BendPoint(0, beat.whammyBarPoints![0].value));
                renderingPoints.push(new BendPoint(BendPoint.MaxPosition, beat.whammyBarPoints![1].value));
                break;
            case WhammyType.Dip:
                renderingPoints.push(new BendPoint(0, beat.whammyBarPoints![0].value));
                renderingPoints.push(new BendPoint((BendPoint.MaxPosition / 2) | 0, beat.whammyBarPoints![1].value));
                renderingPoints.push(
                    new BendPoint(BendPoint.MaxPosition, beat.whammyBarPoints![beat.whammyBarPoints!.length - 1].value)
                );
                break;
        }
        return renderingPoints;
    }

    public override doLayout(): void {
        super.doLayout();
        if (this._beat.whammyBarType === WhammyType.Custom) {
            return;
        }

        this._isSimpleDip =
            this.renderer.settings.notation.notationMode === NotationMode.SongBook &&
            this._beat.whammyBarType === WhammyType.Dip;

        const minValue: BendPoint | null = this._beat.minWhammyPoint;
        const maxValue: BendPoint | null = this._beat.maxWhammyPoint;

        let topY: number = maxValue!.value > 0 ? -this._getOffset(maxValue!.value) : 0;
        let bottomY: number = minValue!.value < 0 ? -this._getOffset(minValue!.value) : 0;

        const c = this.renderer.scoreRenderer.canvas!;
        c.font = this.renderer.resources.tablatureFont;
        const labelMeasure = c.measureText('-1');

        const labelSize = labelMeasure.height + this.renderer.smuflMetrics.tabWhammyTextPadding;

        if (
            topY !== 0 ||
            this._beat.whammyBarPoints![0].value !== 0 ||
            this.renderer.settings.notation.isNotationElementVisible(NotationElement.ZerosOnDiveWhammys)
        ) {
            topY -= labelSize;
        }

        if (bottomY !== 0) {
            if (this._isSimpleDip) {
                topY -= labelSize;
            } else {
                const bottomYWithLabel = bottomY - labelSize;
                if (bottomYWithLabel < topY) {
                    topY = bottomYWithLabel;
                }
            }
        }

        topY = Math.abs(topY);
        bottomY = Math.abs(bottomY);

        this.topOffset = topY;
        this.bottomOffset = bottomY;
        this.originalTopOffset = topY;
        this.originalBottomOffset = bottomY;

        this.height = topY + bottomY;
        this.width = 0;
    }

    private _getOffset(value: number): number {
        if (value === 0) {
            return 0;
        }
        let offset: number =
            this.renderer.smuflMetrics.tabWhammyPerHalfHeight +
            Math.log2(Math.abs(value) / 2) * this.renderer.smuflMetrics.tabWhammyPerHalfHeight;
        if (value < 0) {
            offset = -offset;
        }
        return offset;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.StandardNotationEffects, this._beat);

        const startNoteRenderer: BarRendererBase = this.renderer;
        let endBeat: Beat | null = this._beat.nextBeat;
        let endNoteRenderer: LineBarRenderer | null = null;
        let endXPositionType: BeatXPosition = BeatXPosition.PreNotes;
        if (endBeat) {
            endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                this.renderer.staff!.staffId,
                endBeat.voice.bar
            ) as LineBarRenderer | null;
            if (!endNoteRenderer || endNoteRenderer.staff !== startNoteRenderer.staff) {
                endBeat = null;
                endNoteRenderer = null;
            } else if (endNoteRenderer !== startNoteRenderer && !endBeat.hasWhammyBar) {
                endBeat = null;
                endNoteRenderer = null;
            } else {
                endXPositionType =
                    endBeat.hasWhammyBar &&
                    (startNoteRenderer.settings.notation.notationMode !== NotationMode.SongBook ||
                        endBeat.whammyBarType !== WhammyType.Dip)
                        ? BeatXPosition.MiddleNotes
                        : BeatXPosition.PreNotes;
            }
        }
        let startX: number = 0;
        let endX: number = 0;
        if (this._isSimpleDip) {
            startX = cx + startNoteRenderer.getBeatX(this._beat, BeatXPosition.OnNotes, true);
            endX = cx + startNoteRenderer.getBeatX(this._beat, BeatXPosition.PostNotes, true);
        } else {
            startX = cx + startNoteRenderer.getBeatX(this._beat, BeatXPosition.MiddleNotes, true);
            if (endNoteRenderer) {
                endX =
                    cx -
                    startNoteRenderer.x +
                    endNoteRenderer.x +
                    endNoteRenderer.getBeatX(endBeat!, endXPositionType, true);
            } else {
                endX =
                    cx +
                    startNoteRenderer.getBeatX(this._beat!, BeatXPosition.EndBeat) -
                    startNoteRenderer.smuflMetrics.postNoteEffectPadding;
            }
        }

        const oldAlign = canvas.textAlign;
        const oldBaseLine = canvas.textBaseline;
        canvas.textAlign = TextAlign.Center;
        canvas.textBaseline = TextBaseline.Alphabetic;
        canvas.font = this.renderer.resources.tablatureFont;

        if (this._renderPoints.length >= 2) {
            const dx: number = (endX - startX) / BendPoint.MaxPosition;
            canvas.beginPath();

            const zeroY: number = cy + this.topOffset;
            let slurText: string = this._beat.whammyStyle === BendStyle.Gradual ? 'grad.' : '';
            for (let i: number = 0, j: number = this._renderPoints.length - 1; i < j; i++) {
                const firstPt: BendPoint = this._renderPoints[i];
                const secondPt: BendPoint = this._renderPoints[i + 1];
                let isFirst: boolean = i === 0;
                // draw pre-bend if previous
                if (i === 0 && firstPt.value !== 0 && !this._beat.isContinuedWhammy) {
                    this._paintWhammy(false, new BendPoint(0, 0), firstPt, startX, zeroY, dx, canvas);
                    isFirst = false;
                }
                this._paintWhammy(isFirst, firstPt, secondPt, startX, zeroY, dx, canvas, slurText);
                slurText = '';
            }
            canvas.stroke();
        }
        canvas.textAlign = oldAlign;
        canvas.textBaseline = oldBaseLine;
    }

    private _paintWhammy(
        isFirst: boolean,
        firstPt: BendPoint,
        secondPt: BendPoint,
        cx: number,
        cy: number,
        dx: number,
        canvas: ICanvas,
        slurText?: string
    ): void {
        const x1: number = cx + dx * firstPt.offset;
        const x2: number = cx + dx * secondPt.offset;
        const y1: number = cy - this._getOffset(firstPt.value);
        const y2: number = cy - this._getOffset(secondPt.value);
        if (firstPt.offset === secondPt.offset) {
            const dashSize: number = this.renderer.smuflMetrics.tabWhammyDashSize;
            const dashes: number = Math.abs(y2 - y1) / (dashSize * 2);
            if (dashes < 1) {
                canvas.moveTo(x1, y1);
                canvas.lineTo(x2, y2);
            } else {
                const dashEndY: number = Math.max(y1, y2);
                let dashStartY: number = Math.min(y1, y2);
                while (dashEndY > dashStartY) {
                    canvas.moveTo(x1, dashStartY);
                    canvas.lineTo(x1, dashStartY + dashSize);
                    dashStartY += dashSize * 2;
                }
            }
            canvas.stroke();
        } else if (firstPt.value === secondPt.value) {
            const dashSize: number = this.renderer.smuflMetrics.tabWhammyDashSize;
            const dashes: number = Math.abs(x2 - x1) / (dashSize * 2);
            if (dashes < 1) {
                canvas.moveTo(x1, y1);
                canvas.lineTo(x2, y2);
            } else {
                let dashEndX: number = Math.max(x1, x2);
                const dashStartX: number = Math.min(x1, x2);
                while (dashEndX > dashStartX) {
                    canvas.moveTo(dashEndX, y1);
                    canvas.lineTo(dashEndX - dashSize, y1);
                    dashEndX -= dashSize * 2;
                }
            }
            canvas.stroke();
        } else {
            canvas.moveTo(x1, y1);
            canvas.lineTo(x2, y2);
        }

        const textOffset = this.renderer.smuflMetrics.tabWhammyTextPadding;

        if (isFirst && !this._beat.isContinuedWhammy && !this._isSimpleDip) {
            if (this.renderer.settings.notation.isNotationElementVisible(NotationElement.ZerosOnDiveWhammys)) {
                canvas.fillText('0', x1, y1 - textOffset);
            }
            if (slurText) {
                canvas.fillText(slurText, x1, y1 - textOffset);
            }
        }

        let dV: number = Math.abs(secondPt.value);
        if (
            (dV !== 0 ||
                (this.renderer.settings.notation.isNotationElementVisible(NotationElement.ZerosOnDiveWhammys) &&
                    !this._isSimpleDip)) &&
            firstPt.value !== secondPt.value
        ) {
            let s: string = '';
            if (secondPt.value < 0) {
                s += '-';
            }
            if (dV >= 4) {
                const steps: number = (dV / 4) | 0;
                s += steps;
                // Quaters
                dV -= steps * 4;
            } else if (dV === 0) {
                s += '0';
            }
            if (dV > 0) {
                s += TabBendGlyph.getFractionSign(dV);
            }
            let y: number = 0;
            if (this._isSimpleDip) {
                y = Math.min(y1, y2);
            } else {
                y = firstPt.offset === secondPt.offset ? Math.min(y1, y2) : y2;
            }
            const x: number = x2;
            canvas.fillText(s, x, y - textOffset);
        }
    }
}
