import { AccentuationType } from '@src/model/AccentuationType';
import { Beat } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fingers } from '@src/model/Fingers';
import { HarmonicType } from '@src/model/HarmonicType';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { Ottavia } from '@src/model/Ottavia';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { VibratoType } from '@src/model/VibratoType';
import { NotationMode } from '@src/NotationSettings';
import { PercussionMapper } from '@src/rendering/utils/PercussionMapper';
import { Settings } from '@src/Settings';
import { Lazy } from '@src/util/Lazy';
import { Logger } from '@src/util/Logger';
import { ModelUtils } from '@src/model/ModelUtils';

/**
 * A note is a single played sound on a fretted instrument.
 * It consists of a fret offset and a string on which the note is played on.
 * It also can be modified by a lot of different effects.
 */
export class Note {
    public static GlobalNoteId: number = 0;
    /**
     * Gets or sets the unique id of this note.
     */
    public id: number = Note.GlobalNoteId++;

    /**
     * Gets or sets the zero-based index of this note within the beat.
     */
    public index: number = 0;

    /**
     * Gets or sets the accentuation of this note.
     */
    public accentuated: AccentuationType = AccentuationType.None;

    /**
     * Gets or sets the bend type for this note.
     */
    public bendType: BendType = BendType.None;

    /**
     * Gets or sets the bend style for this note.
     */
    public bendStyle: BendStyle = BendStyle.Default;

    /**
     * Gets or sets the note from which this note continues the bend.
     */
    public bendOrigin: Note | null = null;

    /**
     * Gets or sets whether this note continues a bend from a previous note.
     */
    public isContinuedBend: boolean = false;

    /**
     * Gets or sets a list of the points defining the bend behavior.
     */
    public bendPoints: BendPoint[] = [];

    /**
     * Gets or sets the bend point with the highest bend value.
     */
    public maxBendPoint: BendPoint | null = null;

    public get hasBend(): boolean {
        return this.bendType !== BendType.None;
    }

    public get isStringed(): boolean {
        return this.string >= 0;
    }

    /**
     * Gets or sets the fret on which this note is played on the instrument.
     */
    public fret: number = -1;

    /**
     * Gets or sets the string number where the note is placed.
     * 1 is the lowest string on the guitar and the bottom line on the tablature.
     * It then increases the the number of strings on available on the track.
     */
    public string: number = -1;

    public get isPiano(): boolean {
        return !this.isStringed && this.octave >= 0 && this.tone >= 0;
    }

    /**
     * Gets or sets the octave on which this note is played.
     */
    public octave: number = -1;

    /**
     * Gets or sets the tone of this note within the octave.
     */
    public tone: number = -1;

    public get isPercussion(): boolean {
        return !this.isStringed && this.element >= 0 && this.variation >= 0;
    }

    /**
     * Gets or sets the percusson element.
     */
    public element: number = -1;

    /**
     * Gets or sets the variation of this note.
     */
    public variation: number = -1;

    /**
     * Gets or sets whether this note is visible on the music sheet.
     */
    public isVisible: boolean = true;

    /**
     * Gets or sets whether this note starts a hammeron or pulloff.
     */
    public isHammerPullOrigin: boolean = false;

    public get isHammerPullDestination(): boolean {
        return !!this.hammerPullOrigin;
    }

    /**
     * Gets the origin of the hammeron/pulloff of this note.
     */
    public hammerPullOrigin: Note | null = null;

    /**
     * Gets the destination for the hammeron/pullof started by this note.
     */
    public hammerPullDestination: Note | null = null;

    public get isSlurOrigin(): boolean {
        return !!this.slurDestination;
    }

    /**
     * Gets or sets whether this note finishes a slur.
     */
    public isSlurDestination: boolean = false;

    /**
     * Gets or sets the note where the slur of this note starts.
     */
    public slurOrigin: Note | null = null;

    /**
     * Gets or sets the note where the slur of this note ends.
     */
    public slurDestination: Note | null = null;

    public get isHarmonic(): boolean {
        return this.harmonicType !== HarmonicType.None;
    }

    /**
     * Gets or sets the harmonic type applied to this note.
     */
    public harmonicType: HarmonicType = HarmonicType.None;

    /**
     * Gets or sets the value defining the harmonic pitch.
     */
    public harmonicValue: number = 0;

    /**
     * Gets or sets whether the note is a ghost note and shown in parenthesis. Also this will make the note a bit more silent.
     */
    public isGhost: boolean = false;

    /**
     * Gets or sets whether this note has a let-ring effect.
     */
    public isLetRing: boolean = false;

    /**
     * Gets or sets the destination note for the let-ring effect.
     */
    public letRingDestination: Note | null = null;

    /**
     * Gets or sets whether this note has a palm-mute effect.
     */
    public isPalmMute: boolean = false;

    /**
     * Gets or sets the destination note for the palm-mute effect.
     */
    public palmMuteDestination: Note | null = null;

    /**
     * Gets or sets whether the note is shown and played as dead note.
     */
    public isDead: boolean = false;

    /**
     * Gets or sets whether the note is played as staccato.
     */
    public isStaccato: boolean = false;

    /**
     * Gets or sets the slide-in type this note is played with.
     */
    public slideInType: SlideInType = SlideInType.None;

    /**
     * Gets or sets the slide-out type this note is played with.
     */
    public slideOutType: SlideOutType = SlideOutType.None;

    /**
     * Gets or sets the target note for several slide types.
     */
    public slideTarget: Note | null = null;

    /**
     * Gets or sets whether a vibrato is played on the note.
     */
    public vibrato: VibratoType = VibratoType.None;

    /**
     * Gets or sets the origin of the tied if this note is tied.
     */
    public tieOrigin: Note | null = null;

    /**
     * Gets or sets the desination of the tie.
     */
    public tieDestination: Note | null = null;

    /**
     * Gets or sets whether this note is ends a tied note.
     */
    public isTieDestination: boolean = false;

    public get isTieOrigin(): boolean {
        return !!this.tieDestination;
    }

    /**
     * Gets or sets the fingers used for this note on the left hand.
     */
    public leftHandFinger: Fingers = Fingers.Unknown;

    /**
     * Gets or sets the fingers used for this note on the right hand.
     */
    public rightHandFinger: Fingers = Fingers.Unknown;

    /**
     * Gets or sets whether this note has fingering defined.
     */
    public isFingering: boolean = false;

    /**
     * Gets or sets the target note value for the trill effect.
     */
    public trillValue: number = -1;

    public get trillFret(): number {
        return this.trillValue - this.stringTuning;
    }

    public get isTrill(): boolean {
        return this.trillValue >= 0;
    }

    /**
     * Gets or sets the speed of the trill effect.
     */
    public trillSpeed: Duration = Duration.ThirtySecond;

    /**
     * Gets or sets the percentual duration of the note relative to the overall beat duration .
     */
    public durationPercent: number = 1;

    /**
     * Gets or sets how accidetnals for this note should  be handled.
     */
    public accidentalMode: NoteAccidentalMode = NoteAccidentalMode.Default;

    /**
     * Gets or sets the reference to the parent beat to which this note belongs to.
     */
    public beat!: Beat;

    /**
     * Gets or sets the dynamics for this note.
     */
    public dynamics: DynamicValue = DynamicValue.F;

    public isEffectSlurOrigin: boolean = false;

    public hasEffectSlur: boolean = false;

    public get isEffectSlurDestination(): boolean {
        return !!this.effectSlurOrigin;
    }

    public effectSlurOrigin: Note | null = null;

    public effectSlurDestination: Note | null = null;

    public get stringTuning(): number {
        return this.beat.voice.bar.staff.capo + Note.getStringTuning(this.beat.voice.bar.staff, this.string);
    }

    public static getStringTuning(staff: Staff, noteString: number): number {
        if (staff.tuning.length > 0) {
            return staff.tuning[staff.tuning.length - (noteString - 1) - 1];
        }
        return 0;
    }

    public get realValue(): number {
        if (this.isPercussion) {
            return PercussionMapper.midiFromElementVariation(this);
        }
        if (this.isStringed) {
            if (this.harmonicType === HarmonicType.Natural) {
                return this.harmonicPitch + this.stringTuning - this.beat.voice.bar.staff.transpositionPitch;
            }
            return this.fret + this.stringTuning - this.beat.voice.bar.staff.transpositionPitch + this.harmonicPitch;
        }
        if (this.isPiano) {
            return this.octave * 12 + this.tone - this.beat.voice.bar.staff.transpositionPitch;
        }
        return 0;
    }

    public get harmonicPitch(): number {
        if (this.harmonicType === HarmonicType.None || !this.isStringed) {
            return 0;
        }
        let value: number = this.harmonicValue;
        // add semitones to reach corresponding harmonic frets
        if (ModelUtils.isAlmostEqualTo(value, 2.4)) {
            return 36;
        }
        if (ModelUtils.isAlmostEqualTo(value, 2.7)) {
            // Fret 3 2nd octave + minor seventh
            return 34;
        }
        if (value < 3) {
            // no natural harmonics below fret 3
            return 0;
        }
        if (value <= 3.5) {
            // Fret 3 2nd octave + fifth
            return 31;
        }
        if (value <= 4) {
            return 28;
        }
        if (value <= 5) {
            return 24;
        }
        if (value <= 6) {
            return 34;
        }
        if (value <= 7) {
            return 19;
        }
        if (value <= 8.5) {
            return 36;
        }
        if (value <= 9) {
            return 28;
        }
        if (value <= 10) {
            return 34;
        }
        if (value <= 11) {
            return 0;
        }
        if (value <= 12) {
            return 12;
        }
        if (value < 14) {
            // fret 13,14 stay
            return 0;
        }
        if (value <= 15) {
            return 34;
        }
        if (value <= 16) {
            return 28;
        }
        if (value <= 17) {
            return 36;
        }
        if (value <= 18) {
            return 0;
        }
        if (value <= 19) {
            return 19;
        }
        if (value <= 21) {
            //  20,21 stay
            return 0;
        }
        if (value <= 22) {
            return 36;
        }
        if (value <= 24) {
            return 24;
        }
        return 0;
    }

    public get displayValue(): number {
        let noteValue: number = this.displayValueWithoutBend;
        if (this.hasBend) {
            noteValue += (this.bendPoints[0].value / 2) | 0;
        } else if (this.bendOrigin) {
            noteValue += (this.bendOrigin.bendPoints[this.bendOrigin.bendPoints.length - 1].value / 2) | 0;
        } else if (this.isTieDestination && this.tieOrigin!.bendOrigin) {
            noteValue +=
                (this.tieOrigin!.bendOrigin.bendPoints[this.tieOrigin!.bendOrigin.bendPoints.length - 1].value / 2) | 0;
        } else if (this.beat.hasWhammyBar) {
            noteValue += (this.beat.whammyBarPoints[0].value / 2) | 0;
        } else if (this.beat.isContinuedWhammy) {
            noteValue +=
                (this.beat.previousBeat!.whammyBarPoints[this.beat.previousBeat!.whammyBarPoints.length - 1].value /
                    2) |
                0;
        }
        return noteValue;
    }

    public get displayValueWithoutBend(): number {
        let noteValue: number = this.realValue;
        if (this.harmonicType !== HarmonicType.Natural && this.harmonicType !== HarmonicType.None) {
            noteValue -= this.harmonicPitch;
        }
        switch (this.beat.ottava) {
            case Ottavia._15ma:
                noteValue -= 24;
                break;
            case Ottavia._8va:
                noteValue -= 12;
                break;
            case Ottavia.Regular:
                break;
            case Ottavia._8vb:
                noteValue += 12;
                break;
            case Ottavia._15mb:
                noteValue += 24;
                break;
        }
        switch (this.beat.voice.bar.clefOttava) {
            case Ottavia._15ma:
                noteValue -= 24;
                break;
            case Ottavia._8va:
                noteValue -= 12;
                break;
            case Ottavia.Regular:
                break;
            case Ottavia._8vb:
                noteValue += 12;
                break;
            case Ottavia._15mb:
                noteValue += 24;
                break;
        }
        return noteValue - this.beat.voice.bar.staff.displayTranspositionPitch;
    }

    public get hasQuarterToneOffset(): boolean {
        if (this.hasBend) {
            return this.bendPoints[0].value % 2 !== 0;
        }
        if (this.bendOrigin) {
            return this.bendOrigin.bendPoints[this.bendOrigin.bendPoints.length - 1].value % 2 !== 0;
        }
        if (this.beat.hasWhammyBar) {
            return this.beat.whammyBarPoints[0].value % 2 !== 0;
        }
        if (this.beat.isContinuedWhammy) {
            return (
                this.beat.previousBeat!.whammyBarPoints[this.beat.previousBeat!.whammyBarPoints.length - 1].value %
                    2 !==
                0
            );
        }
        return false;
    }

    public static copyTo(src: Note, dst: Note): void {
        dst.id = src.id;
        dst.accentuated = src.accentuated;
        dst.fret = src.fret;
        dst.string = src.string;
        dst.harmonicValue = src.harmonicValue;
        dst.harmonicType = src.harmonicType;
        dst.isGhost = src.isGhost;
        dst.isLetRing = src.isLetRing;
        dst.isPalmMute = src.isPalmMute;
        dst.isDead = src.isDead;
        dst.isStaccato = src.isStaccato;
        dst.slideInType = src.slideInType;
        dst.slideOutType = src.slideOutType;
        dst.vibrato = src.vibrato;
        dst.isTieDestination = src.isTieDestination;
        dst.isSlurDestination = src.isSlurDestination;
        dst.isHammerPullOrigin = src.isHammerPullOrigin;
        dst.leftHandFinger = src.leftHandFinger;
        dst.rightHandFinger = src.rightHandFinger;
        dst.isFingering = src.isFingering;
        dst.trillValue = src.trillValue;
        dst.trillSpeed = src.trillSpeed;
        dst.durationPercent = src.durationPercent;
        dst.accidentalMode = src.accidentalMode;
        dst.dynamics = src.dynamics;
        dst.octave = src.octave;
        dst.tone = src.tone;
        dst.element = src.element;
        dst.variation = src.variation;
        dst.bendType = src.bendType;
        dst.bendStyle = src.bendStyle;
        dst.isContinuedBend = src.isContinuedBend;
        dst.isVisible = src.isVisible;
    }

    public clone(): Note {
        let n: Note = new Note();
        let id: number = n.id;
        Note.copyTo(this, n);
        for (let i: number = 0, j: number = this.bendPoints.length; i < j; i++) {
            n.addBendPoint(this.bendPoints[i].clone());
        }
        n.id = id;
        return n;
    }

    public addBendPoint(point: BendPoint): void {
        this.bendPoints.push(point);
        if (!this.maxBendPoint || point.value > this.maxBendPoint.value) {
            this.maxBendPoint = point;
        }
        if (this.bendType === BendType.None) {
            this.bendType = BendType.Custom;
        }
    }

    public finish(settings: Settings): void {
        let nextNoteOnLine: Lazy<Note | null> = new Lazy<Note | null>(() => Note.nextNoteOnSameLine(this));
        let isSongBook: boolean = settings && settings.notation.notationMode === NotationMode.SongBook;
        // connect ties
        if (this.isTieDestination) {
            if (this.tieOrigin) {
                this.tieOrigin.tieDestination = this;
            } else {
                let tieOrigin: Note | null = Note.findTieOrigin(this);
                if (!tieOrigin) {
                    this.isTieDestination = false;
                } else {
                    this.tieOrigin = tieOrigin;
                    this.tieOrigin.tieDestination = this;
                    this.fret = this.tieOrigin.fret;
                    this.octave = this.tieOrigin.octave;
                    this.tone = this.tieOrigin.tone;
                    if (this.tieOrigin.hasBend) {
                        this.bendOrigin = this.tieOrigin;
                    }
                }
            }
            // implicit let ring
            if (isSongBook && this.tieOrigin && this.tieOrigin.isLetRing) {
                this.isLetRing = true;
            }
        }
        // connect letring
        if (this.isLetRing) {
            if (!nextNoteOnLine.value || !nextNoteOnLine.value.isLetRing) {
                this.letRingDestination = this;
            } else {
                this.letRingDestination = nextNoteOnLine.value;
            }
            if (isSongBook && this.isTieDestination && !this.tieOrigin!.hasBend) {
                this.isVisible = false;
            }
        }
        // connect palmmute
        if (this.isPalmMute) {
            if (!nextNoteOnLine.value || !nextNoteOnLine.value.isPalmMute) {
                this.palmMuteDestination = this;
            } else {
                this.palmMuteDestination = nextNoteOnLine.value;
            }
        }
        // set hammeron/pulloffs
        if (this.isHammerPullOrigin) {
            if (!nextNoteOnLine.value) {
                this.isHammerPullOrigin = false;
            } else {
                this.hammerPullDestination = nextNoteOnLine.value;
                this.hammerPullDestination.hammerPullOrigin = this;
            }
        }
        // set slides
        switch (this.slideOutType) {
            case SlideOutType.Shift:
            case SlideOutType.Legato:
                this.slideTarget = nextNoteOnLine.value;
                if (!this.slideTarget) {
                    this.slideOutType = SlideOutType.None;
                }
                break;
        }
        let effectSlurDestination: Note | null = null;
        if (this.isHammerPullOrigin) {
            effectSlurDestination = this.hammerPullDestination;
        } else if (this.slideOutType === SlideOutType.Legato && this.slideTarget) {
            effectSlurDestination = this.slideTarget;
        }
        if (effectSlurDestination) {
            this.hasEffectSlur = true;
            if (this.effectSlurOrigin) {
                this.effectSlurOrigin.effectSlurDestination = effectSlurDestination;
                this.effectSlurOrigin.effectSlurDestination.effectSlurOrigin = this.effectSlurOrigin;
                this.effectSlurOrigin = null;
            } else {
                this.isEffectSlurOrigin = true;
                this.effectSlurDestination = effectSlurDestination;
                this.effectSlurDestination.effectSlurOrigin = this;
            }
        }
        // try to detect what kind of bend was used and cleans unneeded points if required
        // Guitar Pro 6 and above (gpif.xml) uses exactly 4 points to define all bends
        if (this.bendPoints.length > 0 && this.bendType === BendType.Custom) {
            let isContinuedBend: boolean = (this.isContinuedBend = !!this.tieOrigin && this.tieOrigin.hasBend);
            if (this.bendPoints.length === 4) {
                let origin: BendPoint = this.bendPoints[0];
                let middle1: BendPoint = this.bendPoints[1];
                let middle2: BendPoint = this.bendPoints[2];
                let destination: BendPoint = this.bendPoints[3];
                // the middle points are used for holds, anything else is a new feature we do not support yet
                if (middle1.value === middle2.value) {
                    // bend higher?
                    if (destination.value > origin.value) {
                        if (middle1.value > destination.value) {
                            this.bendType = BendType.BendRelease;
                        } else if (!isContinuedBend && origin.value > 0) {
                            this.bendType = BendType.PrebendBend;
                            this.bendPoints.splice(2, 1);
                            this.bendPoints.splice(1, 1);
                        } else {
                            this.bendType = BendType.Bend;
                            this.bendPoints.splice(2, 1);
                            this.bendPoints.splice(1, 1);
                        }
                    } else if (destination.value < origin.value) {
                        // origin must be > 0 otherwise it's no release, we cannot bend negative
                        if (isContinuedBend) {
                            this.bendType = BendType.Release;
                            this.bendPoints.splice(2, 1);
                            this.bendPoints.splice(1, 1);
                        } else {
                            this.bendType = BendType.PrebendRelease;
                            this.bendPoints.splice(2, 1);
                            this.bendPoints.splice(1, 1);
                        }
                    } else {
                        if (middle1.value > origin.value) {
                            this.bendType = BendType.BendRelease;
                        } else if (origin.value > 0 && !isContinuedBend) {
                            this.bendType = BendType.Prebend;
                            this.bendPoints.splice(2, 1);
                            this.bendPoints.splice(1, 1);
                        } else {
                            this.bendType = BendType.Hold;
                            this.bendPoints.splice(2, 1);
                            this.bendPoints.splice(1, 1);
                        }
                    }
                } else {
                    Logger.warning('Model', 'Unsupported bend type detected, fallback to custom', null);
                }
            } else if (this.bendPoints.length === 2) {
                let origin: BendPoint = this.bendPoints[0];
                let destination: BendPoint = this.bendPoints[1];
                // bend higher?
                if (destination.value > origin.value) {
                    if (!isContinuedBend && origin.value > 0) {
                        this.bendType = BendType.PrebendBend;
                    } else {
                        this.bendType = BendType.Bend;
                    }
                } else if (destination.value < origin.value) {
                    // origin must be > 0 otherwise it's no release, we cannot bend negative
                    if (isContinuedBend) {
                        this.bendType = BendType.Release;
                    } else {
                        this.bendType = BendType.PrebendRelease;
                    }
                } else {
                    this.bendType = BendType.Hold;
                }
            }
        } else if (this.bendPoints.length === 0) {
            this.bendType = BendType.None;
        }
    }

    private static readonly MaxOffsetForSameLineSearch: number = 3;

    public static nextNoteOnSameLine(note: Note): Note | null {
        let nextBeat: Beat | null = note.beat.nextBeat;
        // keep searching in same bar
        while (nextBeat && nextBeat.voice.bar.index <= note.beat.voice.bar.index + Note.MaxOffsetForSameLineSearch) {
            let noteOnString: Note | null = nextBeat.getNoteOnString(note.string);
            if (noteOnString) {
                return noteOnString;
            }
            nextBeat = nextBeat.nextBeat;
        }
        return null;
    }

    public static findTieOrigin(note: Note): Note | null {
        let previousBeat: Beat | null = note.beat.previousBeat;
        // keep searching in same bar
        while (
            previousBeat &&
            previousBeat.voice.bar.index >= note.beat.voice.bar.index - Note.MaxOffsetForSameLineSearch
        ) {
            if (note.isStringed) {
                let noteOnString: Note | null = previousBeat.getNoteOnString(note.string);
                if (noteOnString) {
                    return noteOnString;
                }
            } else {
                if (note.octave === -1 && note.tone === -1) {
                    // if the note has no value (e.g. alphaTex dash tie), we try to find a matching
                    // note on the previous beat by index.
                    if (note.index < previousBeat.notes.length) {
                        return previousBeat.notes[note.index];
                    }
                } else {
                    let noteWithValue: Note | null = previousBeat.getNoteWithRealValue(note.realValue);
                    if (noteWithValue) {
                        return noteWithValue;
                    }
                }
            }
            previousBeat = previousBeat.previousBeat;
        }
        return null;
    }
}
