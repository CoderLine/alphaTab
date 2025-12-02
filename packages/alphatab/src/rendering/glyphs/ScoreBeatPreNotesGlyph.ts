import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { BendType } from '@coderline/alphatab/model/BendType';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import { WhammyType } from '@coderline/alphatab/model/WhammyType';
import { AccidentalGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGlyph';
import { AccidentalGroupGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGroupGlyph';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import { BendNoteHeadGroupGlyph } from '@coderline/alphatab/rendering/glyphs/BendNoteHeadGroupGlyph';
import { GhostNoteContainerGlyph } from '@coderline/alphatab/rendering/glyphs/GhostNoteContainerGlyph';
import { ScoreBrushGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreBrushGlyph';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import { FingeringGroupGlyph } from '@coderline/alphatab/rendering/glyphs/FingeringGroupGlyph';
import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { SlideInType } from '@coderline/alphatab/model/SlideInType';

/**
 * @internal
 */
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

            let hasSimpleSlideIn = false;

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
                    this._createAccidentalGlyph(note, accidentals);
                    ghost.addParenthesis(note);
                    fingering.addFingers(note);

                    switch (note.slideInType) {
                        case SlideInType.IntoFromBelow:
                        case SlideInType.IntoFromAbove:
                            hasSimpleSlideIn = true;
                            break;
                    }
                }
            }

            if (hasSimpleSlideIn) {
                this.addNormal(
                    new SpacingGlyph(
                        0,
                        0,
                        this.renderer.smuflMetrics.simpleSlideWidth *
                            (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                    )
                );
            }

            if (!preBends.isEmpty) {
                this.addEffect(preBends);
                this.addNormal(
                    new SpacingGlyph(
                        0,
                        0,
                        this.renderer.smuflMetrics.preNoteEffectPadding *
                            (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                    )
                );
            }
            if (this.container.beat.brushType !== BrushType.None) {
                this.addEffect(new ScoreBrushGlyph(this.container.beat));
                this.addNormal(
                    new SpacingGlyph(
                        0,
                        0,
                        this.renderer.smuflMetrics.preNoteEffectPadding *
                            (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                    )
                );
            }
            if (!fingering.isEmpty) {
                if (!this.isEmpty) {
                    this.addNormal(
                        new SpacingGlyph(
                            0,
                            0,
                            this.renderer.smuflMetrics.preNoteEffectPadding *
                                (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                        )
                    );
                }

                this.addEffect(fingering);
                this.addNormal(
                    new SpacingGlyph(
                        0,
                        0,
                        this.renderer.smuflMetrics.preNoteEffectPadding *
                            (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                    )
                );
            }

            if (!ghost.isEmpty) {
                this.addEffect(ghost);
            }
            if (!accidentals.isEmpty) {
                this.accidentals = accidentals;
                if (!this.isEmpty) {
                    this.addNormal(
                        new SpacingGlyph(
                            0,
                            0,
                            this.renderer.smuflMetrics.preNoteEffectPadding *
                                (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                        )
                    );
                }

                this.addNormal(accidentals);
                this.addNormal(
                    new SpacingGlyph(
                        0,
                        0,
                        this.renderer.smuflMetrics.preNoteEffectPadding *
                            (this.container.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1)
                    )
                );
            }
        }
        super.doLayout();
    }

    private _createAccidentalGlyph(n: Note, accidentals: AccidentalGroupGlyph): void {
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
