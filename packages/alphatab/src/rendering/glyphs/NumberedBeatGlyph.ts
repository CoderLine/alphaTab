import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import type { Bar } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import type { SpelledPitch } from '@coderline/alphatab/model/SpelledPitch';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { AccidentalGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGlyph';
import { AccidentalGroupGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGroupGlyph';
import { AugmentationDotGlyph } from '@coderline/alphatab/rendering/glyphs/AugmentationDotGlyph';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import { BeatOnNoteGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatOnNoteGlyphBase';
import { DeadSlappedBeatGlyph } from '@coderline/alphatab/rendering/glyphs/DeadSlappedBeatGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import { NumberedNoteChordGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedNoteChordGlyph';
import { NumberedNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedNoteHeadGlyph';
import type { NumberedBarRenderer } from '@coderline/alphatab/rendering/NumberedBarRenderer';
import type { NumberedBeatContainerGlyph } from '@coderline/alphatab/rendering/NumberedBeatContainerGlyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import type { IBoundsLookupWriter } from '@coderline/alphatab/rendering/utils/IBoundsLookupWriter';

/**
 * @internal
 */
export class NumberedBeatPreNotesGlyph extends BeatGlyphBase {
    public skipLayout = false;

    protected override get effectElement() {
        return BeatSubElement.NumberedEffects;
    }

    public override doLayout(): void {
        if (this.skipLayout) {
            return;
        }
        this.beginPlacement();
        const beat = this.container.beat;
        if (beat.isRest || beat.isEmpty || beat.notes.length === 0) {
            return;
        }

        const onNotes = this.container.onNotes as NumberedBeatGlyph;
        const chord = onNotes.chord;
        let accidentals: AccidentalGroupGlyph | null = null;
        if (chord) {
            for (const head of chord.heads) {
                accidentals = this._addAccidental(accidentals, head, chord.y + head.y);
            }
        } else if (onNotes.noteHead?.note) {
            accidentals = this._addAccidental(accidentals, onNotes.noteHead, onNotes.noteHead.y);
        }

        if (accidentals) {
            this.placeNormal(accidentals);
            this.placeSpacing(this.renderer.smuflMetrics.preNoteEffectPadding);
        }
    }

    private _addAccidental(
        accidentals: AccidentalGroupGlyph | null,
        head: NumberedNoteHeadGlyph,
        y: number
    ): AccidentalGroupGlyph | null {
        if (head.accidentalType === AccidentalType.None) {
            return accidentals;
        }

        if (!accidentals) {
            accidentals = new AccidentalGroupGlyph();
            accidentals.renderer = this.renderer;
        }

        const note = head.note!;
        const g = new AccidentalGlyph(
            0,
            y,
            head.accidentalType,
            note.beat.graceType !== GraceType.None
                ? EngravingSettings.GraceScale * EngravingSettings.GraceScale
                : EngravingSettings.GraceScale
        );
        g.colorOverride = ElementStyleHelper.noteColor(
            this.renderer.resources,
            NoteSubElement.NumberedAccidentals,
            note
        );
        g.renderer = this.renderer;
        accidentals.addGlyph(g);
        head.accidental = g;
        return accidentals;
    }
}

/**
 * @internal
 */
export class NumberedBeatGlyph extends BeatOnNoteGlyphBase {
    /**
     * The number of a rest or of a beat with a single (visible) note.
     */
    public noteHead: NumberedNoteHeadGlyph | null = null;

    /**
     * The stacked numbers of a beat with multiple visible notes.
     */
    public chord: NumberedNoteChordGlyph | null = null;

    public deadSlapped: DeadSlappedBeatGlyph | null = null;

    /**
     * Moves the numbers with their accidentals and augmentation dots to the current slots of the renderer.
     */
    public updateVerticalPositions(): void {
        const beat = this.container.beat;
        if (beat.isEmpty) {
            return;
        }
        const sr = this.renderer as NumberedBarRenderer;
        const glyphY = sr.getVoiceLineY(beat.voice.index);
        const deadSlapped = this.deadSlapped;
        if (deadSlapped) {
            deadSlapped.y = glyphY - sr.getLineY(0);
        }
        const chord = this.chord;
        if (chord) {
            chord.y = glyphY;
            chord.placeHeads();
            for (const head of chord.heads) {
                head.updateAttachedY(chord.y);
            }
            return;
        }
        const noteHead = this.noteHead;
        if (noteHead) {
            noteHead.y = glyphY;
            noteHead.updateAttachedY(0);
        }
        // the dots of a beat without chord sit on the line of its row
        const glyphs = this.glyphs;
        if (glyphs) {
            for (const g of glyphs) {
                if (g instanceof AugmentationDotGlyph) {
                    g.y = glyphY;
                }
            }
        }
    }

    protected override get effectElement() {
        return BeatSubElement.NumberedEffects;
    }

    private get _mainGlyph(): Glyph | null {
        if (this.chord) {
            return this.chord;
        }
        if (this.noteHead) {
            return this.noteHead;
        }
        return this.deadSlapped;
    }

    public override getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        const chord = this.chord;
        let g: Glyph | null = null;
        let x = 0;
        if (chord) {
            const head = chord.getHead(note);
            if (head) {
                g = head;
                x = chord.x;
            } else {
                g = chord;
            }
        } else {
            g = this._mainGlyph;
        }

        if (g) {
            let pos = x + g.x;
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

    public override buildBoundingsLookup(writer: IBoundsLookupWriter, cx: number, cy: number) {
        const scale = this.renderer.settings.display.scale;
        const chord = this.chord;
        if (chord) {
            for (const head of chord.heads) {
                writer.addNote(
                    head.note!,
                    (cx + this.x + chord.x + head.x) * scale,
                    (cy + this.y + chord.y + head.y - head.height / 2) * scale,
                    head.width * scale,
                    head.height * scale
                );
            }
        } else if (this.noteHead?.note) {
            writer.addNote(
                this.noteHead.note,
                (cx + this.x + this.noteHead.x) * scale,
                (cy + this.y + this.noteHead.y - this.noteHead.height / 2) * scale,
                this.width * scale,
                this.height * scale
            );
        }
    }

    public override getLowestNoteY(requestedPosition: NoteYPosition): number {
        const chord = this.chord;
        if (chord) {
            return NumberedBeatGlyph._getHeadY(this.y + chord.y, chord.lowestHead, requestedPosition);
        }
        return this._getMainY(requestedPosition);
    }

    public override getHighestNoteY(requestedPosition: NoteYPosition): number {
        const chord = this.chord;
        if (chord) {
            return NumberedBeatGlyph._getHeadY(this.y + chord.y, chord.highestHead, requestedPosition);
        }
        return this._getMainY(requestedPosition);
    }

    public override getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        const chord = this.chord;
        if (chord) {
            const head = chord.getHead(note);
            if (head) {
                return NumberedBeatGlyph._getHeadY(this.y + chord.y, head, requestedPosition);
            }
        }
        return this._getMainY(requestedPosition);
    }

    public override getRestY(requestedPosition: NoteYPosition): number {
        return this._getMainY(requestedPosition);
    }

    private _getMainY(requestedPosition: NoteYPosition): number {
        let g: Glyph | null = this.deadSlapped;
        if (this.chord) {
            g = this.chord.lowestHead;
        } else if (this.noteHead) {
            g = this.noteHead;
        }
        if (!g) {
            return 0;
        }
        return NumberedBeatGlyph._getHeadY(this.chord ? this.y + this.chord.y : this.y, g, requestedPosition);
    }

    private static _getHeadY(offsetY: number, g: Glyph, requestedPosition: NoteYPosition): number {
        let pos = offsetY + g.y;

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

    /**
     * The octave of the note relative to the "1" of the bar's key: positive values are dots above
     * the number, negative values dots below.
     */
    private static _getOctave(bar: Bar, note: Note): number {
        const oneNoteValues =
            bar.keySignatureType === KeySignatureType.Minor
                ? NumberedBeatGlyph._minorKeySignatureOneValues
                : NumberedBeatGlyph._majorKeySignatureOneValues;
        const oneNoteValue = oneNoteValues[(bar.keySignature as number) + 7];
        return Math.floor((note.displayValue - oneNoteValue) / 12);
    }

    /**
     * Creates the numbers of the beat; the renderer reads the slots they need before the layout.
     */
    public createNotes(renderer: NumberedBarRenderer, beat: Beat): void {
        if (beat.isEmpty || beat.deadSlapped) {
            return;
        }
        const bar = renderer.bar;
        const isGrace = beat.graceType !== GraceType.None;
        if (beat.notes.length === 0) {
            this.noteHead = NumberedBeatGlyph._createNoteHead(bar, beat, null, isGrace);
            return;
        }
        if (renderer.isSingleNote) {
            const single = renderer.getSingleNote(beat);
            if (single) {
                this.noteHead = NumberedBeatGlyph._createNoteHead(bar, beat, single, isGrace);
            }
            return;
        }

        let first: NumberedNoteHeadGlyph | null = null;
        let heads: NumberedNoteHeadGlyph[] | null = null;
        for (const n of beat.notes) {
            if (!n.isVisible) {
                continue;
            }
            const head = NumberedBeatGlyph._createNoteHead(bar, beat, n, isGrace);
            if (!first) {
                first = head;
            } else if (!heads) {
                heads = [first, head];
            } else {
                heads.push(head);
            }
        }
        if (heads) {
            this.chord = new NumberedNoteChordGlyph(0, 0, heads, beat.voice.index, isGrace);
        } else {
            this.noteHead = first;
        }
    }

    /**
     * Creates the number of the note, or of a rest when no note is given.
     */
    private static _createNoteHead(bar: Bar, beat: Beat, note: Note | null, isGrace: boolean): NumberedNoteHeadGlyph {
        if (!note) {
            return new NumberedNoteHeadGlyph(0, 0, '0', isGrace, beat, null, 0, 0);
        }
        const ks = bar.keySignature;
        const kst = bar.keySignatureType;
        const spelling = ModelUtils.resolveSpelling(ks, note.displayValue, note.accidentalMode);
        const tonicDegree = ModelUtils.getKeySignatureTonicDegree(ks, kst);
        const effectiveTonic =
            kst === KeySignatureType.Minor
                ? (tonicDegree + 2) % 7 // relative major
                : tonicDegree;
        const degree = (spelling.step - effectiveTonic + 7) % 7;
        const octave = NumberedBeatGlyph._getOctave(bar, note);
        const head = new NumberedNoteHeadGlyph(
            0,
            0,
            note.isDead ? 'X' : (degree + 1).toString(),
            isGrace,
            beat,
            note,
            note.isDead ? 0 : octave,
            octave * 7 + degree
        );
        head.accidentalType = NumberedBeatGlyph._resolveAccidental(ks, note, spelling);
        return head;
    }

    private static _resolveAccidental(
        keySignature: KeySignature,
        note: Note,
        spelling: SpelledPitch
    ): AccidentalType {
        if (note.accidentalMode === NoteAccidentalMode.ForceNone) {
            return AccidentalType.None;
        }

        const ksOffset = ModelUtils.getKeySignatureAccidentalOffset(keySignature, spelling.step);
        const requiredOffset = spelling.alter - ksOffset;

        if (note.hasQuarterToneOffset) {
            if (requiredOffset > 0) {
                return AccidentalType.SharpQuarterNoteUp;
            }
            if (requiredOffset < 0) {
                return AccidentalType.FlatQuarterNoteUp;
            }
            return AccidentalType.NaturalQuarterNoteUp;
        }
        if (requiredOffset !== 0) {
            return ModelUtils.accidentalOffsetToType(requiredOffset);
        }
        return AccidentalType.None;
    }

    /**
     * Places the numbers on their row ahead of {@link doLayout},
     * as the accidentals of the pre-notes need their vertical positions.
     */
    public prepareNotes(): void {
        const sr = this.renderer as NumberedBarRenderer;
        const glyphY = sr.getVoiceLineY(this.container.beat.voice.index);
        const underlinesHeight = (this.container as NumberedBeatContainerGlyph).underlinesHeight;
        const chord = this.chord;
        if (chord) {
            chord.y = glyphY;
            chord.lowestHead.underlinesHeight = underlinesHeight;
            chord.renderer = this.renderer;
            chord.doLayout();
        } else if (this.noteHead) {
            this.noteHead.y = glyphY;
            this.noteHead.underlinesHeight = underlinesHeight;
        }
    }

    public override doLayout(): void {
        // create glyphs
        const sr = this.renderer as NumberedBarRenderer;
        const beat = this.container.beat;

        if (sr.shortestDuration < beat.duration) {
            sr.shortestDuration = beat.duration;
        }

        if (!beat.isEmpty) {
            const glyphY = sr.getVoiceLineY(beat.voice.index);
            if (beat.deadSlapped) {
                const deadSlapped = new DeadSlappedBeatGlyph();
                deadSlapped.y = glyphY - sr.getLineY(0);
                deadSlapped.renderer = this.renderer;
                deadSlapped.doLayout();
                this.deadSlapped = deadSlapped;
                this.addEffect(deadSlapped);
            } else if (this.chord) {
                this.addNormal(this.chord);
            } else if (this.noteHead) {
                this.addNormal(this.noteHead);
            }

            //
            // Note dots
            if (beat.dots > 0 && beat.duration >= Duration.Quarter) {
                const chord = this.chord;
                for (let i: number = 0; i < beat.dots; i++) {
                    if (chord) {
                        const column = new GlyphGroup(0, 0);
                        column.renderer = this.renderer;
                        for (const head of chord.heads) {
                            const dot = new AugmentationDotGlyph(0, chord.y + head.y);
                            column.addGlyph(dot);
                            const dots = head.dots;
                            if (dots) {
                                dots.push(dot);
                            } else {
                                head.dots = [dot];
                            }
                        }
                        this.addEffect(column);
                    } else {
                        const dot = new AugmentationDotGlyph(0, glyphY);
                        dot.renderer = this.renderer;
                        this.addEffect(dot);
                    }
                }
            }
        }

        super.doLayout();

        const main = this._mainGlyph;
        if (beat.isEmpty) {
            this.onTimeX = this.width / 2;
        } else if (main) {
            this.onTimeX = main.x + main.width / 2;
        }
        this.middleX = this.onTimeX;
        this.stemX = this.middleX;
    }
}
