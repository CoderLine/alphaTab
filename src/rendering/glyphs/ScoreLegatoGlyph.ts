import { Beat } from '@src/model/Beat';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NoteHeadGlyph } from './NoteHeadGlyph';

export class ScoreLegatoGlyph extends TieGlyph {
    public constructor(startBeat: Beat, endBeat: Beat, forEnd: boolean = false) {
        super(startBeat, endBeat, forEnd);
    }

    public doLayout(): void {
        super.doLayout();
        this.yOffset = NoteHeadGlyph.NoteHeadHeight / 2;
    }

    protected getBeamDirection(beat: Beat, noteRenderer: BarRendererBase): BeamDirection {
        if (beat.isRest) {
            return BeamDirection.Up;
        }
        // invert direction (if stems go up, ties go down to not cross them)
        switch ((noteRenderer as ScoreBarRenderer).getBeatDirection(beat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }

    protected getStartY(noteRenderer: BarRendererBase, direction: BeamDirection): number {
        if (this.startBeat!.isRest) {
            // below all lines
            return (noteRenderer as ScoreBarRenderer).getScoreY(9, 0);
        }
        switch (direction) {
            case BeamDirection.Up:
                // below lowest note
                return noteRenderer.getNoteY(this.startBeat!.minNote!, false);
            default:
                return noteRenderer.getNoteY(this.startBeat!.maxNote!, false);
        }
    }

    protected getEndY(noteRenderer: BarRendererBase, direction: BeamDirection): number {
        if (this.endBeat!.isRest) {
            switch (direction) {
                case BeamDirection.Up:
                    return (noteRenderer as ScoreBarRenderer).getScoreY(9, 0);
                default:
                    return (noteRenderer as ScoreBarRenderer).getScoreY(0, 0);
            }
        }
        switch (direction) {
            case BeamDirection.Up:
                // below lowest note
                return (noteRenderer as ScoreBarRenderer).getNoteY(this.endBeat!.minNote!, false);
            default:
                return (noteRenderer as ScoreBarRenderer).getNoteY(this.endBeat!.maxNote!, false);
        }
    }

    protected getStartX(noteRenderer: BarRendererBase): number {
        if (this.startBeat!.isRest) {
            return noteRenderer.getBeatX(this.startBeat!, BeatXPosition.PreNotes);
        }
        return noteRenderer.getNoteX(this.startBeat!.minNote!, true);
    }

    protected getEndX(noteRenderer: BarRendererBase): number {
        if (this.endBeat!.isRest) {
            return noteRenderer.getBeatX(this.endBeat!, BeatXPosition.PreNotes);
        }
        return noteRenderer.getNoteX(this.endBeat!.minNote!, false);
    }
}
