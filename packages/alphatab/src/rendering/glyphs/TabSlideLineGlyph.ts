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
import type { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';

/**
 * Staff-absolute coordinates. See {@link ScoreSlideLineGlyph}.
 *
 * @record
 * @internal
 */
interface SlideSegment {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    waves: boolean;
}

/**
 * @internal
 */
export class TabSlideLineGlyph extends Glyph implements ITieGlyph {
    private _inType: SlideInType;
    private _outType: SlideOutType;
    private _startNote: Note;
    private _parent: BeatContainerGlyph;

    // Per-cycle cache; invalidated in doLayout. Paired *CacheValid flags
    // rather than nullable-as-sentinel — C# transpile doesn't unwrap
    // `T | null` with `!` cleanly. See {@link ScoreSlideLineGlyph}.
    private _slideInCache: SlideSegment | null = null;
    private _slideInCacheValid: boolean = false;
    private _slideOutCache: SlideSegment | null = null;
    private _slideOutCacheValid: boolean = false;

    // the slide line cannot overflow anything and there are ties drawn in here
    public readonly checkForOverflow = false;

    public constructor(inType: SlideInType, outType: SlideOutType, startNote: Note, parent: BeatContainerGlyph) {
        super(0, 0);
        this._inType = inType;
        this._outType = outType;
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

    private _computeSlideIn(): SlideSegment | null {
        if (this._slideInCacheValid) {
            return this._slideInCache;
        }
        const result = this._computeSlideInUncached();
        this._slideInCache = result;
        this._slideInCacheValid = true;
        return result;
    }

    private _computeSlideInUncached(): SlideSegment | null {
        const startNoteRenderer: TabBarRenderer = this.renderer as TabBarRenderer;
        const sizeX: number = this.renderer.smuflMetrics.simpleSlideWidth;
        const sizeY: number = this.renderer.smuflMetrics.simpleSlideHeight;
        let startX: number = 0;
        let startY: number = 0;
        let endX: number = 0;
        let endY: number = 0;
        const offsetX = this.renderer.smuflMetrics.preNoteEffectPadding;
        switch (this._inType) {
            case SlideInType.IntoFromBelow:
                endX = startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Left) - offsetX;
                endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center) - sizeY;
                startX = endX - sizeX;
                startY =
                    startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center) + sizeY;
                break;
            case SlideInType.IntoFromAbove:
                endX = startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Left) - offsetX;
                endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center) + sizeY;
                startX = endX - sizeX;
                startY =
                    startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center) - sizeY;
                break;
            default:
                return null;
        }
        return { startX, startY, endX, endY, waves: false };
    }

    private _computeSlideOut(): SlideSegment | null {
        if (this._slideOutCacheValid) {
            return this._slideOutCache;
        }
        const result = this._computeSlideOutUncached();
        this._slideOutCache = result;
        this._slideOutCacheValid = true;
        return result;
    }

    private _computeSlideOutUncached(): SlideSegment | null {
        const startNoteRenderer: TabBarRenderer = this.renderer as TabBarRenderer;
        const sizeX: number = this.renderer.smuflMetrics.simpleSlideWidth;
        const sizeY: number = this.renderer.smuflMetrics.simpleSlideHeight;
        let startX: number = 0;
        let startY: number = 0;
        let endX: number = 0;
        let endY: number = 0;
        let waves: boolean = false;

        const offsetX = this.renderer.smuflMetrics.postNoteEffectPadding;

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
                        endY = startY;
                    } else {
                        endX =
                            endNoteRenderer.x +
                            endNoteRenderer.getBeatX(this._startNote.slideTarget.beat, BeatXPosition.OnNotes) -
                            offsetX;
                        endY =
                            endNoteRenderer.y +
                            endNoteRenderer.getNoteY(this._startNote.slideTarget, NoteYPosition.Center);
                    }

                    if (this._startNote.slideTarget.fret > this._startNote.fret) {
                        startY += sizeY;
                        endY -= sizeY;
                    } else {
                        startY -= sizeY;
                        endY += sizeY;
                    }
                } else {
                    endX = startNoteRenderer.x + this._parent.x;
                    endY = startY;
                }
                break;
            case SlideOutType.OutUp:
                startX =
                    startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) + offsetX;
                startY =
                    startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center) + sizeY;
                endX = startX + sizeX;
                endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center) - sizeY;
                break;
            case SlideOutType.OutDown:
                startX =
                    startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) + offsetX;
                startY =
                    startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center) - sizeY;
                endX = startX + sizeX;
                endY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center) + sizeY;
                break;
            case SlideOutType.PickSlideDown:
                startX =
                    startNoteRenderer.x +
                    startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) +
                    offsetX * 2;
                startY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endX = startNoteRenderer.x + startNoteRenderer.width;
                endY = startY + sizeY * 3;
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
            case SlideOutType.PickSlideUp:
                startX =
                    startNoteRenderer.x +
                    startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) +
                    offsetX * 2;
                startY = startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endX = startNoteRenderer.x + startNoteRenderer.width;
                endY = startY - sizeY * 3;
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
