import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { AccidentalGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGlyph';
import { AccidentalGroupGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGroupGlyph';
import { AugmentationDotGlyph } from '@coderline/alphatab/rendering/glyphs/AugmentationDotGlyph';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import { BeatOnNoteGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatOnNoteGlyphBase';
import { DeadSlappedBeatGlyph } from '@coderline/alphatab/rendering/glyphs/DeadSlappedBeatGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NumberedNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedNoteHeadGlyph';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import type { NumberedBarRenderer } from '@coderline/alphatab/rendering/NumberedBarRenderer';
import type { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { NoteBounds } from '@coderline/alphatab/rendering/utils/NoteBounds';

/**
 * @internal
 */
export class NumberedBeatPreNotesGlyph extends BeatGlyphBase {
    public accidental: AccidentalType = AccidentalType.None;

    public skipLayout = false;

    protected override get effectElement() {
        return BeatSubElement.NumberedEffects;
    }

    public override doLayout(): void {
        if (this.skipLayout) {
            return;
        }
        if (!this.container.beat.isRest && !this.container.beat.isEmpty) {
            const accidentals: AccidentalGroupGlyph = new AccidentalGroupGlyph();
            accidentals.renderer = this.renderer;

            if (this.container.beat.notes.length > 0) {
                const note = this.container.beat.notes[0];

                const spelling = ModelUtils.resolveSpelling(
                    this.renderer.bar.keySignature,
                    note.displayValue,
                    note.accidentalMode
                );

                const ksOffset = ModelUtils.getKeySignatureAccidentalOffset(
                    this.renderer.bar.keySignature,
                    spelling.degree
                );
                const requiredOffset = spelling.accidentalOffset - ksOffset;

                let accidentalToSet: AccidentalType = AccidentalType.None;
                if (note.accidentalMode !== NoteAccidentalMode.ForceNone) {
                    if (note.hasQuarterToneOffset) {
                        if (requiredOffset > 0) {
                            accidentalToSet = AccidentalType.SharpQuarterNoteUp;
                        } else if (requiredOffset < 0) {
                            accidentalToSet = AccidentalType.FlatQuarterNoteUp;
                        } else {
                            accidentalToSet = AccidentalType.NaturalQuarterNoteUp;
                        }
                    } else if (requiredOffset !== 0) {
                        accidentalToSet = ModelUtils.accidentalOffsetToType(requiredOffset);
                    }
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
                            ? EngravingSettings.GraceScale * EngravingSettings.GraceScale
                            : EngravingSettings.GraceScale
                    );
                    g.colorOverride = color;
                    g.renderer = this.renderer;
                    accidentals.addGlyph(g);
                    this.addNormal(accidentals);
                    this.addNormal(new SpacingGlyph(0, 0, this.renderer.smuflMetrics.preNoteEffectPadding));
                }
            }
        }
        super.doLayout();
    }
}

/**
 * @internal
 */
export class NumberedBeatGlyph extends BeatOnNoteGlyphBase {
    public noteHeads: NumberedNoteHeadGlyph | null = null;
    public deadSlapped: DeadSlappedBeatGlyph | null = null;

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

    public override getLowestNoteY(requestedPosition: NoteYPosition): number {
        return this._internalGetNoteY(requestedPosition);
    }

    public override getHighestNoteY(requestedPosition: NoteYPosition): number {
        return this._internalGetNoteY(requestedPosition);
    }

    public override getNoteY(_note: Note, requestedPosition: NoteYPosition): number {
        return this._internalGetNoteY(requestedPosition);
    }

    public override getRestY(requestedPosition: NoteYPosition): number {
        return this._internalGetNoteY(requestedPosition);
    }

    private _internalGetNoteY(requestedPosition: NoteYPosition): number {
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
                    pos -= g.height / 2;
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                case NoteYPosition.BottomWithStem:
                    pos += g.height / 2;
                    break;

                case NoteYPosition.StemUp:
                case NoteYPosition.StemDown:
                    break;
            }

            return pos;
        }
        return 0;
    }

    private static readonly _majorKeySignatureOneValues: Array<number> = [
        // Flats: Cb, Gb, Db, Ab, Eb, Bb, F
        59, 66, 61, 68, 63, 70, 65,
        // natural: C
        60,
        // sharps: G, D, A, E, B, F#, C#
        67, 62, 69, 64, 71, 66, 61
    ];

    private static readonly _minorKeySignatureOneValues: Array<number> = [
        // Flats: Ab, Eb, Bb, F, C, G, D
        68, 63, 70, 65, 60, 67, 62,
        // natural: A
        69,
        // sharps: E, B, F#, C#, G#, D#, A#
        64, 71, 66, 61, 68, 63, 70
    ];

    public override doLayout(): void {
        // create glyphs
        const sr = this.renderer as NumberedBarRenderer;

        if (sr.shortestDuration < this.container.beat.duration) {
            sr.shortestDuration = this.container.beat.duration;
        }

        let octaveDots = 0;

        if (!this.container.beat.isEmpty) {
            const glyphY = sr.getLineY(0);
            let numberWithinOctave = '0';
            if (this.container.beat.notes.length > 0) {
                const note = this.container.beat.notes[0];
                if (note.isDead) {
                    numberWithinOctave = 'X';
                } else {
                    const ks = this.renderer.bar.keySignature;
                    const kst = this.renderer.bar.keySignatureType;
                    const ksi = (ks as number) + 7;

                    const oneNoteValues =
                        kst === KeySignatureType.Minor
                            ? NumberedBeatGlyph._minorKeySignatureOneValues
                            : NumberedBeatGlyph._majorKeySignatureOneValues;

                    const oneNoteValue = oneNoteValues[ksi];

                    const spelling = ModelUtils.resolveSpelling(ks, note.displayValue, note.accidentalMode);

                    const tonicDegree = ModelUtils.getKeySignatureTonicDegree(ks, kst);

                    const effectiveTonic =
                        kst === KeySignatureType.Minor
                            ? (tonicDegree + 2) % 7 // relative major
                            : tonicDegree;

                    const degreeDistance = (spelling.degree - effectiveTonic + 7) % 7;
                    numberWithinOctave = (degreeDistance + 1).toString();

                    const noteValue = note.displayValue - oneNoteValue;
                    octaveDots = Math.floor(noteValue / 12);
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
                    this.container.beat,
                    octaveDots
                );
                this.noteHeads = noteHeadGlyph;

                this.addNormal(noteHeadGlyph);
            }

            //
            // Note dots
            if (this.container.beat.dots > 0 && this.container.beat.duration >= Duration.Quarter) {
                for (let i: number = 0; i < this.container.beat.dots; i++) {
                    const dot = new AugmentationDotGlyph(0, glyphY);
                    dot.renderer = this.renderer;
                    this.addEffect(dot);
                }
            }
        }

        super.doLayout();

        if (this.container.beat.isEmpty) {
            this.onTimeX = this.width / 2;
        } else if (this.noteHeads) {
            this.onTimeX = this.noteHeads.x + this.noteHeads.width / 2;
        } else if (this.deadSlapped) {
            this.onTimeX = this.deadSlapped.x + this.deadSlapped.width / 2;
        }
        this.middleX = this.onTimeX;
        this.stemX = this.middleX;
    }
}
