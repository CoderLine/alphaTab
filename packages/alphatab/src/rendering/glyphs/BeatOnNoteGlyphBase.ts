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
    public abstract getNoteX(_note: Note, _requestedPosition: NoteXPosition): number;
    public abstract getNoteY(_note: Note, _requestedPosition: NoteYPosition): number;
    public abstract getRestY(_requestedPosition: NoteYPosition): number;
    public abstract getHighestNoteY(): number;
    public abstract getLowestNoteY(): number;
}
