import type { Beat } from '@coderline/alphatab/model/Beat';
import { BendPoint } from '@coderline/alphatab/model/BendPoint';
import { BendStyle } from '@coderline/alphatab/model/BendStyle';
import { BendType } from '@coderline/alphatab/model/BendType';
import type { Color } from '@coderline/alphatab/model/Color';
import type { Font } from '@coderline/alphatab/model/Font';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { TextBaseline, type ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { type BarRendererBase, NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NoteVibratoGlyph } from '@coderline/alphatab/rendering/glyphs/NoteVibratoGlyph';
import { TabBendRenderPoint } from '@coderline/alphatab/rendering/glyphs/TabBendRenderPoint';
import type { ITieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';

/**
 * @internal
 */
export class TabBendGlyph extends Glyph implements ITieGlyph {
    private _notes: Note[] = [];
    private _renderPoints: Map<number, TabBendRenderPoint[]> = new Map();
    private _preBendMinValue: number = -1;
    private _bendMiddleMinValue: number = -1;
    private _bendEndMinValue: number = -1;
    private _bendEndContinuedMinValue: number = -1;
    private _releaseMinValue: number = -1;
    private _releaseContinuedMinValue: number = -1;
    private _maxBendValue: number = -1;

    public readonly checkForOverflow = false;

    public constructor() {
        super(0, 0);
    }

    public addBends(note: Note): void {
        this._notes.push(note);
        const renderPoints: TabBendRenderPoint[] = this._createRenderingPoints(note);
        this._renderPoints.set(note.id, renderPoints);
        if (this._maxBendValue === -1 || this._maxBendValue < note.maxBendPoint!.value) {
            this._maxBendValue = note.maxBendPoint!.value;
        }
        // compute arrow end values for common bend types
        let value: number = 0;
        switch (note.bendType) {
            case BendType.Bend:
                value = renderPoints[1].value;
                if (note.isTieOrigin) {
                    if (this._bendEndContinuedMinValue === -1 || value < this._bendEndContinuedMinValue) {
                        this._bendEndContinuedMinValue = value;
                    }
                } else {
                    if (this._bendEndMinValue === -1 || value < this._bendEndMinValue) {
                        this._bendEndMinValue = value;
                    }
                }
                break;
            case BendType.Release:
                value = renderPoints[1].value;
                if (note.isTieOrigin) {
                    if (this._releaseContinuedMinValue === -1 || value < this._releaseContinuedMinValue) {
                        this._releaseContinuedMinValue = value;
                    }
                } else {
                    if (value > 0 && (this._releaseMinValue === -1 || value < this._releaseMinValue)) {
                        this._releaseMinValue = value;
                    }
                }
                break;
            case BendType.BendRelease:
                value = renderPoints[1].value;
                if (this._bendMiddleMinValue === -1 || value < this._bendMiddleMinValue) {
                    this._bendMiddleMinValue = value;
                }
                value = renderPoints[2].value;
                if (note.isTieOrigin) {
                    if (this._releaseContinuedMinValue === -1 || value < this._releaseContinuedMinValue) {
                        this._releaseContinuedMinValue = value;
                    }
                } else {
                    if (value > 0 && (this._releaseMinValue === -1 || value < this._releaseMinValue)) {
                        this._releaseMinValue = value;
                    }
                }
                break;
            case BendType.Prebend:
                value = renderPoints[0].value;
                if (this._preBendMinValue === -1 || value < this._preBendMinValue) {
                    this._preBendMinValue = value;
                }
                break;
            case BendType.PrebendBend:
                value = renderPoints[0].value;
                if (this._preBendMinValue === -1 || value < this._preBendMinValue) {
                    this._preBendMinValue = value;
                }
                value = renderPoints[1].value;
                if (note.isTieOrigin) {
                    if (this._bendEndContinuedMinValue === -1 || value < this._bendEndContinuedMinValue) {
                        this._bendEndContinuedMinValue = value;
                    }
                } else {
                    if (this._bendEndMinValue === -1 || value < this._bendEndMinValue) {
                        this._bendEndMinValue = value;
                    }
                }
                break;
            case BendType.PrebendRelease:
                value = renderPoints[0].value;
                if (this._preBendMinValue === -1 || value < this._preBendMinValue) {
                    this._preBendMinValue = value;
                }
                value = renderPoints[1].value;
                if (note.isTieOrigin) {
                    if (this._releaseContinuedMinValue === -1 || value < this._releaseContinuedMinValue) {
                        this._releaseContinuedMinValue = value;
                    }
                } else {
                    if (value > 0 && (this._releaseMinValue === -1 || value < this._releaseMinValue)) {
                        this._releaseMinValue = value;
                    }
                }
                break;
        }
    }

    public override doLayout(): void {
        super.doLayout();

        this._calculateAndRegisterOverflow();

        let value: number = 0;
        for (const note of this._notes) {
            const renderPoints: TabBendRenderPoint[] = this._renderPoints.get(note.id)!;
            switch (note.bendType) {
                case BendType.Bend:
                    renderPoints[1].lineValue = note.isTieOrigin
                        ? this._bendEndContinuedMinValue
                        : this._bendEndMinValue;
                    break;
                case BendType.Release:
                    value = note.isTieOrigin ? this._releaseContinuedMinValue : this._releaseMinValue;
                    if (value >= 0) {
                        renderPoints[1].lineValue = value;
                    }
                    break;
                case BendType.BendRelease:
                    renderPoints[1].lineValue = this._bendMiddleMinValue;
                    value = note.isTieOrigin ? this._releaseContinuedMinValue : this._releaseMinValue;
                    if (value >= 0) {
                        renderPoints[2].lineValue = value;
                    }
                    break;
                case BendType.Prebend:
                    renderPoints[0].lineValue = this._preBendMinValue;
                    break;
                case BendType.PrebendBend:
                    renderPoints[0].lineValue = this._preBendMinValue;
                    renderPoints[1].lineValue = note.isTieOrigin
                        ? this._bendEndContinuedMinValue
                        : this._bendEndMinValue;
                    break;
                case BendType.PrebendRelease:
                    renderPoints[0].lineValue = this._preBendMinValue;
                    value = note.isTieOrigin ? this._releaseContinuedMinValue : this._releaseMinValue;
                    if (value >= 0) {
                        renderPoints[1].lineValue = value;
                    }
                    break;
            }
        }
        this.width = 0;
        this._notes.sort((a, b) => {
            if (a.isStringed) {
                return a.string - b.string;
            }
            return a.realValue - b.realValue;
        });
    }

    private _calculateAndRegisterOverflow() {
        const res = this.renderer.resources;
        const smufl = this.renderer.smuflMetrics;
        let bendHeight: number = this._maxBendValue * smufl.tabBendPerValueHeight;

        bendHeight += smufl.tabBendStaffPadding;

        // account for space
        const canvas = this.renderer.scoreRenderer.canvas!;
        canvas.font = res.tablatureFont;
        const size = canvas.measureText('full');
        bendHeight += size.height + res.engravingSettings.tabBendLabelPadding;

        this.renderer.registerOverflowTop(bendHeight);
    }

    private _createRenderingPoints(note: Note): TabBendRenderPoint[] {
        const renderingPoints: TabBendRenderPoint[] = [];
        // Guitar Pro Rendering Note:
        // Last point of bend is always at end of the note even
        // though it might not be 100% correct from timing perspective.
        switch (note.bendType) {
            case BendType.Custom:
                for (const bendPoint of note.bendPoints!) {
                    renderingPoints.push(new TabBendRenderPoint(bendPoint.offset, bendPoint.value));
                }
                break;
            case BendType.BendRelease:
                renderingPoints.push(new TabBendRenderPoint(0, note.bendPoints![0].value));
                renderingPoints.push(
                    new TabBendRenderPoint((BendPoint.MaxPosition / 2) | 0, note.bendPoints![1].value)
                );
                renderingPoints.push(new TabBendRenderPoint(BendPoint.MaxPosition, note.bendPoints![3].value));
                break;
            case BendType.Bend:
            case BendType.Hold:
            case BendType.Prebend:
            case BendType.PrebendBend:
            case BendType.PrebendRelease:
            case BendType.Release:
                renderingPoints.push(new TabBendRenderPoint(0, note.bendPoints![0].value));
                renderingPoints.push(new TabBendRenderPoint(BendPoint.MaxPosition, note.bendPoints![1].value));
                break;
        }
        return renderingPoints;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const color: Color = canvas.color;
        if (this._notes.length > 1) {
            canvas.color = this.renderer.resources.secondaryGlyphColor;
        }
        for (const note of this._notes) {
            const startNoteRenderer = this.renderer as TabBarRenderer;
            let endNote = note;
            let isMultiBeatBend = false;
            let endNoteRenderer: BarRendererBase | null = null;
            let endNoteHasBend = false;
            let endBeat: Beat | null = null;
            while (endNote.isTieOrigin) {
                const nextNote = endNote.tieDestination!;
                endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                    this.renderer.staff.staffId,
                    nextNote.beat.voice.bar
                );
                if (!endNoteRenderer || startNoteRenderer.staff !== endNoteRenderer.staff) {
                    break;
                }
                endNote = nextNote;
                isMultiBeatBend = true;
                if (
                    endNote.hasBend ||
                    !this.renderer.settings.notation.extendBendArrowsOnTiedNotes ||
                    endNote.vibrato !== VibratoType.None
                ) {
                    endNoteHasBend = true;
                    break;
                }
            }

            endBeat = endNote.beat;
            endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                this.renderer.staff.staffId,
                endBeat.voice.bar
            ) as TabBarRenderer;
            if (
                endBeat.isLastOfVoice &&
                !endNote.hasBend &&
                this.renderer.settings.notation.extendBendArrowsOnTiedNotes
            ) {
                endBeat = null;
            }

            const smufl = startNoteRenderer.smuflMetrics;
            const tabBendArrowSize = smufl.glyphWidths.get(MusicFontSymbol.ArrowheadBlackDown)!;

            const topY: number = cy + startNoteRenderer.y - smufl.tabBendStaffPadding;

            let startX = cx + startNoteRenderer.x;
            const renderPoints = this._renderPoints.get(note.id)!;
            if (renderPoints[0].value > 0 || note.isContinuedBend) {
                startX += startNoteRenderer.getBeatX(note.beat, BeatXPosition.MiddleNotes);
            } else {
                startX += startNoteRenderer.getNoteX(note, NoteXPosition.Right);
            }

            let endX: number = 0;
            if (!endBeat || (endBeat.isLastOfVoice && !endNoteHasBend)) {
                endX = cx + endNoteRenderer!.x + endNoteRenderer!.postBeatGlyphsStart;
            } else if (endNoteHasBend || !endBeat.nextBeat) {
                endX = cx + endNoteRenderer!.x + endNoteRenderer!.getBeatX(endBeat, BeatXPosition.MiddleNotes);
            } else if (note.bendType === BendType.Hold) {
                endX = cx + endNoteRenderer!.x + endNoteRenderer!.getBeatX(endBeat.nextBeat, BeatXPosition.OnNotes);
            } else {
                endX = cx + endNoteRenderer!.x + endNoteRenderer!.getBeatX(endBeat.nextBeat, BeatXPosition.PreNotes);
            }

            // we need some pixels for the arrow. otherwise we might draw into the next
            if (!isMultiBeatBend) {
                endX -= tabBendArrowSize;
            }

            this._paintBendLines(canvas, startX, topY, endX, startNoteRenderer, note, renderPoints);
            this._paintBendVibrato(
                canvas,
                endX - tabBendArrowSize * 0.5,
                topY - smufl.tabBendPerValueHeight * renderPoints[renderPoints.length - 1].lineValue,
                endNoteRenderer,
                endNote
            );

            canvas.color = color;
        }
    }

    private _paintBendVibrato(
        canvas: ICanvas,
        cx: number,
        cy: number,
        endNoteRenderer: BarRendererBase,
        endNote: Note
    ) {
        if (endNote.isTieDestination && endNote.vibrato !== VibratoType.None && !endNote.hasBend) {
            const vibrato = new NoteVibratoGlyph(0, 0, endNote.vibrato);
            vibrato.beat = endNote.beat;
            vibrato.renderer = endNoteRenderer;
            vibrato.doLayout();
            vibrato.paint(cx, cy, canvas);
        }
    }

    private _paintBendLines(
        canvas: ICanvas,
        cx: number,
        cy: number,
        endX: number,
        noteRenderer: TabBarRenderer,
        note: Note,
        renderPoints: TabBendRenderPoint[]
    ) {
        const l = canvas.lineWidth;
        const res = this.renderer.resources;
        const bl = canvas.textBaseline;
        canvas.textBaseline = TextBaseline.Alphabetic;
        canvas.lineWidth = res.engravingSettings.arrowShaftThickness;

        // calculate offsets per step
        const width: number = endX - cx;
        const dX: number = width / BendPoint.MaxPosition;
        for (let i: number = 0, j: number = renderPoints.length - 1; i < j; i++) {
            const firstPt: TabBendRenderPoint = renderPoints[i];
            let secondPt: TabBendRenderPoint = renderPoints[i + 1];
            // draw pre-bend if previous
            if (i === 0 && firstPt.value !== 0 && !note.isTieDestination) {
                this._paintBend(canvas, cx, cy, dX, noteRenderer, note, new TabBendRenderPoint(0, 0), firstPt);
            }
            if (note.bendType !== BendType.Prebend) {
                if (i === 0) {
                    cx += this.renderer.smuflMetrics.postNoteEffectPadding;
                }
                this._paintBend(canvas, cx, cy, dX, noteRenderer, note, firstPt, secondPt);
            } else if (note.isTieOrigin && note.tieDestination!.hasBend) {
                secondPt = new TabBendRenderPoint(BendPoint.MaxPosition, firstPt.value);
                secondPt.lineValue = firstPt.lineValue;

                this._paintBend(canvas, cx, cy, dX, noteRenderer, note, firstPt, secondPt);
            }
        }

        canvas.lineWidth = l;
        canvas.textBaseline = bl;
    }

    private _paintBendLine(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        firstPt: TabBendRenderPoint,
        secondPt: TabBendRenderPoint
    ) {
        if (firstPt.value === secondPt.value) {
            // draw horizontal dashed line
            // to really have the line ending at the right position
            // we draw from right to left. it's okay if the space is at the beginning
            if (firstPt.lineValue > 0) {
                let dashX: number = x2;
                const dashSize: number = this.renderer.smuflMetrics.tabBendDashSize;
                const end: number = x1 + dashSize;
                const dashes: number = (dashX - x1) / (dashSize * 2);
                if (dashes < 1) {
                    canvas.moveTo(dashX, y1);
                    canvas.lineTo(x1, y1);
                } else {
                    while (dashX > end) {
                        canvas.moveTo(dashX, y1);
                        canvas.lineTo(dashX - dashSize, y1);
                        dashX -= dashSize * 2;
                    }
                }
                canvas.stroke();
            }
        } else {
            if (x2 > x1) {
                const isUp = secondPt.value > firstPt.value;
                // small offset to have line inside arrow head and not showing in tip
                const arrowOffset = isUp ? 3 : -3;

                // draw bezier line from first to second point
                canvas.moveTo(x1, y1);
                canvas.bezierCurveTo((x1 + x2) / 2, y1, x2, y1, x2, y2 + arrowOffset);
                canvas.stroke();
            } else {
                canvas.moveTo(x1, y1);
                canvas.lineTo(x2, y2);
                canvas.stroke();
            }
        }
    }

    private _paintBend(
        canvas: ICanvas,
        cx: number,
        cy: number,
        dX: number,
        noteRenderer: TabBarRenderer,
        note: Note,
        firstPt: TabBendRenderPoint,
        secondPt: TabBendRenderPoint
    ): void {
        const noteNumberAndLinePaddingY = noteRenderer.lineOffset / 2;
        const res = noteRenderer.resources;
        const smufl = res.engravingSettings;

        const x1 = cx + dX * firstPt.offset;
        let y1: number;
        if (firstPt.value === 0) {
            y1 = cy + smufl.tabBendStaffPadding;
            if (secondPt.offset === firstPt.offset) {
                y1 += noteRenderer.getNoteY(note.beat.maxStringNote!, NoteYPosition.Top) - noteNumberAndLinePaddingY;
            } else {
                y1 += noteRenderer.getNoteY(note, NoteYPosition.Center);
            }
        } else {
            y1 = cy - smufl.tabBendPerValueHeight * firstPt.lineValue;
        }

        const x2 = cx + dX * secondPt.offset;
        let y2: number;
        if (secondPt.lineValue === 0) {
            y2 = cy + smufl.tabBendStaffPadding + noteRenderer.getNoteY(note.beat.maxStringNote!, NoteYPosition.Center);
        } else {
            y2 = cy - smufl.tabBendPerValueHeight * secondPt.lineValue;
        }

        this._paintBendLine(canvas, x1, y1, x2, y2, firstPt, secondPt);

        const arrowSize = smufl.glyphWidths.get(MusicFontSymbol.ArrowheadBlackDown)!;
        if (firstPt.value !== secondPt.value) {
            const up = secondPt.value > firstPt.value;
            this._paintBendLineArrow(canvas, x2, y2, y1, arrowSize, up);

            this._paintBendLineSlurText(canvas, x1, y1, x2, y2, note, res.graceFont);
            this._paintBendLineValueText(canvas, y1, x2, y2 - smufl.tabBendLabelPadding, firstPt, secondPt, res.tablatureFont);
        }
    }

    private _paintBendLineSlurText(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        note: Note,
        font: Font
    ) {
        if (note.bendStyle === BendStyle.Gradual) {
            const slurText = 'grad.';
            const size = canvas.measureText(slurText);
            canvas.font = font;

            let y: number = 0;
            let x: number = 0;
            if (y1 > y2) {
                const h: number = Math.abs(y1 - y2);
                y = h > size.height ? y1 - h / 2 : y1;
                x = (x1 + x2 - size.width) / 2;
            } else {
                y = y1;
                x = x2 - size.width;
            }
            canvas.fillText(slurText, x, y);
        }
    }

    private _paintBendLineValueText(
        canvas: ICanvas,
        y1: number,
        x2: number,
        y2: number,
        firstPt: TabBendRenderPoint,
        secondPt: TabBendRenderPoint,
        font: Font
    ) {
        if (secondPt.value !== 0) {
            const up = secondPt.value > firstPt.value;

            //
            // calculate label

            let bendValue = secondPt.value;
            let bendValueText = '';
            // Full Steps
            if (bendValue === 4) {
                bendValueText = 'full';
                bendValue -= 4;
            } else if (bendValue >= 4 || bendValue <= -4) {
                const steps = (bendValue / 4) | 0;
                bendValueText += steps;
                // Quaters
                bendValue -= steps * 4;
            }
            if (bendValue > 0) {
                bendValueText += TabBendGlyph.getFractionSign(bendValue);
            }

            if (bendValueText !== '') {
                const textY = up ? y2 : y1 + (Math.abs(y2 - y1) * 1) / 3;
                canvas.font = font;
                const size = canvas.measureText(bendValueText);
                const textX = x2 - size.width / 2;
                canvas.fillText(bendValueText, textX, textY);
            }
        }
    }
    private _paintBendLineArrow(canvas: ICanvas, x2: number, y2: number, y1: number, arrowSize: number, up: boolean) {
        if (up) {
            // shift arrow up in narrow cases
            if (y2 + arrowSize > y1) {
                y2 = y1 - arrowSize;
            }
            canvas.beginPath();
            canvas.moveTo(x2, y2);
            canvas.lineTo(x2 - arrowSize * 0.5, y2 + arrowSize);
            canvas.lineTo(x2 + arrowSize * 0.5, y2 + arrowSize);
            canvas.closePath();
            canvas.fill();
        } else {
            if (y2 < y1) {
                y2 = y1 + arrowSize;
            }
            canvas.beginPath();
            canvas.moveTo(x2, y2);
            canvas.lineTo(x2 - arrowSize * 0.5, y2 - arrowSize);
            canvas.lineTo(x2 + arrowSize * 0.5, y2 - arrowSize);
            canvas.closePath();
            canvas.fill();
        }
    }

    public static getFractionSign(steps: number): string {
        switch (steps) {
            case 1:
                return '¼';
            case 2:
                return '½';
            case 3:
                return '¾';
            default:
                return `${steps}/ 4`;
        }
    }
}
