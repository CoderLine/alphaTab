import type { Beat } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { type BarRendererBase, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class ScoreLegatoGlyph extends TieGlyph {
    protected startBeat: Beat;
    protected endBeat: Beat;
    protected endBeatRenderer!: BarRendererBase;

    public constructor(slurEffectId: string, startBeat: Beat, endBeat: Beat) {
        super(slurEffectId);
        this.startBeat = startBeat;
        this.endBeat = endBeat;
    }

    public override doLayout(): void {
        this.endBeatRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
            this.renderer.staff.staffId,
            this.endBeat.voice.bar
        )!;
        super.doLayout();
    }

    protected override getEndBeatRenderer(): BarRendererBase {
        return this.endBeatRenderer;
    }

    protected override shouldDrawBendSlur(): boolean {
        return false;
    }

    protected override getTieDirection(): BeamDirection {
        if (this.startBeat.isRest) {
            return BeamDirection.Up;
        }
        // invert direction (if stems go up, ties go down to not cross them)
        switch (this.renderer.getBeatDirection(this.startBeat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }

    protected override getStartX(): number {
        return this.renderer.x + this.renderer!.getBeatX(this.startBeat!, BeatXPosition.MiddleNotes);
    }

    protected override getStartY(): number {
        if (this.startBeat!.isRest) {
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    return (
                        this.renderer.y + this.renderer.getBeatContainer(this.startBeat)!.onNotes.getBoundingBoxTop()
                    );
                default:
                    return (
                        this.renderer.y + this.renderer.getBeatContainer(this.startBeat)!.onNotes.getBoundingBoxBottom()
                    );
            }
        }

        switch (this.tieDirection) {
            case BeamDirection.Up:
                // below lowest note
                return this.renderer.y + this.renderer!.getNoteY(this.startBeat!.maxNote!, NoteYPosition.Top);
            default:
                return this.renderer.y + this.renderer!.getNoteY(this.startBeat!.minNote!, NoteYPosition.Bottom);
        }
    }

    protected override getEndX(): number {
        const endBeamDirection = this.endBeatRenderer.getBeatDirection(this.endBeat);
        return (
            this.endBeatRenderer.x +
            this.endBeatRenderer.getBeatX(
                this.endBeat,
                this.endBeat.duration > Duration.Whole && endBeamDirection === this.tieDirection
                    ? BeatXPosition.Stem
                    : BeatXPosition.MiddleNotes
            )
        );
    }

    protected override getEndY(): number {
        const endBeatRenderer = this.endBeatRenderer;
        if (this.endBeat.isRest) {
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    return (
                        endBeatRenderer.y + endBeatRenderer.getBeatContainer(this.endBeat)!.onNotes.getBoundingBoxTop()
                    );
                default:
                    return (
                        endBeatRenderer.y +
                        endBeatRenderer.getBeatContainer(this.endBeat)!.onNotes.getBoundingBoxBottom()
                    );
            }
        }

        const startBeamDirection = this.renderer.getBeatDirection(this.startBeat!);
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
