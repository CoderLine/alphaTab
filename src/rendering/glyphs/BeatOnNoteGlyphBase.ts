import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';

export class BeatOnNoteGlyphBase extends BeatGlyphBase {
    public beamingHelper!: BeamingHelper;
    public centerX: number = 0;

    public updateBeamingHelper(): void {
        //
    }
}
