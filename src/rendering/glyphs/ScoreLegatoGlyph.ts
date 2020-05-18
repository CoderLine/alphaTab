import { Beat } from '@src/model/Beat';
import { BarRendererBase, NoteYPosition } from '@src/rendering/BarRendererBase';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

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
                return noteRenderer.getNoteY(this.startBeat!.minNote!, NoteYPosition.Center);
            default:
                return noteRenderer.getNoteY(this.startBeat!.maxNote!, NoteYPosition.Center);
        }
    }

    protected getEndY(noteRenderer: BarRendererBase, direction: BeamDirection): number {
        const scoreBarRenderer =  (noteRenderer as ScoreBarRenderer);
        if (this.endBeat!.isRest) {
            switch (direction) {
                case BeamDirection.Up:
                    return scoreBarRenderer.getScoreY(9, 0);
                default:
                    return scoreBarRenderer.getScoreY(0, 0);
            }
        }

        const startBeamDirection = scoreBarRenderer.getBeatDirection(this.startBeat!);
        const endBeamDirection = scoreBarRenderer.getBeatDirection(this.endBeat!);

        if(startBeamDirection !== endBeamDirection && endBeamDirection === direction) {
            switch(direction) {
                case BeamDirection.Up:
                    // stem upper end
                    return scoreBarRenderer.getNoteY(this.endBeat!.minNote!, NoteYPosition.Bottom)
                default:
                    // stem lower end
                    return scoreBarRenderer.getNoteY(this.endBeat!.maxNote!, NoteYPosition.Top);
            }
        }

        switch (direction) {
            case BeamDirection.Up:
                // below lowest note
                return (noteRenderer as ScoreBarRenderer).getNoteY(this.endBeat!.minNote!, NoteYPosition.Bottom);
            default:
                // above highest note
                return (noteRenderer as ScoreBarRenderer).getNoteY(this.endBeat!.maxNote!, NoteYPosition.Top);
        }
    }

    protected getStartX(noteRenderer: BarRendererBase, direction: BeamDirection): number {
        return noteRenderer.getBeatX(this.startBeat!, BeatXPosition.OnNotes);
    }

    protected getEndX(noteRenderer: BarRendererBase, direction: BeamDirection): number {
        return noteRenderer.getBeatX(this.endBeat!, BeatXPosition.OnNotes);
    }
}
