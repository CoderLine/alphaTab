import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { SlideInType } from '@coderline/alphatab/model/SlideInType';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { type BarRendererBase, NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import type { BeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NoteVibratoGlyph } from '@coderline/alphatab/rendering/glyphs/NoteVibratoGlyph';
import type { ITieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import type { ScoreBeatContainerGlyph } from '@coderline/alphatab/rendering/ScoreBeatContainerGlyph';

/**
 * Staff-absolute coordinates (include the note's renderer `.x`/`.y`).
 *
 * @record
 * @internal
 */
interface ScoreSlideSegment {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    waves: boolean;
}

/**
 * @internal
 */
export class ScoreSlideLineGlyph extends Glyph implements ITieGlyph {
    private _outType: SlideOutType;
    private _inType: SlideInType;
    private _startNote: Note;
    private _parent: BeatContainerGlyph;

    // Per-cycle cache; invalidated in doLayout. Paired *CacheValid flags
    // rather than nullable-as-sentinel — C# transpile doesn't unwrap `T | null`
    // with `!` cleanly.
    private _slideInCache: ScoreSlideSegment | null = null;
    private _slideInCacheValid: boolean = false;
    private _slideOutCache: ScoreSlideSegment | null = null;
    private _slideOutCacheValid: boolean = false;

    // the slide line cannot overflow anything and there are ties drawn in here
    public readonly checkForOverflow = false;

    public constructor(inType: SlideInType, outType: SlideOutType, startNote: Note, parent: BeatContainerGlyph) {
        super(0, 0);
        this._outType = outType;
        this._inType = inType;
        this._startNote = startNote;
        this._parent = parent;
    }

    public override doLayout(): void {
        this._slideInCacheValid = false;
        this._slideInCache = null;
        this._slideOutCacheValid = false;
        this._slideOutCache = null;
        this.width = 0;
    }

    /** Lazy — geometry depends on `renderer.x`, final only post-system-layout. */
    public override getBoundingBoxLeft(): number {
        let min = 0;
        let found = false;
        const slideIn = this._computeSlideIn();
        if (slideIn) {
            min = Math.min(slideIn.startX, slideIn.endX);
            found = true;
        }
        const slideOut = this._computeSlideOut();
        if (slideOut) {
            const localMin = Math.min(slideOut.startX, slideOut.endX);
            if (!found || localMin < min) {
                min = localMin;
                found = true;
            }
        }
        return found ? min : this.x;
    }

    public override getBoundingBoxRight(): number {
        let max = 0;
        let found = false;
        const slideIn = this._computeSlideIn();
        if (slideIn) {
            max = Math.max(slideIn.startX, slideIn.endX);
            found = true;
        }
        const slideOut = this._computeSlideOut();
        if (slideOut) {
            const localMax = Math.max(slideOut.startX, slideOut.endX);
            if (!found || localMax > max) {
                max = localMax;
                found = true;
            }
        }
        return found ? max : this.x;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const slideIn = this._computeSlideIn();
        if (slideIn) {
            this._paintSlideLine(
                canvas,
                false,
                cx + slideIn.startX,
                cx + slideIn.endX,
                cy + slideIn.startY,
                cy + slideIn.endY
            );
        }
        const slideOut = this._computeSlideOut();
        if (slideOut) {
            this._paintSlideLine(
                canvas,
                slideOut.waves,
                cx + slideOut.startX,
                cx + slideOut.endX,
                cy + slideOut.startY,
                cy + slideOut.endY
            );
        }
    }

    private _computeSlideIn(): ScoreSlideSegment | null {
        if (this._slideInCacheValid) {
            return this._slideInCache;
        }
        const result = this._computeSlideInUncached();
        this._slideInCache = result;
        this._slideInCacheValid = true;
        return result;
    }

    private _computeSlideInUncached(): ScoreSlideSegment | null {
        const startNoteRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const sizeX: number = startNoteRenderer.smuflMetrics.simpleSlideWidth;
        let endX =
            startNoteRenderer.x +
            startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Left) -
            startNoteRenderer.smuflMetrics.preNoteEffectPadding;
        const endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
        let startX = endX - sizeX;
        let startY: number = startNoteRenderer.y;

        switch (this._inType) {
            case SlideInType.IntoFromBelow:
                startY += startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Bottom);
                break;
            case SlideInType.IntoFromAbove:
                startY += startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Top);
                break;
            default:
                return null;
        }

        const accidentalsWidth: number = this._getAccidentalsWidth(startNoteRenderer, this._startNote.beat);
        startX -= accidentalsWidth;
        endX -= accidentalsWidth;
        return { startX, startY, endX, endY, waves: false };
    }

    private _getAccidentalsWidth(renderer: ScoreBarRenderer, beat: Beat): number {
        const container = renderer.getBeatContainer(beat) as ScoreBeatContainerGlyph;
        return container.accidentalsWidth;
    }

    private _computeSlideOut(): ScoreSlideSegment | null {
        if (this._slideOutCacheValid) {
            return this._slideOutCache;
        }
        const result = this._computeSlideOutUncached();
        this._slideOutCache = result;
        this._slideOutCacheValid = true;
        return result;
    }

    private _computeSlideOutUncached(): ScoreSlideSegment | null {
        const startNoteRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const sizeX: number = startNoteRenderer.smuflMetrics.simpleSlideWidth;
        const offsetX: number = startNoteRenderer.smuflMetrics.postNoteEffectPadding;
        let startX: number = 0;
        let startY: number = 0;
        let endX: number = 0;
        let endY: number = 0;
        let waves: boolean = false;
        switch (this._outType) {
            case SlideOutType.Shift:
            case SlideOutType.Legato:
                startX =
                    startNoteRenderer.x +
                    startNoteRenderer.getBeatX(this._startNote.beat, BeatXPosition.PostNotes) +
                    offsetX;
                startY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                if (this._startNote.slideTarget) {
                    const endNoteRenderer: BarRendererBase | null =
                        this.renderer.scoreRenderer.layout!.getRendererForBar(
                            this.renderer.staff!.staffId,
                            this._startNote.slideTarget.beat.voice.bar
                        );
                    if (!endNoteRenderer || endNoteRenderer.staff !== startNoteRenderer.staff) {
                        endX = startNoteRenderer.x + startNoteRenderer.width;
                        if (this._startNote.slideTarget.realValue > this._startNote.realValue) {
                            endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Top);
                        } else {
                            endY =
                                startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Bottom);
                        }
                    } else {
                        endX =
                            endNoteRenderer.x +
                            endNoteRenderer.getBeatX(this._startNote.slideTarget.beat, BeatXPosition.PreNotes) -
                            offsetX;
                        endY =
                            endNoteRenderer.y +
                            endNoteRenderer.getNoteY(this._startNote.slideTarget, NoteYPosition.Center);
                    }
                } else {
                    endX = startNoteRenderer.x + this._parent.x;
                    endY = startY;
                }
                break;
            case SlideOutType.OutUp:
                startX =
                    startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) + offsetX;
                startY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endX = startX + sizeX;
                endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Top);
                break;
            case SlideOutType.OutDown:
                startX =
                    startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) + offsetX;
                startY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endX = startX + sizeX;
                endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Bottom);
                break;
            case SlideOutType.PickSlideUp:
                startX =
                    startNoteRenderer.x +
                    startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) +
                    offsetX * 2;
                startY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Top);
                endX = startNoteRenderer.x + startNoteRenderer.width;
                if (
                    this._startNote.beat.nextBeat &&
                    this._startNote.beat.nextBeat.voice === this._startNote.beat.voice
                ) {
                    endX =
                        startNoteRenderer.x +
                        startNoteRenderer.getBeatX(this._startNote.beat.nextBeat, BeatXPosition.PreNotes);
                }
                waves = true;
                break;
            case SlideOutType.PickSlideDown:
                startX =
                    startNoteRenderer.x +
                    startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) +
                    offsetX * 2;
                startY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Bottom);
                endX = startNoteRenderer.x + startNoteRenderer.width;
                if (
                    this._startNote.beat.nextBeat &&
                    this._startNote.beat.nextBeat.voice === this._startNote.beat.voice
                ) {
                    endX =
                        startNoteRenderer.x +
                        startNoteRenderer.getBeatX(this._startNote.beat.nextBeat, BeatXPosition.PreNotes);
                }
                waves = true;
                break;
            default:
                return null;
        }
        return { startX, startY, endX, endY, waves };
    }

    private _paintSlideLine(
        canvas: ICanvas,
        waves: boolean,
        startX: number,
        endX: number,
        startY: number,
        endY: number
    ): void {
        if (waves) {
            const glyph: NoteVibratoGlyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight);
            glyph.renderer = this.renderer;
            glyph.doLayout();

            startY -= glyph.height / 2;
            endY -= glyph.height / 2;

            const b: number = endX - startX;
            const a: number = endY - startY;
            const c: number = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
            glyph.width = b;

            const angle: number = Math.asin(a / c) * (180 / Math.PI);
            canvas.beginRotate(startX, startY, angle);
            glyph.paint(0, 0, canvas);
            canvas.endRotate();
        } else {
            canvas.beginPath();
            canvas.moveTo(startX, startY);
            canvas.lineTo(endX, endY);
            canvas.stroke();
        }
    }
}
