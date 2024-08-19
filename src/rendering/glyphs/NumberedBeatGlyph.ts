import { GraceType } from '@src/model/GraceType';
import { Note } from '@src/model/Note';
import { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import { NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { NoteBounds } from '../utils/NoteBounds';
import { Bounds } from '../utils/Bounds';
import { NumberedNoteHeadGlyph } from './NumberedNoteHeadGlyph';
import { AccidentalType, Duration, KeySignatureType, NoteAccidentalMode } from '@src/model';
import { NumberedBarRenderer } from '../NumberedBarRenderer';
import { AccidentalHelper } from '../utils/AccidentalHelper';
import { BeatGlyphBase } from './BeatGlyphBase';
import { AccidentalGroupGlyph } from './AccidentalGroupGlyph';
import { AccidentalGlyph } from './AccidentalGlyph';
import { ModelUtils } from '@src/model/ModelUtils';
import { NoteHeadGlyph } from './NoteHeadGlyph';
import { SpacingGlyph } from './SpacingGlyph';
import { CircleGlyph } from './CircleGlyph';
import { NumberedDashGlyph } from './NumberedDashGlyph';

export class NumberedBeatPreNotesGlyph extends BeatGlyphBase {
    public isNaturalizeAccidental = false;
    public accidental: AccidentalType = AccidentalType.None;
    
    public override doLayout(): void {
        if (!this.container.beat.isRest && !this.container.beat.isEmpty) {
            let accidentals: AccidentalGroupGlyph = new AccidentalGroupGlyph();
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
                    this.renderer.bar.masterBar.keySignature,
                    accidentalMode,
                    noteValue,
                    note.hasQuarterToneOffset
                );

                if (accidentalToSet == AccidentalType.Natural) {
                    const ks: number = this.renderer.bar.masterBar.keySignature;
                    const ksi: number = ks + 7;
                    const naturalizeAccidentalForKeySignature: AccidentalType =
                        ksi < 7 ? AccidentalType.Sharp : AccidentalType.Flat;
                    accidentalToSet = naturalizeAccidentalForKeySignature;
                    this.isNaturalizeAccidental = true;
                }

                // do we need an accidental on the note?
                if (accidentalToSet !== AccidentalType.None) {
                    this.accidental = accidentalToSet;
                    let sr: NumberedBarRenderer = this.renderer as NumberedBarRenderer;

                    let g = new AccidentalGlyph(
                        0,
                        sr.getLineY(0),
                        accidentalToSet,
                        note.beat.graceType !== GraceType.None
                            ? NoteHeadGlyph.GraceScale * NoteHeadGlyph.GraceScale
                            : NoteHeadGlyph.GraceScale
                    );
                    g.renderer = this.renderer;
                    accidentals.addGlyph(g);
                    this.addGlyph(accidentals);
                    this.addGlyph(new SpacingGlyph(0, 0, 4 * this.scale));
                }
            }
        }
        super.doLayout();
    }
}

export class NumberedBeatGlyph extends BeatOnNoteGlyphBase {
    public noteHeads: NumberedNoteHeadGlyph | null = null;

    public octaveDots:number = 0;

    public override getNoteX(_note: Note, requestedPosition: NoteXPosition): number {
        if (this.noteHeads) {
            let pos = this.noteHeads.x;
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    break;
                case NoteXPosition.Center:
                    pos += this.noteHeads.width / 2;
                    break;
                case NoteXPosition.Right:
                    pos += this.noteHeads.width;
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
        if (this.noteHeads) {
            let pos = this.y + this.noteHeads.y;

            switch (requestedPosition) {
                case NoteYPosition.Top:
                case NoteYPosition.TopWithStem:
                    pos -= this.noteHeads.height / 2 + 2 * this.scale;
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                case NoteYPosition.BottomWithStem:
                    pos += this.noteHeads.height / 2;
                    break;
            }

            return pos;
        }
        return 0;
    }

    public override updateBeamingHelper(): void {
        if (this.beamingHelper && this.noteHeads) {
            this.beamingHelper.registerBeatLineX(
                'numbered',
                this.container.beat,
                this.container.x + this.x + this.noteHeads.x,
                this.container.x + this.x + this.noteHeads.x + this.noteHeads.width
            );
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
        let sr = this.renderer as NumberedBarRenderer;

        if (sr.shortestDuration < this.container.beat.duration) {
            sr.shortestDuration = this.container.beat.duration;
        }

        const glyphY = sr.getLineY(sr.getNoteLine());

        if (!this.container.beat.isEmpty) {
            let numberWithinOctave = '0';
            if (this.container.beat.notes.length > 0) {
                const kst: number = this.renderer.bar.masterBar.keySignatureType;
                const ks: number = this.renderer.bar.masterBar.keySignature;
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
                    let noteValue = note.displayValue - oneNoteValue;

                    let index = noteValue < 0 ? ((noteValue % 12) + 12) % 12 : noteValue % 12;

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

            const isGrace: boolean = this.container.beat.graceType !== GraceType.None;
            const noteHeadGlyph = new NumberedNoteHeadGlyph(
                0,
                glyphY,
                numberWithinOctave,
                isGrace
            );
            this.noteHeads = noteHeadGlyph;

            this.addGlyph(noteHeadGlyph);

            //
            // Note dots
            if (this.container.beat.dots > 0 && this.container.beat.duration >= Duration.Quarter) {
                this.addGlyph(new SpacingGlyph(0, 0, 5 * this.scale));
                for (let i: number = 0; i < this.container.beat.dots; i++) {
                    const dot = new CircleGlyph(0, sr.getLineY(0), 1.5 * this.scale);
                    dot.renderer = this.renderer;
                    this.addGlyph(dot);
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
            for(let i = 0; i < this.container.beat.dots; i++) {
                numberOfAddedQuarters = (numberOfAddedQuarters / 2) | 0
                numberOfQuarterNotes += numberOfAddedQuarters
            }
            for(let i = 0; i < numberOfQuarterNotes - 1; i++) {
                const dash = new NumberedDashGlyph(0, sr.getLineY(0));
                dash.renderer = this.renderer;
                this.addGlyph(dash);
            }

            // TODO(Numbered): Add Dots above and below based on note height
            // TODO(Numbered): Lines and dots for durations
        }

        super.doLayout();

        if (this.container.beat.isEmpty) {
            this.centerX = this.width / 2;
        } else {
            this.centerX = this.noteHeads!.x + this.noteHeads!.width / 2;
        }
    }
}
