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

    public buildBoundingsLookup(_beatBounds: BeatBounds, _cx: number, _cy: number) {
        // implemented in subclasses
    }

    public getNoteX(_note: Note, _requestedPosition: NoteXPosition): number {
        return 0;
    }
    public getNoteY(_note: Note, _requestedPosition: NoteYPosition): number {
        return 0;
    }

    public getHighestNoteY(): number {
        return 0;
    }

    public getLowestNoteY(): number {
        return 0;
    }
}
