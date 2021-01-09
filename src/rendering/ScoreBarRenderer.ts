import { AccidentalType } from '@src/model/AccidentalType';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Clef } from '@src/model/Clef';
import { Duration } from '@src/model/Duration';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { Note } from '@src/model/Note';
import { TupletGroup } from '@src/model/TupletGroup';
import { Voice } from '@src/model/Voice';
import { FingeringMode, NotationMode } from '@src/NotationSettings';
import { ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { BarRendererBase, NoteYPosition } from '@src/rendering/BarRendererBase';
import { AccidentalGlyph } from '@src/rendering/glyphs/AccidentalGlyph';
import { BarNumberGlyph } from '@src/rendering/glyphs/BarNumberGlyph';
import { BarSeperatorGlyph } from '@src/rendering/glyphs/BarSeperatorGlyph';
import { FlagGlyph } from '@src/rendering/glyphs/FlagGlyph';
import { ClefGlyph } from '@src/rendering/glyphs/ClefGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { RepeatCloseGlyph } from '@src/rendering/glyphs/RepeatCloseGlyph';
import { RepeatCountGlyph } from '@src/rendering/glyphs/RepeatCountGlyph';
import { RepeatOpenGlyph } from '@src/rendering/glyphs/RepeatOpenGlyph';
import { ScoreBeatGlyph } from '@src/rendering/glyphs/ScoreBeatGlyph';
import { ScoreBeatPreNotesGlyph } from '@src/rendering/glyphs/ScoreBeatPreNotesGlyph';
import { ScoreTimeSignatureGlyph } from '@src/rendering/glyphs/ScoreTimeSignatureGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import { ScoreBeatContainerGlyph } from '@src/rendering/ScoreBeatContainerGlyph';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { AccidentalHelper } from '@src/rendering/utils/AccidentalHelper';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { BeamingHelper, BeamingHelperDrawInfo } from '@src/rendering/utils/BeamingHelper';
import { RenderingResources } from '@src/RenderingResources';
import { Settings } from '@src/Settings';
import { ModelUtils } from '@src/model/ModelUtils';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

/**
 * This BarRenderer renders a bar using standard music notation.
 */
export class ScoreBarRenderer extends BarRendererBase {
    public static readonly StaffId: string = 'score';
    private static SharpKsSteps: number[] = [-1, 2, -2, 1, 4, 0, 3];
    private static FlatKsSteps: number[] = [3, 0, 4, 1, 5, 2, 6];

    public simpleWhammyOverflow: number = 0;
    private _firstLineY: number = 0;

    public accidentalHelper: AccidentalHelper;

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);
        this._startSpacing = false;
        this.accidentalHelper = new AccidentalHelper(this);
    }

    public getBeatDirection(beat: Beat): BeamDirection {
        return this.helpers.getBeamingHelperForBeat(beat).direction;
    }

    public get lineOffset(): number {
        return (BarRendererBase.LineSpacing + 1) * this.scale;
    }

    protected updateSizes(): void {
        let res: RenderingResources = this.resources;
        let glyphOverflow: number = res.tablatureFont.size / 2 + res.tablatureFont.size * 0.2;
        this.topPadding = glyphOverflow * this.scale;
        this.bottomPadding = glyphOverflow * this.scale;
        this.height = this.lineOffset * 4 + this.topPadding + this.bottomPadding;

        this.updateFirstLineY();

        super.updateSizes();
    }

    private updateFirstLineY() {
        let fullLineHeight = this.lineOffset * 4;
        let actualLineHeight = (this.bar.staff.standardNotationLineCount - 1) * this.lineOffset;
        this._firstLineY = (fullLineHeight - actualLineHeight) / 2;
    }

    public doLayout(): void {
        this.updateFirstLineY();
        super.doLayout();
        if (!this.bar.isEmpty && this.accidentalHelper.maxLineBeat) {
            let top: number = this.getScoreY(-2);
            let bottom: number = this.getScoreY(6);
            let whammyOffset: number = this.simpleWhammyOverflow;
            this.registerOverflowTop(whammyOffset);
            let maxNoteY: number = this.getScoreY(this.accidentalHelper.maxLine);
            let maxNoteHelper: BeamingHelper = this.helpers.getBeamingHelperForBeat(this.accidentalHelper.maxLineBeat);
            if (maxNoteHelper.direction === BeamDirection.Up) {
                maxNoteY -= this.getStemSize(maxNoteHelper);
                maxNoteY -= maxNoteHelper.fingeringCount * this.resources.graceFont.size;
                if (maxNoteHelper.hasTuplet) {
                    maxNoteY -= this.resources.effectFont.size * 2;
                }
            }
            if (maxNoteHelper.hasTuplet) {
                maxNoteY -= this.resources.effectFont.size * 1.5;
            }
            if (maxNoteY < top) {
                this.registerOverflowTop(Math.abs(maxNoteY) + whammyOffset);
            }
            let minNoteY: number = this.getScoreY(this.accidentalHelper.minLine);
            let minNoteHelper: BeamingHelper = this.helpers.getBeamingHelperForBeat(this.accidentalHelper.minLineBeat!);
            if (minNoteHelper.direction === BeamDirection.Down) {
                minNoteY += this.getStemSize(minNoteHelper);
                minNoteY += minNoteHelper.fingeringCount * this.resources.graceFont.size;
            }
            if (minNoteY > bottom) {
                this.registerOverflowBottom(Math.abs(minNoteY) - bottom);
            }
        }
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        this.paintBeams(cx, cy, canvas);
        this.paintTuplets(cx, cy, canvas);
    }

    private paintTuplets(cx: number, cy: number, canvas: ICanvas): void {
        for (let voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                let container: VoiceContainerGlyph = this.getVoiceContainer(voice)!;
                for (let tupletGroup of container.tupletGroups) {
                    this.paintTupletHelper(cx + this.beatGlyphsStart, cy, canvas, tupletGroup);
                }
            }
        }
    }

    private paintBeams(cx: number, cy: number, canvas: ICanvas): void {
        for (let i: number = 0, j: number = this.helpers.beamHelpers.length; i < j; i++) {
            let v: BeamingHelper[] = this.helpers.beamHelpers[i];
            for (let k: number = 0, l: number = v.length; k < l; k++) {
                let h: BeamingHelper = v[k];
                this.paintBeamHelper(cx + this.beatGlyphsStart, cy, canvas, h);
            }
        }
    }

    private paintBeamHelper(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper): void {
        canvas.color = h.voice!.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        // TODO: draw stem at least at the center of the score staff.
        // check if we need to paint simple footer
        if (!h.isRestBeamHelper) {
            if (h.beats.length === 1) {
                this.paintFlag(cx, cy, canvas, h);
            } else {
                this.paintBar(cx, cy, canvas, h);
            }
        }
    }

    private paintTupletHelper(cx: number, cy: number, canvas: ICanvas, h: TupletGroup): void {
        let res: RenderingResources = this.resources;
        let oldAlign: TextAlign = canvas.textAlign;
        let oldBaseLine = canvas.textBaseline;
        canvas.color = h.voice.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        canvas.textAlign = TextAlign.Center;
        canvas.textBaseline = TextBaseline.Middle;
        let s: string;
        let num: number = h.beats[0].tupletNumerator;
        let den: number = h.beats[0].tupletDenominator;
        // list as in Guitar Pro 7. for certain tuplets only the numerator is shown
        if (num === 2 && den === 3) {
            s = '2';
        } else if (num === 3 && den === 2) {
            s = '3';
        } else if (num === 4 && den === 6) {
            s = '4';
        } else if (num === 5 && den === 4) {
            s = '5';
        } else if (num === 6 && den === 4) {
            s = '6';
        } else if (num === 7 && den === 4) {
            s = '7';
        } else if (num === 9 && den === 8) {
            s = '9';
        } else if (num === 10 && den === 8) {
            s = '10';
        } else if (num === 11 && den === 8) {
            s = '11';
        } else if (num === 12 && den === 8) {
            s = '12';
        } else if (num === 13 && den === 8) {
            s = '13';
        } else {
            s = num + ':' + den;
        }
        // check if we need to paint simple footer
        let offset: number = 10 * this.scale;
        let size: number = 5 * this.scale;

        if (h.beats.length === 1 || !h.isFull) {
            for (let i: number = 0, j: number = h.beats.length; i < j; i++) {
                let beat: Beat = h.beats[i];
                let beamingHelper: BeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(beat.index)!;
                if (!beamingHelper) {
                    continue;
                }
                let direction: BeamDirection = beamingHelper.direction;
                let tupletX: number = beamingHelper.getBeatLineX(beat);
                let tupletY: number = this.calculateBeamYWithDirection(
                    beamingHelper,
                    tupletX,
                    direction
                );
                if (direction === BeamDirection.Down) {
                    offset *= -1;
                    size *= -1;
                }
                canvas.font = res.effectFont;
                canvas.fillText(s, cx + this.x + tupletX, cy + this.y + tupletY - offset - size);
            }
        } else {
            let firstBeat: Beat = h.beats[0];
            let lastBeat: Beat = h.beats[h.beats.length - 1];
            let firstNonRestBeat: Beat | null = null;
            let lastNonRestBeat: Beat | null = null;
            for (let i = 0; i < h.beats.length; i++) {
                if (!h.beats[i].isRest) {
                    firstNonRestBeat = h.beats[i];
                    break;
                }
            }
            for (let i = h.beats.length - 1; i >= 0; i--) {
                if (!h.beats[i].isRest) {
                    lastNonRestBeat = h.beats[i];
                    break;
                }
            }

            let isRestOnly = false;
            if (!firstNonRestBeat) {
                firstNonRestBeat = firstBeat;
                isRestOnly = true;
            }

            if (!lastNonRestBeat) {
                lastNonRestBeat = lastBeat;
            }

            //
            // Calculate the overall area of the tuplet bracket
            let firstBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(firstBeat.index)!;
            let lastBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(lastBeat.index)!;
            let startX: number = firstBeamingHelper.getBeatLineX(firstBeat);
            let endX: number = lastBeamingHelper.getBeatLineX(lastBeat);

            //
            // calculate the y positions for our bracket
            let firstNonRestBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(firstNonRestBeat.index)!;
            let lastNonRestBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(lastNonRestBeat.index)!;
            let direction = firstBeamingHelper.direction;
            let startY: number = this.calculateBeamYWithDirection(
                firstNonRestBeamingHelper,
                startX,
                direction
            );
            let endY: number = this.calculateBeamYWithDirection(
                lastNonRestBeamingHelper,
                endX,
                direction
            );
            if(isRestOnly) {
                startY = Math.max(startY, endY);
                endY = startY;
            }

            //
            // Calculate how many space the text will need
            canvas.font = res.effectFont;
            let sw: number = canvas.measureText(s);
            let sp: number = 3 * this.scale;
            //
            // Calculate the offsets where to break the bracket
            let middleX: number = (startX + endX) / 2;
            let offset1X: number = middleX - sw / 2 - sp;
            let offset2X: number = middleX + sw / 2 + sp;

            let k: number = (endY - startY) / (endX - startX);
            let d: number = startY - k * startX;
            let offset1Y: number = k * offset1X + d;
            let middleY: number = k * middleX + d;
            let offset2Y: number = k * offset2X + d;
            if (direction === BeamDirection.Down) {
                offset *= -1;
                size *= -1;
            }
            //
            // draw the bracket
            canvas.beginPath();
            canvas.moveTo(cx + this.x + startX, (cy + this.y + startY - offset) | 0);
            canvas.lineTo(cx + this.x + startX, (cy + this.y + startY - offset - size) | 0);
            canvas.lineTo(cx + this.x + offset1X, (cy + this.y + offset1Y - offset - size) | 0);
            canvas.stroke();
            canvas.beginPath();
            canvas.moveTo(cx + this.x + offset2X, (cy + this.y + offset2Y - offset - size) | 0);
            canvas.lineTo(cx + this.x + endX, (cy + this.y + endY - offset - size) | 0);
            canvas.lineTo(cx + this.x + endX, (cy + this.y + endY - offset) | 0);
            canvas.stroke();
            //
            // Draw the string
            canvas.fillText(
                s,
                cx + this.x + middleX,
                cy + this.y + middleY - offset - size
            );
        }
        canvas.textAlign = oldAlign;
        canvas.textBaseline = oldBaseLine;
    }

    public getStemSize(helper: BeamingHelper): number {
        let size: number =
            helper.beats.length === 1
                ? this.getFlagStemSize(helper.shortestDuration)
                : this.getBarStemSize(helper.shortestDuration);
        if (helper.isGrace) {
            size = size * NoteHeadGlyph.GraceScale;
        }
        return size;
    }

    private getBarStemSize(duration: Duration): number {
        let size: number = 0;
        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.Half:
            case Duration.Quarter:
            case Duration.Eighth:
            case Duration.Sixteenth:
                size = 6;
                break;
            case Duration.ThirtySecond:
                size = 8;
                break;
            case Duration.SixtyFourth:
                size = 9;
                break;
            case Duration.OneHundredTwentyEighth:
                size = 9;
                break;
            case Duration.TwoHundredFiftySixth:
                size = 10;
                break;
            default:
                size = 0;
                break;
        }
        return this.getScoreHeight(size);
    }

    private getFlagStemSize(duration: Duration): number {
        let size: number = 0;
        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.Half:
            case Duration.Quarter:
            case Duration.Eighth:
            case Duration.Sixteenth:
            case Duration.ThirtySecond:
            case Duration.SixtyFourth:
            case Duration.OneHundredTwentyEighth:
            case Duration.TwoHundredFiftySixth:
                size = 6;
                break;
            default:
                size = 0;
                break;
        }
        return this.getScoreHeight(size);
    }

    public get middleYPosition(): number {
        return this.getScoreY(this.bar.staff.standardNotationLineCount - 1);
    }

    public getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        let y = super.getNoteY(note, requestedPosition);
        if (isNaN(y)) {
            // NOTE: some might request the note position before the glyphs have been created
            // e.g. the beaming helper, for these we just need a rough
            // estimate on the position
            const line = AccidentalHelper.computeLineWithoutAccidentals(this.bar, note);
            y = this.getScoreY(line);
        }
        return y;
    }

    public calculateBeamY(h: BeamingHelper, x: number): number {
        return this.calculateBeamYWithDirection(h, x, h.direction);
    }

    public applyLayoutingInfo(): boolean {
        const result = super.applyLayoutingInfo();
        if (result && this.bar.isMultiVoice) {
            // consider rest overflows
            let top: number = this.getScoreY(-2);
            let bottom: number = this.getScoreY(6);
            let minMax = this.helpers.collisionHelper.getBeatMinMaxY();
            if (minMax[0] < top) {
                this.registerOverflowTop(Math.abs(minMax[0]));
            }
            if (minMax[1] > bottom) {
                this.registerOverflowBottom(Math.abs(minMax[1]) - bottom);
            }
        }
        return result;
    }

    private calculateBeamYWithDirection(h: BeamingHelper, x: number, direction: BeamDirection): number {
        let stemSize: number = this.getStemSize(h);

        if (!h.drawingInfos.has(direction)) {
            let drawingInfo = new BeamingHelperDrawInfo();
            h.drawingInfos.set(direction, drawingInfo);

            // the beaming logic works like this: 
            // 1. we take the first and last note, add the stem, and put a diagnal line between them. 
            // 2. the height of the diagonal line must not exceed a max height, 
            //    - if this is the case, the line on the more distant note just gets longer
            // 3. any middle elements (notes or rests) shift this diagonal line up/down to avoid overlaps

            const firstBeat = h.beats[0];
            const lastBeat = h.beats[h.beats.length - 1];

            let isRest = h.isRestBeamHelper;

            // 1. put direct diagonal line.
            drawingInfo.startBeat = firstBeat;
            drawingInfo.startX = h.getBeatLineX(firstBeat);
            if (isRest) {
                drawingInfo.startY = direction === BeamDirection.Up
                    ? this.getScoreY(h.minRestLine!)
                    : this.getScoreY(h.maxRestLine!);
            } else {
                drawingInfo.startY = direction === BeamDirection.Up
                    ? this.getScoreY(this.accidentalHelper.getMinLine(firstBeat)) - stemSize
                    : this.getScoreY(this.accidentalHelper.getMaxLine(firstBeat)) + stemSize;
            }


            drawingInfo.endBeat = lastBeat;
            drawingInfo.endX = h.getBeatLineX(lastBeat);
            if (isRest) {
                drawingInfo.endY = direction === BeamDirection.Up
                    ? this.getScoreY(h.minRestLine!)
                    : this.getScoreY(h.maxRestLine!);
            } else {
                drawingInfo.endY =
                    direction === BeamDirection.Up
                        ? this.getScoreY(this.accidentalHelper.getMinLine(lastBeat)) - stemSize
                        : this.getScoreY(this.accidentalHelper.getMaxLine(lastBeat)) + stemSize;
            }
            // 2. ensure max height
            // we use the min/max notes to place the beam along their real position
            // we only want a maximum of 10 offset for their gradient
            let maxDistance: number = 10 * this.scale;
            if (direction === BeamDirection.Down && drawingInfo.startY > drawingInfo.endY && drawingInfo.startY - drawingInfo.endY > maxDistance) {
                drawingInfo.endY = drawingInfo.startY - maxDistance;
            }
            if (direction === BeamDirection.Down && drawingInfo.endY > drawingInfo.startY && drawingInfo.endY - drawingInfo.startY > maxDistance) {
                drawingInfo.startY = drawingInfo.endY - maxDistance;
            }
            if (direction === BeamDirection.Up && drawingInfo.startY < drawingInfo.endY && drawingInfo.endY - drawingInfo.startY > maxDistance) {
                drawingInfo.endY = drawingInfo.startY + maxDistance;
            }
            if (direction === BeamDirection.Up && drawingInfo.endY < drawingInfo.startY && drawingInfo.startY - drawingInfo.endY > maxDistance) {
                drawingInfo.startY = drawingInfo.endY + maxDistance;
            }

            // 3. let middle elements shift up/down
            if (h.beats.length > 1) {
                // check if highest note shifts bar up or down
                if (direction === BeamDirection.Up) {
                    let yNeededForHighestNote = this.getScoreY(this.accidentalHelper.getMinLine(h.beatOfHighestNote)) - stemSize;
                    const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfHighestNote));

                    const diff = yGivenByCurrentValues - yNeededForHighestNote;
                    if (diff > 0) {
                        drawingInfo.startY -= diff;
                        drawingInfo.endY -= diff;
                    }
                } else {
                    let yNeededForLowestNote = this.getScoreY(this.accidentalHelper.getMaxLine(h.beatOfLowestNote)) + stemSize;
                    const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfLowestNote));

                    const diff = yNeededForLowestNote - yGivenByCurrentValues;
                    if (diff > 0) {
                        drawingInfo.startY += diff;
                        drawingInfo.endY += diff;
                    }
                }

                // check if rest shifts bar up or down
                if (h.minRestLine !== null || h.maxRestLine !== null) {
                    const barCount: number = ModelUtils.getIndex(h.shortestDuration) - 2;
                    let scaleMod: number = h.isGrace ? NoteHeadGlyph.GraceScale : 1;
                    let barSpacing: number = barCount *
                        (BarRendererBase.BeamSpacing + BarRendererBase.BeamThickness) * this.scale * scaleMod;
                    barSpacing += BarRendererBase.BeamSpacing;

                    if (direction === BeamDirection.Up && h.minRestLine !== null) {
                        let yNeededForRest = this.getScoreY(h.minRestLine!) - barSpacing;
                        const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfMinRestLine!));

                        const diff = yGivenByCurrentValues - yNeededForRest;
                        if (diff > 0) {
                            drawingInfo.startY -= diff;
                            drawingInfo.endY -= diff;
                        }
                    } else if (direction === BeamDirection.Down && h.maxRestLine !== null) {
                        let yNeededForRest = this.getScoreY(h.maxRestLine!) + barSpacing;
                        const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfMaxRestLine!));

                        const diff = yNeededForRest - yGivenByCurrentValues;
                        if (diff > 0) {
                            drawingInfo.startY += diff;
                            drawingInfo.endY += diff;
                        }
                    }
                }
            }
        }

        return h.drawingInfos.get(direction)!.calcY(x);
    }


    private paintBar(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper): void {
        for (let i: number = 0, j: number = h.beats.length; i < j; i++) {
            let beat: Beat = h.beats[i];
            let isGrace: boolean = beat.graceType !== GraceType.None;
            let scaleMod: number = isGrace ? NoteHeadGlyph.GraceScale : 1;
            //
            // draw line
            //
            let beatLineX: number = h.getBeatLineX(beat);
            let direction: BeamDirection = h.direction;
            let y1: number = cy + this.y;

            y1 +=
                direction === BeamDirection.Up
                    ? this.getScoreY(this.accidentalHelper.getMaxLine(beat))
                    : this.getScoreY(this.accidentalHelper.getMinLine(beat));
            let y2: number = cy + this.y;
            y2 += this.calculateBeamY(h, beatLineX);
            canvas.lineWidth = ScoreBarRenderer.StemWidth * this.scale;
            canvas.beginPath();
            canvas.moveTo(cx + this.x + beatLineX, y1);
            canvas.lineTo(cx + this.x + beatLineX, y2);
            canvas.stroke();
            canvas.lineWidth = this.scale;
            let fingeringY: number = y2;
            if (direction === BeamDirection.Down) {
                fingeringY += canvas.font.size * 2;
            } else if (i !== 0) {
                fingeringY -= canvas.font.size * 1.5;
            }
            this.paintFingering(canvas, beat, cx + this.x + beatLineX, direction, fingeringY);
            let brokenBarOffset: number = 6 * this.scale * scaleMod;
            let barSpacing: number =
                (BarRendererBase.BeamSpacing + BarRendererBase.BeamThickness) * this.scale * scaleMod;
            let barSize: number = BarRendererBase.BeamThickness * this.scale * scaleMod;
            let barCount: number = ModelUtils.getIndex(beat.duration) - 2;
            let barStart: number = cy + this.y;
            if (direction === BeamDirection.Down) {
                barSpacing = -barSpacing;
                barSize = -barSize;
            }
            for (let barIndex: number = 0; barIndex < barCount; barIndex++) {
                let barStartX: number = 0;
                let barEndX: number = 0;
                let barStartY: number = 0;
                let barEndY: number = 0;
                let barY: number = barStart + barIndex * barSpacing;
                //
                // Bar to Next?
                //
                if (i < h.beats.length - 1) {
                    // full bar?
                    if (BeamingHelper.isFullBarJoin(beat, h.beats[i + 1], barIndex)) {
                        barStartX = beatLineX;
                        barEndX = h.getBeatLineX(h.beats[i + 1]);
                    } else if (i === 0 || !BeamingHelper.isFullBarJoin(h.beats[i - 1], beat, barIndex)) {
                        barStartX = beatLineX;
                        barEndX = barStartX + brokenBarOffset;
                    } else {
                        continue;
                    }
                    barStartY = barY + this.calculateBeamY(h, barStartX);
                    barEndY = barY + this.calculateBeamY(h, barEndX);
                    ScoreBarRenderer.paintSingleBar(
                        canvas,
                        cx + this.x + barStartX,
                        barStartY,
                        cx + this.x + barEndX,
                        barEndY,
                        barSize
                    );
                } else if (i > 0 && !BeamingHelper.isFullBarJoin(beat, h.beats[i - 1], barIndex)) {
                    barStartX = beatLineX - brokenBarOffset;
                    barEndX = beatLineX;
                    barStartY = barY + this.calculateBeamY(h, barStartX);
                    barEndY = barY + this.calculateBeamY(h, barEndX);
                    ScoreBarRenderer.paintSingleBar(
                        canvas,
                        cx + this.x + barStartX,
                        barStartY,
                        cx + this.x + barEndX,
                        barEndY,
                        barSize
                    );
                }
            }
        }
    }

    private static paintSingleBar(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number, size: number): void {
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.lineTo(x2, y2 + size);
        canvas.lineTo(x1, y1 + size);
        canvas.closePath();
        canvas.fill();
    }

    private paintFlag(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper): void {
        let beat: Beat = h.beats[0];
        if (
            beat.graceType === GraceType.BendGrace ||
            (beat.graceType !== GraceType.None && this.settings.notation.notationMode === NotationMode.SongBook)
        ) {
            return;
        }
        let isGrace: boolean = beat.graceType !== GraceType.None;
        let scaleMod: number = isGrace ? NoteHeadGlyph.GraceScale : 1;
        //
        // draw line
        //
        let stemSize: number = this.getFlagStemSize(h.shortestDuration);
        let beatLineX: number = h.getBeatLineX(beat);
        let direction: BeamDirection = h.direction;
        let topY: number = this.getScoreY(this.accidentalHelper.getMinLine(beat));
        let bottomY: number = this.getScoreY(this.accidentalHelper.getMaxLine(beat));
        let beamY: number = 0;
        let fingeringY: number = 0;
        if (direction === BeamDirection.Down) {
            bottomY += stemSize * scaleMod;
            beamY = bottomY;
            fingeringY = cy + this.y + bottomY;
        } else {
            topY -= stemSize * scaleMod;
            beamY = topY;
            fingeringY = cy + this.y + topY;
        }
        this.paintFingering(canvas, beat, cx + this.x + beatLineX, direction, fingeringY);
        if (!h.hasLine) {
            return;
        }
        canvas.lineWidth = BarRendererBase.StemWidth * this.scale;
        canvas.beginPath();
        canvas.moveTo(cx + this.x + beatLineX, cy + this.y + topY);
        canvas.lineTo(cx + this.x + beatLineX, cy + this.y + bottomY);
        canvas.stroke();
        canvas.lineWidth = this.scale;
        if (beat.graceType === GraceType.BeforeBeat) {
            let graceSizeY: number = 15 * this.scale;
            let graceSizeX: number = 12 * this.scale;
            canvas.beginPath();
            if (direction === BeamDirection.Down) {
                canvas.moveTo(cx + this.x + beatLineX - graceSizeX / 2, cy + this.y + bottomY - graceSizeY);
                canvas.lineTo(cx + this.x + beatLineX + graceSizeX / 2, cy + this.y + bottomY);
            } else {
                canvas.moveTo(cx + this.x + beatLineX - graceSizeX / 2, cy + this.y + topY + graceSizeY);
                canvas.lineTo(cx + this.x + beatLineX + graceSizeX / 2, cy + this.y + topY);
            }
            canvas.stroke();
        }
        //
        // Draw flag
        //
        if (h.hasFlag) {
            let glyph: FlagGlyph = new FlagGlyph(beatLineX - this.scale / 2, beamY, beat.duration, direction, isGrace);
            glyph.renderer = this;
            glyph.doLayout();
            glyph.paint(cx + this.x, cy + this.y, canvas);
        }
    }

    private paintFingering(
        canvas: ICanvas,
        beat: Beat,
        beatLineX: number,
        direction: BeamDirection,
        topY: number
    ): void {
        let settings: Settings = this.settings;
        if (
            settings.notation.fingeringMode !== FingeringMode.ScoreDefault &&
            settings.notation.fingeringMode !== FingeringMode.ScoreForcePiano
        ) {
            return;
        }
        if (direction === BeamDirection.Up) {
            beatLineX -= 10 * this.scale;
        } else {
            beatLineX += 3 * this.scale;
        }
        // sort notes ascending in their value to ensure
        // we are drawing the numbers according to their order on the stave
        let noteList: Note[] = beat.notes.slice(0);
        noteList.sort((a, b) => {
            return a.realValue - b.realValue;
        });
        for (let n: number = 0; n < noteList.length; n++) {
            let note: Note = noteList[n];
            let text: string | null = null;
            if (note.leftHandFinger !== Fingers.Unknown) {
                text = ModelUtils.fingerToString(settings, beat, note.leftHandFinger, true);
            } else if (note.rightHandFinger !== Fingers.Unknown) {
                text = ModelUtils.fingerToString(settings, beat, note.rightHandFinger, false);
            }
            if (!text) {
                continue;
            }
            canvas.fillText(text, beatLineX, topY);
            topY -= canvas.font.size | 0;
        }
    }

    protected createPreBeatGlyphs(): void {
        super.createPreBeatGlyphs();
        if (this.bar.masterBar.isRepeatStart) {
            this.addPreBeatGlyph(new RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        // Clef
        if (
            this.isFirstOfLine ||
            this.bar.clef !== this.bar.previousBar!.clef ||
            this.bar.clefOttava !== this.bar.previousBar!.clefOttava
        ) {
            let offset: number = 0;
            switch (this.bar.clef) {
                case Clef.Neutral:
                    offset = this.bar.staff.standardNotationLineCount - 1;
                    break;
                case Clef.F4:
                    offset = 2;
                    break;
                case Clef.C3:
                    offset = 4;
                    break;
                case Clef.C4:
                    offset = 2;
                    break;
                case Clef.G2:
                    offset = 6;
                    break;
            }
            this.createStartSpacing();

            this.addPreBeatGlyph(
                new ClefGlyph(0, this.getScoreY(offset) + 0.5 * BarRendererBase.StaffLineThickness, this.bar.clef, this.bar.clefOttava)
            );
        }
        // Key signature
        if (
            (this.index === 0 && this.bar.masterBar.keySignature !== 0) ||
            (this.bar.previousBar && this.bar.masterBar.keySignature !== this.bar.previousBar.masterBar.keySignature)
        ) {
            this.createStartSpacing();
            this.createKeySignatureGlyphs();
        }
        // Time Signature
        if (
            !this.bar.previousBar ||
            (this.bar.previousBar &&
                this.bar.masterBar.timeSignatureNumerator !== this.bar.previousBar.masterBar.timeSignatureNumerator) ||
            (this.bar.previousBar &&
                this.bar.masterBar.timeSignatureDenominator !== this.bar.previousBar.masterBar.timeSignatureDenominator)
        ) {
            this.createStartSpacing();
            this.createTimeSignatureGlyphs();
        }
        this.addPreBeatGlyph(new BarNumberGlyph(0, this.getScoreHeight(-0.5), this.bar.index + 1));
    }

    protected createBeatGlyphs(): void {
        for (let v: number = 0; v < this.bar.voices.length; v++) {
            let voice: Voice = this.bar.voices[v];
            if (this.hasVoiceContainer(voice)) {
                this.createVoiceGlyphs(voice);
            }
        }
    }

    protected createPostBeatGlyphs(): void {
        super.createPostBeatGlyphs();
        if (this.bar.masterBar.isRepeatEnd) {
            this.addPostBeatGlyph(new RepeatCloseGlyph(this.x, 0));
            if (this.bar.masterBar.repeatCount > 2) {
                this.addPostBeatGlyph(new RepeatCountGlyph(0, this.getScoreHeight(-0.5), this.bar.masterBar.repeatCount));
            }
        } else {
            this.addPostBeatGlyph(new BarSeperatorGlyph(0, 0));
        }
    }

    private _startSpacing: boolean;

    private createStartSpacing(): void {
        if (this._startSpacing) {
            return;
        }
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, 2 * this.scale));
        this._startSpacing = true;
    }

    private createKeySignatureGlyphs(): void {
        let offsetClef: number = 0;
        let currentKey: number = this.bar.masterBar.keySignature;
        let previousKey: number = !this.bar.previousBar ? 0 : this.bar.previousBar.masterBar.keySignature;
        switch (this.bar.clef) {
            case Clef.Neutral:
                offsetClef = 0;
                break;
            case Clef.G2:
                offsetClef = 1;
                break;
            case Clef.F4:
                offsetClef = 2;
                break;
            case Clef.C3:
                offsetClef = -1;
                break;
            case Clef.C4:
                offsetClef = 1;
                break;
        }
        let newLines: Map<number, boolean> = new Map<number, boolean>();
        let newGlyphs: Glyph[] = [];
        // how many symbols do we need to get from a C-keysignature
        // to the new one
        // var offsetSymbols = (currentKey <= 7) ? currentKey : currentKey - 7;
        // a sharp keysignature
        if (ModelUtils.keySignatureIsSharp(currentKey)) {
            for (let i: number = 0; i < Math.abs(currentKey); i++) {
                let step: number = ScoreBarRenderer.SharpKsSteps[i] + offsetClef;
                newGlyphs.push(new AccidentalGlyph(0, this.getScoreY(step), AccidentalType.Sharp, false));
                newLines.set(step, true);
            }
        } else {
            for (let i: number = 0; i < Math.abs(currentKey); i++) {
                let step: number = ScoreBarRenderer.FlatKsSteps[i] + offsetClef;
                newGlyphs.push(new AccidentalGlyph(0, this.getScoreY(step), AccidentalType.Flat, false));
                newLines.set(step, true);
            }
        }
        // naturalize previous key
        let naturalizeSymbols: number = Math.abs(previousKey);
        let previousKeyPositions = ModelUtils.keySignatureIsSharp(previousKey)
            ? ScoreBarRenderer.SharpKsSteps
            : ScoreBarRenderer.FlatKsSteps;
        for (let i: number = 0; i < naturalizeSymbols; i++) {
            let step: number = previousKeyPositions[i] + offsetClef;
            if (!newLines.has(step)) {
                this.addPreBeatGlyph(
                    new AccidentalGlyph(
                        0,
                        this.getScoreY(previousKeyPositions[i] + offsetClef),
                        AccidentalType.Natural,
                        false
                    )
                );
            }
        }
        for (let newGlyph of newGlyphs) {
            this.addPreBeatGlyph(newGlyph);
        }
    }

    private createTimeSignatureGlyphs(): void {
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, 5 * this.scale));

        const lines = this.bar.staff.standardNotationLineCount - 1;
        this.addPreBeatGlyph(
            new ScoreTimeSignatureGlyph(
                0,
                this.getScoreY(lines),
                this.bar.masterBar.timeSignatureNumerator,
                this.bar.masterBar.timeSignatureDenominator,
                this.bar.masterBar.timeSignatureCommon
            )
        );
    }

    protected createVoiceGlyphs(v: Voice): void {
        for (let i: number = 0, j: number = v.beats.length; i < j; i++) {
            let b: Beat = v.beats[i];
            let container: ScoreBeatContainerGlyph = new ScoreBeatContainerGlyph(b, this.getVoiceContainer(v)!);
            container.preNotes = new ScoreBeatPreNotesGlyph();
            container.onNotes = new ScoreBeatGlyph();
            this.addBeatGlyph(container);
        }
    }

    public getNoteLine(n: Note): number {
        return this.accidentalHelper.getNoteLine(n);
    }

    /**
     * Gets the relative y position of the given steps relative to first line.
     * @param steps the amount of steps while 2 steps are one line
     * @returns
     */
    public getScoreY(steps: number): number {
        return (
            this._firstLineY +
            this.lineOffset +
            this.getScoreHeight(steps)
        );
    }

    /**
     * Gets the height of an element that spans the given amount of steps.
     * @param steps the amount of steps while 2 steps are one line
     * @param correction
     * @returns
     */
    public getScoreHeight(steps: number): number {
        return (this.lineOffset / 2) * steps;
    }

    // private static readonly Random Random = new Random();
    protected paintBackground(cx: number, cy: number, canvas: ICanvas): void {
        super.paintBackground(cx, cy, canvas);
        let res: RenderingResources = this.resources;
        // canvas.color = Color.random(100);
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);
        //
        // draw string lines
        //
        canvas.color = res.staffLineColor;

        for (let i: number = 0; i < this.bar.staff.standardNotationLineCount; i++) {
            const lineY = cy + this.y + this.getScoreY(i * 2);
            canvas.fillRect(cx + this.x, lineY | 0, this.width, this.scale * BarRendererBase.StaffLineThickness);
        }
        canvas.color = res.mainGlyphColor;

        this.paintSimileMark(cx, cy, canvas);
    }

    public completeBeamingHelper(helper: BeamingHelper) {
        // for multi-voice bars we need to register the positions 
        // for multi-voice rest displacement to avoid collisions
        if (this.bar.isMultiVoice && helper.highestNoteInHelper && helper.lowestNoteInHelper) {
            let highestNotePosition = this.getNoteY(helper.highestNoteInHelper, NoteYPosition.Center);
            let lowestNotePosition = this.getNoteY(helper.lowestNoteInHelper, NoteYPosition.Center);

            let offset = this.getStemSize(helper);
            if (helper.hasTuplet) {
                offset += this.resources.effectFont.size * 2;
            }

            if (helper.direction == BeamDirection.Up) {
                highestNotePosition -= offset;
            } else {
                lowestNotePosition += offset;
            }

            for (const beat of helper.beats) {
                this.helpers.collisionHelper.reserveBeatSlot(beat, highestNotePosition, lowestNotePosition);
            }
        }
    }
}
