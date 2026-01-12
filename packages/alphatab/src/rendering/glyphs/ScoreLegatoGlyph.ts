import type { Beat } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class ScoreLegatoGlyph extends TieGlyph {
    protected startBeat: Beat;
    protected endBeat: Beat;
    protected startBeatRenderer: LineBarRenderer | null = null;
    protected endBeatRenderer: LineBarRenderer | null = null;

    public constructor(slurEffectId: string, startBeat: Beat, endBeat: Beat, forEnd: boolean) {
        super(slurEffectId, forEnd);
        this.startBeat = startBeat;
        this.endBeat = endBeat;
    }

    public override doLayout(): void {
        super.doLayout();
    }

    protected override lookupStartBeatRenderer(): LineBarRenderer {
        if (!this.startBeatRenderer) {
            this.startBeatRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                this.renderer.staff!.staffId,
                this.startBeat.voice.bar
            )! as LineBarRenderer;
        }
        return this.startBeatRenderer;
    }

    protected override lookupEndBeatRenderer(): LineBarRenderer | null {
        if (!this.endBeatRenderer) {
            this.endBeatRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                this.renderer.staff!.staffId,
                this.endBeat.voice.bar
            ) as LineBarRenderer | null;
        }
        return this.endBeatRenderer;
    }

    protected override shouldDrawBendSlur(): boolean {
        return false;
    }

    protected override calculateTieDirection(): BeamDirection {
        if (this.startBeat.isRest) {
            return BeamDirection.Up;
        }
        // invert direction (if stems go up, ties go down to not cross them)
        switch (this.lookupStartBeatRenderer().getBeatDirection(this.startBeat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }

    protected override calculateStartX(): number {
        const startBeatRenderer = this.lookupStartBeatRenderer();
        return startBeatRenderer.x + startBeatRenderer.getBeatX(this.startBeat!, BeatXPosition.MiddleNotes);
    }

    protected override calculateStartY(): number {
        const startBeatRenderer = this.lookupStartBeatRenderer();
        if (this.startBeat!.isRest) {
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    return startBeatRenderer.y + startBeatRenderer.getRestY(this.startBeat, NoteYPosition.Top);
                default:
                    return startBeatRenderer.y + startBeatRenderer.getRestY(this.startBeat, NoteYPosition.Bottom);
            }
        }

        switch (this.tieDirection) {
            case BeamDirection.Up:
                // below lowest note
                return startBeatRenderer.y + startBeatRenderer.getNoteY(this.startBeat!.maxNote!, NoteYPosition.Top);
            default:
                return startBeatRenderer.y + startBeatRenderer.getNoteY(this.startBeat!.minNote!, NoteYPosition.Bottom);
        }
    }

    protected override calculateEndX(): number {
        const endBeatRenderer = this.lookupEndBeatRenderer();
        if (!endBeatRenderer) {
            return this.calculateStartX() + this.renderer.smuflMetrics.leftHandTabTieWidth;
        }
        const endBeamDirection = endBeatRenderer.getBeatDirection(this.endBeat);
        return (
            endBeatRenderer.x +
            endBeatRenderer.getBeatX(
                this.endBeat,
                this.endBeat.duration > Duration.Whole && endBeamDirection === this.tieDirection
                    ? BeatXPosition.Stem
                    : BeatXPosition.MiddleNotes
            )
        );
    }

    protected override caclculateEndY(): number {
        const endBeatRenderer = this.lookupEndBeatRenderer();
        if (!endBeatRenderer) {
            return this.calculateStartY();
        }

        if (this.endBeat.isRest) {
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    return endBeatRenderer.y + endBeatRenderer.getRestY(this.endBeat, NoteYPosition.Top);
                default:
                    return endBeatRenderer.y + endBeatRenderer.getRestY(this.endBeat, NoteYPosition.Bottom);
            }
        }

        const startBeamDirection = this.lookupStartBeatRenderer().getBeatDirection(this.startBeat!);
        const endBeamDirection = endBeatRenderer.getBeatDirection(this.endBeat!);

        if (startBeamDirection !== endBeamDirection && this.startBeat!.graceType === GraceType.None) {
            if (endBeamDirection === this.tieDirection) {
                switch (this.tieDirection) {
                    case BeamDirection.Up:
                        // stem upper end
                        return (
                            endBeatRenderer.y +
                            endBeatRenderer.getNoteY(this.endBeat!.maxNote!, NoteYPosition.TopWithStem)
                        );
                    default:
                        // stem lower end
                        return (
                            endBeatRenderer.y +
                            endBeatRenderer.getNoteY(this.endBeat!.minNote!, NoteYPosition.BottomWithStem)
                        );
                }
            }
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    // stem upper end
                    return (
                        endBeatRenderer.y +
                        endBeatRenderer.getNoteY(this.endBeat!.maxNote!, NoteYPosition.BottomWithStem)
                    );
                default:
                    // stem lower end
                    return (
                        endBeatRenderer.y + endBeatRenderer.getNoteY(this.endBeat!.minNote!, NoteYPosition.TopWithStem)
                    );
            }
        }

        switch (this.tieDirection) {
            case BeamDirection.Up:
                // below lowest note
                return endBeatRenderer.y + endBeatRenderer.getNoteY(this.endBeat!.maxNote!, NoteYPosition.Top);
            default:
                // above highest note
                return endBeatRenderer.y + endBeatRenderer.getNoteY(this.endBeat!.minNote!, NoteYPosition.Bottom);
        }
    }
}
