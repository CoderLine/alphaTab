import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import type { NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import type { Note } from '@src/model/Note';
import type { BeatBounds } from '@src/rendering/utils/BeatBounds';

export class BeatOnNoteGlyphBase extends BeatGlyphBase {
    public beamingHelper!: BeamingHelper;
    public centerX: number = 0;

    public updateBeamingHelper(): void {
        //
    }

    public buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        // implemented in subclasses
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        return 0;
    }
    public getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        return 0;
    }
}
