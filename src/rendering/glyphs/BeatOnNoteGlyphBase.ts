import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { NoteXPosition, NoteYPosition } from '../BarRendererBase';
import { Note } from '@src/model/Note';
import { BeatBounds } from '../utils/BeatBounds';

export class BeatOnNoteGlyphBase extends BeatGlyphBase {
    public beamingHelper!: BeamingHelper;
    public centerX: number = 0;

    public updateBeamingHelper(): void {
        //
    }

    public buildBoundingsLookup(beatBounds:BeatBounds, cx:number, cy:number) {
        // implemented in subclasses
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        return 0;
    }
    public getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        return 0;
    }
}
