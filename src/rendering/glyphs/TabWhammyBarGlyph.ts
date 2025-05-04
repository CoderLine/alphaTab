import { type Beat, BeatSubElement } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { WhammyType } from '@src/model/WhammyType';
import { NotationMode, NotationElement } from '@src/NotationSettings';
import { type ICanvas, TextAlign } from '@src/platform/ICanvas';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { TabBendGlyph } from '@src/rendering/glyphs/TabBendGlyph';
import type { TabBarRenderer } from '@src/rendering/TabBarRenderer';
import type { RenderingResources } from '@src/RenderingResources';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

export class TabWhammyBarGlyph extends Glyph {
    private static readonly TopOffsetSharedDataKey: string = 'tab.whammy.topoffset';
    public static readonly PerHalfSize: number = 6;
    private static readonly DashSize: number = 3;
    private _beat: Beat;
    private _renderPoints: BendPoint[];
    private _isSimpleDip: boolean = false;

    public constructor(beat: Beat) {
        super(0, 0);
        this._beat = beat;
        this._renderPoints = this.createRenderingPoints(beat);
    }

    private createRenderingPoints(beat: Beat): BendPoint[] {
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
        this._isSimpleDip =
            this.renderer.settings.notation.notationMode === NotationMode.SongBook &&
            this._beat.whammyBarType === WhammyType.Dip;
        //
        // Get the min and max values for all combined whammys
        let minValue: BendPoint | null = null;
        let maxValue: BendPoint | null = null;
        let beat: Beat | null = this._beat;
        while (beat && beat.hasWhammyBar) {
            if (!minValue || minValue.value > beat.minWhammyPoint!.value) {
                minValue = beat.minWhammyPoint;
            }
            if (!maxValue || maxValue.value < beat.maxWhammyPoint!.value) {
                maxValue = beat.maxWhammyPoint;
            }
            beat = beat.nextBeat;
        }
        let topOffset: number = maxValue!.value > 0 ? Math.abs(this.getOffset(maxValue!.value)) : 0;
        if (
            topOffset > 0 ||
            this._beat.whammyBarPoints![0].value !== 0 ||
            this.renderer.settings.notation.isNotationElementVisible(NotationElement.ZerosOnDiveWhammys)
        ) {
            topOffset += this.renderer.resources.tablatureFont.size * 2;
        }
        const bottomOffset: number = minValue!.value < 0 ? Math.abs(this.getOffset(minValue!.value)) : 0;
        this.renderer.registerOverflowTop(topOffset + bottomOffset);
        const currentOffset: number = this.renderer.staff.getSharedLayoutData<number>(
            TabWhammyBarGlyph.TopOffsetSharedDataKey,
            -1
        );
        if (topOffset > currentOffset) {
            this.renderer.staff.setSharedLayoutData(TabWhammyBarGlyph.TopOffsetSharedDataKey, topOffset);
        }
    }

    private getOffset(value: number): number {
        if (value === 0) {
            return 0;
        }
        let offset: number =
            TabWhammyBarGlyph.PerHalfSize + Math.log2(Math.abs(value) / 2) * TabWhammyBarGlyph.PerHalfSize;
        if (value < 0) {
            offset = -offset;
        }
        return offset;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.StandardNotationEffects, this._beat);

        const startNoteRenderer: BarRendererBase = this.renderer;
        let endBeat: Beat | null = this._beat.nextBeat;
        let endNoteRenderer: TabBarRenderer | null = null;
        let endXPositionType: BeatXPosition = BeatXPosition.PreNotes;
        if (endBeat) {
            endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                this.renderer.staff.staffId,
                endBeat.voice.bar
            ) as TabBarRenderer | null;
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
            startX = cx + startNoteRenderer.x + startNoteRenderer.getBeatX(this._beat, BeatXPosition.OnNotes) - 2;
            endX = cx + startNoteRenderer.x + startNoteRenderer.getBeatX(this._beat, BeatXPosition.PostNotes) + 2;
        } else {
            startX = cx + startNoteRenderer.x + startNoteRenderer.getBeatX(this._beat, BeatXPosition.MiddleNotes);
            endX = !endNoteRenderer
                ? cx + startNoteRenderer.x + startNoteRenderer.width - 2
                : cx + endNoteRenderer.x + endNoteRenderer.getBeatX(endBeat!, endXPositionType);
        }
        const old: TextAlign = canvas.textAlign;
        canvas.textAlign = TextAlign.Center;
        if (this._renderPoints.length >= 2) {
            const dx: number = (endX - startX) / BendPoint.MaxPosition;
            canvas.beginPath();
            const zeroY: number =
                cy + this.renderer.staff.getSharedLayoutData<number>(TabWhammyBarGlyph.TopOffsetSharedDataKey, 0);
            let slurText: string = this._beat.whammyStyle === BendStyle.Gradual ? 'grad.' : '';
            for (let i: number = 0, j: number = this._renderPoints.length - 1; i < j; i++) {
                const firstPt: BendPoint = this._renderPoints[i];
                const secondPt: BendPoint = this._renderPoints[i + 1];
                const nextPt: BendPoint | null = i < j - 2 ? this._renderPoints[i + 2] : null;
                let isFirst: boolean = i === 0;
                // draw pre-bend if previous
                if (i === 0 && firstPt.value !== 0 && !this._beat.isContinuedWhammy) {
                    this.paintWhammy(false, new BendPoint(0, 0), firstPt, secondPt, startX, zeroY, dx, canvas);
                    isFirst = false;
                }
                this.paintWhammy(isFirst, firstPt, secondPt, nextPt, startX, zeroY, dx, canvas, slurText);
                slurText = '';
            }
            canvas.stroke();
        }
        canvas.textAlign = old;
    }

    private paintWhammy(
        isFirst: boolean,
        firstPt: BendPoint,
        secondPt: BendPoint,
        nextPt: BendPoint | null,
        cx: number,
        cy: number,
        dx: number,
        canvas: ICanvas,
        slurText?: string
    ): void {
        const x1: number = cx + dx * firstPt.offset;
        const x2: number = cx + dx * secondPt.offset;
        const y1: number = cy - this.getOffset(firstPt.value);
        const y2: number = cy - this.getOffset(secondPt.value);
        if (firstPt.offset === secondPt.offset) {
            const dashSize: number = TabWhammyBarGlyph.DashSize;
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
            const dashSize: number = TabWhammyBarGlyph.DashSize;
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
        const res: RenderingResources = this.renderer.resources;
        if (isFirst && !this._beat.isContinuedWhammy && !this._isSimpleDip) {
            let y: number = y1;
            y -= res.tablatureFont.size + 2;
            if (this.renderer.settings.notation.isNotationElementVisible(NotationElement.ZerosOnDiveWhammys)) {
                canvas.fillText('0', x1, y);
            }
            if (slurText) {
                y -= res.tablatureFont.size + 2;
                canvas.fillText(slurText, x1, y);
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
                y = Math.min(y1, y2) - res.tablatureFont.size - 2;
            } else {
                y = firstPt.offset === secondPt.offset ? Math.min(y1, y2) : y2;
                y -= res.tablatureFont.size + 2;
                if (nextPt && nextPt.value > secondPt.value) {
                    y -= 2;
                }
            }
            const x: number = x2;
            canvas.fillText(s, x, y);
        }
    }
}
