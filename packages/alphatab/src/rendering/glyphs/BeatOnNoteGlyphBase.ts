import { Duration } from '@coderline/alphatab/model/Duration';
import type { Note } from '@coderline/alphatab/model/Note';
import { type NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
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

    /**
     * Resolves the requested position on the given rest glyph.
     * Rests have no stems, positions with stems reserve the space of a quarter note stem (e.g. for beams passing by).
     */
    protected getRestGlyphY(g: Glyph | null, requestedPosition: NoteYPosition): number {
        if (!g) {
            return 0;
        }
        switch (requestedPosition) {
            case NoteYPosition.TopWithStem:
                return g.getBoundingBoxTop() - this.renderer.smuflMetrics.getStemLength(Duration.Quarter, true);
            case NoteYPosition.Top:
                return g.getBoundingBoxTop();
            case NoteYPosition.Bottom:
                return g.getBoundingBoxBottom();
            case NoteYPosition.BottomWithStem:
                return g.getBoundingBoxBottom() + this.renderer.smuflMetrics.getStemLength(Duration.Quarter, true);
        }
        // center and stem positions
        return g.getBoundingBoxTop() + g.height / 2;
    }
}
