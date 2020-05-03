import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class ScoreTieGlyph extends TieGlyph {
    protected startNote: Note;
    protected endNote: Note;

    public constructor(startNote: Note, endNote: Note, forEnd: boolean = false) {
        super(!startNote ? null : startNote.beat, !endNote ? null : endNote.beat, forEnd);
        this.startNote = startNote;
        this.endNote = endNote;
    }

    public doLayout(): void {
        super.doLayout();
        this.yOffset = NoteHeadGlyph.NoteHeadHeight / 2;
    }

    protected getBeamDirection(beat: Beat, noteRenderer: BarRendererBase): BeamDirection {
        // invert direction (if stems go up, ties go down to not cross them)
        switch ((noteRenderer as ScoreBarRenderer).getBeatDirection(beat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }

    protected getStartY(noteRenderer: BarRendererBase, direction: BeamDirection): number {
        return noteRenderer.getNoteY(this.startNote, false);
    }

    protected getEndY(noteRenderer: BarRendererBase, direction: BeamDirection): number {
        return noteRenderer.getNoteY(this.endNote, false);
    }

    protected getStartX(noteRenderer: BarRendererBase): number {
        return noteRenderer.getBeatX(this.startNote.beat, BeatXPosition.MiddleNotes);
    }

    protected getEndX(noteRenderer: BarRendererBase): number {
        return noteRenderer.getNoteX(this.endNote, false);
    }
}
