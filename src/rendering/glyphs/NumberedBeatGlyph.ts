import { GraceType } from '@src/model/GraceType';
import { type Note, NoteSubElement } from '@src/model/Note';
import { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import { NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import type { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { NoteBounds } from '@src/rendering/utils/NoteBounds';
import { Bounds } from '@src/rendering/utils/Bounds';
import { NumberedNoteHeadGlyph } from '@src/rendering/glyphs/NumberedNoteHeadGlyph';
import type { NumberedBarRenderer } from '@src/rendering/NumberedBarRenderer';
import { AccidentalHelper } from '@src/rendering/utils/AccidentalHelper';
import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { AccidentalGroupGlyph } from '@src/rendering/glyphs/AccidentalGroupGlyph';
import { AccidentalGlyph } from '@src/rendering/glyphs/AccidentalGlyph';
import { ModelUtils } from '@src/model/ModelUtils';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { CircleGlyph } from '@src/rendering/glyphs/CircleGlyph';
import { NumberedDashGlyph } from '@src/rendering/glyphs/NumberedDashGlyph';
import type { Glyph } from '@src/rendering/glyphs/Glyph';
import { DeadSlappedBeatGlyph } from '@src/rendering/glyphs/DeadSlappedBeatGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { AccidentalType } from '@src/model/AccidentalType';
import { BeatSubElement } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';

export class NumberedBeatPreNotesGlyph extends BeatGlyphBase {
    public isNaturalizeAccidental = false;
    public accidental: AccidentalType = AccidentalType.None;

    protected override get effectElement() {
        return BeatSubElement.NumberedEffects;
    }

    public override doLayout(): void {
        if (!this.container.beat.isRest && !this.container.beat.isEmpty) {
            const accidentals: AccidentalGroupGlyph = new AccidentalGroupGlyph();
            accidentals.renderer = this.renderer;

            if (this.container.beat.notes.length > 0) {
                const note = this.container.beat.notes[0];

                // Notes
                // - Compared to standard notation accidentals:
                //   - Flat keysigs: When there is a naturalize symbol (against key signature, not naturalizing same line) we have a # in Numbered notation
                //   - Flat keysigs: When there is a flat symbol standard notation we also have a flat in Numbered notation
                //   - C keysig: A sharp on standard notation is a sharp on numbered notation
                //   - # keysigs:  When there is a # symbol on standard notation we also a sharp in numbered notation
                //   - # keysigs:  When there is a naturalize symbol (against key signature, not naturalizing same line) we have a flat in Numbered notation

                // Or generally:
                //  - numbered notation has the same accidentals as standard notation if applied
                //  - when the standard notation naturalizes the accidental from the key signature, the numbered notation has the reversed accidental

                const accidentalMode = note ? note.accidentalMode : NoteAccidentalMode.Default;
                const noteValue = AccidentalHelper.getNoteValue(note);
                let accidentalToSet: AccidentalType = AccidentalHelper.computeAccidental(
                    this.renderer.bar.keySignature,
                    accidentalMode,
                    noteValue,
                    note.hasQuarterToneOffset
                );

                if (accidentalToSet === AccidentalType.Natural) {
                    const ks: number = this.renderer.bar.keySignature;
                    const ksi: number = ks + 7;
                    const naturalizeAccidentalForKeySignature: AccidentalType =
                        ksi < 7 ? AccidentalType.Sharp : AccidentalType.Flat;
                    accidentalToSet = naturalizeAccidentalForKeySignature;
                    this.isNaturalizeAccidental = true;
                }

                // do we need an accidental on the note?
                if (accidentalToSet !== AccidentalType.None) {
                    this.accidental = accidentalToSet;
                    const sr: NumberedBarRenderer = this.renderer as NumberedBarRenderer;
                    const color = ElementStyleHelper.noteColor(sr.resources, NoteSubElement.NumberedAccidentals, note);

                    const g = new AccidentalGlyph(
                        0,
                        sr.getLineY(0),
                        accidentalToSet,
                        note.beat.graceType !== GraceType.None
                            ? NoteHeadGlyph.GraceScale * NoteHeadGlyph.GraceScale
                            : NoteHeadGlyph.GraceScale
                    );
                    g.colorOverride = color;
                    g.renderer = this.renderer;
                    accidentals.addGlyph(g);
                    this.addNormal(accidentals);
                    this.addNormal(new SpacingGlyph(0, 0, 4));
                }
            }
        }
        super.doLayout();
    }
}

export class NumberedBeatGlyph extends BeatOnNoteGlyphBase {
    public noteHeads: NumberedNoteHeadGlyph | null = null;
    public deadSlapped: DeadSlappedBeatGlyph | null = null;

    public octaveDots: number = 0;

    protected override get effectElement() {
        return BeatSubElement.NumberedEffects;
    }

    public override getNoteX(_note: Note, requestedPosition: NoteXPosition): number {
        let g: Glyph | null = null;
        if (this.noteHeads) {
            g = this.noteHeads;
        } else if (this.deadSlapped) {
            g = this.deadSlapped;
        }

        if (g) {
            let pos = g.x;
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    break;
                case NoteXPosition.Center:
                    pos += g.width / 2;
                    break;
                case NoteXPosition.Right:
                    pos += g.width;
                    break;
            }
            return pos;
        }
        return 0;
    }

    public override buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        if (this.noteHeads && this.container.beat.notes.length > 0) {
            const noteBounds = new NoteBounds();
            noteBounds.note = this.container.beat.notes[0];
            noteBounds.noteHeadBounds = new Bounds();
            noteBounds.noteHeadBounds.x = cx + this.x + this.noteHeads.x;
            noteBounds.noteHeadBounds.y = cy + this.y + this.noteHeads.y - this.noteHeads.height / 2;
            noteBounds.noteHeadBounds.w = this.width;
            noteBounds.noteHeadBounds.h = this.height;
            beatBounds.addNote(noteBounds);
        }
    }

    public override getNoteY(_note: Note, requestedPosition: NoteYPosition): number {
        let g: Glyph | null = null;
        if (this.noteHeads) {
            g = this.noteHeads;
        } else if (this.deadSlapped) {
            g = this.deadSlapped;
        }

        if (g) {
            let pos = this.y + g.y;

            switch (requestedPosition) {
                case NoteYPosition.Top:
                case NoteYPosition.TopWithStem:
                    pos -= g.height / 2 + 2;
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                case NoteYPosition.BottomWithStem:
                    pos += g.height / 2;
                    break;
            }

            return pos;
        }
        return 0;
    }

    public override updateBeamingHelper(): void {
        if (this.beamingHelper) {
            let g: Glyph | null = null;
            if (this.noteHeads) {
                g = this.noteHeads;
            } else if (this.deadSlapped) {
                g = this.deadSlapped;
            }

            if (g) {
                this.beamingHelper.registerBeatLineX(
                    'numbered',
                    this.container.beat,
                    this.container.x + this.x + g.x,
                    this.container.x + this.x + g.x + g.width
                );
            }
        }
    }

    public static MajorKeySignatureOneValues: Array<number> = [
        // Flats
        59, 66, 61, 68, 63, 58, 65,
        // natural
        60,
        // sharps  (where the value is true, a flat accidental is required for the notes)
        67, 62, 69, 64, 71, 66, 61
    ];

    public static MinorKeySignatureOneValues: Array<number> = [
        // Flats
        71, 66, 73, 68, 63, 70, 65,
        // natural
        72,
        // sharps  (where the value is true, a flat accidental is required for the notes)
        67, 74, 69, 64, 71, 66, 73
    ];

    public override doLayout(): void {
        // create glyphs
        const sr = this.renderer as NumberedBarRenderer;

        if (sr.shortestDuration < this.container.beat.duration) {
            sr.shortestDuration = this.container.beat.duration;
        }

        const glyphY = sr.getLineY(sr.getNoteLine());

        if (!this.container.beat.isEmpty) {
            let numberWithinOctave = '0';
            if (this.container.beat.notes.length > 0) {
                const kst: number = this.renderer.bar.keySignatureType;
                const ks: number = this.renderer.bar.keySignature;
                const ksi: number = ks + 7;

                const oneNoteValues =
                    kst === KeySignatureType.Minor
                        ? NumberedBeatGlyph.MinorKeySignatureOneValues
                        : NumberedBeatGlyph.MajorKeySignatureOneValues;
                const oneNoteValue = oneNoteValues[ksi];

                const note = this.container.beat.notes[0];

                if (note.isDead) {
                    numberWithinOctave = 'X';
                } else {
                    const noteValue = note.displayValue - oneNoteValue;

                    const index = noteValue < 0 ? ((noteValue % 12) + 12) % 12 : noteValue % 12;

                    let dots = noteValue < 0 ? ((Math.abs(noteValue) + 12) / 12) | 0 : (noteValue / 12) | 0;
                    if (noteValue < 0) {
                        dots *= -1;
                    }
                    this.octaveDots = dots;
                    sr.registerOctave(dots);

                    const stepList =
                        ModelUtils.keySignatureIsSharp(ks) || ModelUtils.keySignatureIsNatural(ks)
                            ? AccidentalHelper.FlatNoteSteps
                            : AccidentalHelper.SharpNoteSteps;

                    let steps = stepList[index] + 1;

                    const hasAccidental = AccidentalHelper.AccidentalNotes[index];
                    if (
                        hasAccidental &&
                        !(this.container.preNotes as NumberedBeatPreNotesGlyph).isNaturalizeAccidental
                    ) {
                        if (ksi < 7) {
                            steps++;
                        } else {
                            steps--;
                        }
                    }

                    numberWithinOctave = steps.toString();
                }
            }

            if (this.container.beat.deadSlapped) {
                const deadSlapped = new DeadSlappedBeatGlyph();
                deadSlapped.renderer = this.renderer;
                deadSlapped.doLayout();
                this.deadSlapped = deadSlapped;
                this.addEffect(deadSlapped);
            } else {
                const isGrace: boolean = this.container.beat.graceType !== GraceType.None;
                const noteHeadGlyph = new NumberedNoteHeadGlyph(
                    0,
                    glyphY,
                    numberWithinOctave,
                    isGrace,
                    this.container.beat
                );
                this.noteHeads = noteHeadGlyph;

                this.addNormal(noteHeadGlyph);
            }

            //
            // Note dots
            if (this.container.beat.dots > 0 && this.container.beat.duration >= Duration.Quarter) {
                this.addNormal(new SpacingGlyph(0, 0, 5));
                for (let i: number = 0; i < this.container.beat.dots; i++) {
                    const dot = new CircleGlyph(0, sr.getLineY(0), 1.5);
                    dot.renderer = this.renderer;
                    this.addEffect(dot);
                }
            }

            //
            // Dashes
            let numberOfQuarterNotes = 0;
            switch (this.container.beat.duration) {
                case Duration.QuadrupleWhole:
                    numberOfQuarterNotes = 16;
                    break;
                case Duration.DoubleWhole:
                    numberOfQuarterNotes = 8;
                    break;
                case Duration.Whole:
                    numberOfQuarterNotes = 4;
                    break;
                case Duration.Half:
                    numberOfQuarterNotes = 2;
                    break;
            }

            let numberOfAddedQuarters = numberOfQuarterNotes;
            for (let i = 0; i < this.container.beat.dots; i++) {
                numberOfAddedQuarters = (numberOfAddedQuarters / 2) | 0;
                numberOfQuarterNotes += numberOfAddedQuarters;
            }
            for (let i = 0; i < numberOfQuarterNotes - 1; i++) {
                const dash = new NumberedDashGlyph(0, sr.getLineY(0), this.container.beat);
                dash.renderer = this.renderer;
                this.addNormal(dash);
            }
        }

        super.doLayout();

        if (this.container.beat.isEmpty) {
            this.centerX = this.width / 2;
        } else if (this.noteHeads) {
            this.centerX = this.noteHeads.x + this.noteHeads.width / 2;
        } else if (this.deadSlapped) {
            this.centerX = this.deadSlapped.x + this.deadSlapped.width / 2;
        }
    }
}
