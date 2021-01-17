import { AccidentalType } from '@src/model/AccidentalType';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { Note } from '@src/model/Note';
import { WhammyType } from '@src/model/WhammyType';
import { AccidentalGlyph } from '@src/rendering/glyphs/AccidentalGlyph';
import { AccidentalGroupGlyph } from '@src/rendering/glyphs/AccidentalGroupGlyph';
import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { BendNoteHeadGroupGlyph } from '@src/rendering/glyphs/BendNoteHeadGroupGlyph';
import { GhostNoteContainerGlyph } from '@src/rendering/glyphs/GhostNoteContainerGlyph';
import { ScoreBrushGlyph } from '@src/rendering/glyphs/ScoreBrushGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class ScoreBeatPreNotesGlyph extends BeatGlyphBase {
    private _prebends: BendNoteHeadGroupGlyph | null = null;
    public get prebendNoteHeadOffset(): number {
        return this._prebends ? this._prebends.x + this._prebends.noteHeadOffset : 0;
    }

    public accidentals: AccidentalGroupGlyph | null = null;

    public doLayout(): void {
        if (!this.container.beat.isRest) {
            let accidentals: AccidentalGroupGlyph = new AccidentalGroupGlyph();
            let ghost: GhostNoteContainerGlyph = new GhostNoteContainerGlyph(true);
            ghost.renderer = this.renderer;

            this._prebends = new BendNoteHeadGroupGlyph(this.container.beat, true);
            this._prebends.renderer = this.renderer;
            for (let note of this.container.beat.notes) {
                if (note.isVisible) {
                    if (note.hasBend) {
                        switch (note.bendType) {
                            case BendType.PrebendBend:
                            case BendType.Prebend:
                            case BendType.PrebendRelease:
                                this._prebends.addGlyph(
                                    note.displayValue - ((note.bendPoints[0].value / 2) | 0),
                                    false
                                );
                                break;
                        }
                    } else if (note.beat.hasWhammyBar) {
                        switch (note.beat.whammyBarType) {
                            case WhammyType.PrediveDive:
                            case WhammyType.Predive:
                                this._prebends.addGlyph(
                                    note.displayValue - ((note.beat.whammyBarPoints[0].value / 2) | 0),
                                    false
                                );
                                break;
                        }
                    }
                    this.createAccidentalGlyph(note, accidentals);
                    ghost.addParenthesis(note);
                }
            }
            if (!this._prebends.isEmpty) {
                this.addGlyph(this._prebends);
                this.addGlyph(
                    new SpacingGlyph(
                        0,
                        0,
                        4 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1) * this.scale
                    )
                );
            }
            if (this.container.beat.brushType !== BrushType.None) {
                this.addGlyph(new ScoreBrushGlyph(this.container.beat));
                this.addGlyph(new SpacingGlyph(0, 0, 4 * this.scale));
            }
            if (!ghost.isEmpty) {
                this.addGlyph(ghost);
                this.addGlyph(
                    new SpacingGlyph(
                        0,
                        0,
                        4 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1) * this.scale
                    )
                );
            }
            if (!accidentals.isEmpty) {
                this.accidentals = accidentals;
                this.addGlyph(
                    new SpacingGlyph(
                        0,
                        0,
                        2 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1) * this.scale
                    )
                );
                this.addGlyph(accidentals);
                this.addGlyph(
                    new SpacingGlyph(
                        0,
                        0,
                        2 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1) * this.scale
                    )
                );
            }
        }
        super.doLayout();
    }

    private createAccidentalGlyph(n: Note, accidentals: AccidentalGroupGlyph): void {
        let sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        let accidental: AccidentalType = sr.accidentalHelper.applyAccidental(n);
        let noteLine: number = sr.getNoteLine(n);
        let isGrace: boolean = this.container.beat.graceType !== GraceType.None;
        if (accidental !== AccidentalType.None) {
            let g = new AccidentalGlyph(0, sr.getScoreY(noteLine), accidental, isGrace);
            g.renderer = this.renderer;
            accidentals.addGlyph(g);
        }
        if (n.harmonicType !== HarmonicType.None && n.harmonicType !== HarmonicType.Natural) {
            let harmonicFret: number = n.displayValue + n.harmonicPitch;
            accidental = sr.accidentalHelper.applyAccidentalForValue(n.beat, harmonicFret, isGrace, false);
            noteLine = sr.accidentalHelper.getNoteLineForValue(harmonicFret, false);
            let g = new AccidentalGlyph(0, sr.getScoreY(noteLine), accidental, isGrace);
            g.renderer = this.renderer;
            accidentals.addGlyph(g);
        }
    }

    public constructor() {
        super();
    }
}
