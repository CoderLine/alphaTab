import { AccidentalType } from '@src/model/AccidentalType';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { type Note, NoteSubElement } from '@src/model/Note';
import { WhammyType } from '@src/model/WhammyType';
import { AccidentalGlyph } from '@src/rendering/glyphs/AccidentalGlyph';
import { AccidentalGroupGlyph } from '@src/rendering/glyphs/AccidentalGroupGlyph';
import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { BendNoteHeadGroupGlyph } from '@src/rendering/glyphs/BendNoteHeadGroupGlyph';
import { GhostNoteContainerGlyph } from '@src/rendering/glyphs/GhostNoteContainerGlyph';
import { ScoreBrushGlyph } from '@src/rendering/glyphs/ScoreBrushGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { FingeringGroupGlyph } from '@src/rendering/glyphs/FingeringGroupGlyph';
import { BeatSubElement } from '@src/model/Beat';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

export class ScoreBeatPreNotesGlyph extends BeatGlyphBase {
    private _prebends: BendNoteHeadGroupGlyph | null = null;
    public get prebendNoteHeadOffset(): number {
        return this._prebends ? this._prebends.x + this._prebends.noteHeadOffset : 0;
    }

    protected override get effectElement() {
        return BeatSubElement.StandardNotationEffects;
    }

    public accidentals: AccidentalGroupGlyph | null = null;

    public override doLayout(): void {
        if (!this.container.beat.isRest) {
            const accidentals: AccidentalGroupGlyph = new AccidentalGroupGlyph();
            accidentals.renderer = this.renderer;

            const fingering: FingeringGroupGlyph = new FingeringGroupGlyph();
            fingering.renderer = this.renderer;

            const ghost: GhostNoteContainerGlyph = new GhostNoteContainerGlyph(true);
            ghost.renderer = this.renderer;

            const preBends = new BendNoteHeadGroupGlyph(this.container.beat, true);
            this._prebends = preBends;
            preBends.renderer = this.renderer;
            for (const note of this.container.beat.notes) {
                const color = ElementStyleHelper.noteColor(
                    this.renderer.resources,
                    NoteSubElement.StandardNotationEffects,
                    note
                );
                if (note.isVisible) {
                    if (note.hasBend) {
                        switch (note.bendType) {
                            case BendType.PrebendBend:
                            case BendType.Prebend:
                            case BendType.PrebendRelease:
                                preBends.addGlyph(
                                    note.displayValue - ((note.bendPoints![0].value / 2) | 0),
                                    false,
                                    color
                                );
                                break;
                        }
                    } else if (note.beat.hasWhammyBar) {
                        switch (note.beat.whammyBarType) {
                            case WhammyType.PrediveDive:
                            case WhammyType.Predive:
                                this._prebends.addGlyph(
                                    note.displayValue - ((note.beat.whammyBarPoints![0].value / 2) | 0),
                                    false,
                                    color
                                );
                                break;
                        }
                    }
                    this.createAccidentalGlyph(note, accidentals);
                    ghost.addParenthesis(note);
                    fingering.addFingers(note);
                }
            }
            if (!preBends.isEmpty) {
                this.addEffect(preBends);
                this.addNormal(
                    new SpacingGlyph(
                        0,
                        0,
                        4 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                    )
                );
            }
            if (this.container.beat.brushType !== BrushType.None) {
                this.addEffect(new ScoreBrushGlyph(this.container.beat));
                this.addNormal(new SpacingGlyph(0, 0, 4));
            }
            if (!fingering.isEmpty) {
                if (!this.isEmpty) {
                    this.addNormal(
                        new SpacingGlyph(
                            0,
                            0,
                            2 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                        )
                    );
                }

                this.addEffect(fingering);
                this.addNormal(
                    new SpacingGlyph(
                        0,
                        0,
                        2 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                    )
                );
            }

            if (!ghost.isEmpty) {
                this.addEffect(ghost);
                this.addNormal(
                    new SpacingGlyph(
                        0,
                        0,
                        4 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                    )
                );
            }
            if (!accidentals.isEmpty) {
                this.accidentals = accidentals;
                if (!this.isEmpty) {
                    this.addNormal(
                        new SpacingGlyph(
                            0,
                            0,
                            2 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                        )
                    );
                }

                this.addNormal(accidentals);
                this.addNormal(
                    new SpacingGlyph(
                        0,
                        0,
                        2 * (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                    )
                );
            }
        }
        super.doLayout();
    }

    private createAccidentalGlyph(n: Note, accidentals: AccidentalGroupGlyph): void {
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        let accidental: AccidentalType = sr.accidentalHelper.applyAccidental(n);
        let noteLine: number = sr.getNoteLine(n);
        const isGrace: boolean = this.container.beat.graceType !== GraceType.None;
        const color = ElementStyleHelper.noteColor(sr.resources, NoteSubElement.StandardNotationAccidentals, n);
        const graceScale = isGrace ? NoteHeadGlyph.GraceScale : 1;
        if (accidental !== AccidentalType.None) {
            const g = new AccidentalGlyph(0, sr.getScoreY(noteLine), accidental, graceScale);
            g.colorOverride = color;
            g.renderer = this.renderer;
            accidentals.addGlyph(g);
        }
        if (n.harmonicType !== HarmonicType.None && n.harmonicType !== HarmonicType.Natural) {
            const harmonicFret: number = n.displayValue + n.harmonicPitch;
            accidental = sr.accidentalHelper.applyAccidentalForValue(n.beat, harmonicFret, isGrace, false);
            noteLine = sr.accidentalHelper.getNoteLineForValue(harmonicFret, false);
            const g = new AccidentalGlyph(0, sr.getScoreY(noteLine), accidental, graceScale);
            g.colorOverride = color;
            g.renderer = this.renderer;
            accidentals.addGlyph(g);
        }
    }
}
