import type { Note } from '@coderline/alphatab/model/Note';
import type { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import type { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';

/**
 * @internal
 */
export abstract class BeatOnNoteGlyphBase extends BeatGlyphBase {
    public onTimeX: number = 0;
    public middleX: number = 0;
    public stemX: number = 0;

    public abstract buildBoundingsLookup(_beatBounds: BeatBounds, _cx: number, _cy: number): void;
    public abstract getNoteX(note: Note, requestedPosition: NoteXPosition): number;
    public abstract getNoteY(note: Note, requestedPosition: NoteYPosition): number;
    public abstract getRestY(requestedPosition: NoteYPosition): number;
    public abstract getHighestNoteY(requestedPosition: NoteYPosition): number;
    public abstract getLowestNoteY(requestedPosition: NoteYPosition): number;
}
