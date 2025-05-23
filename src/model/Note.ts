import { AccentuationType } from '@src/model/AccentuationType';
import type { Beat } from '@src/model/Beat';
import type { BendPoint } from '@src/model/BendPoint';
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
import type { Staff } from '@src/model/Staff';
import { VibratoType } from '@src/model/VibratoType';
import { NotationMode } from '@src/NotationSettings';
import type { Settings } from '@src/Settings';
import { Lazy } from '@src/util/Lazy';
import { Logger } from '@src/Logger';
import { ModelUtils } from '@src/model/ModelUtils';
import { PickStroke } from '@src/model/PickStroke';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { ElementStyle } from '@src/model/ElementStyle';
import type { MusicFontSymbol } from '@src/model/MusicFontSymbol';

class NoteIdBag {
    public tieDestinationNoteId: number = -1;
    public tieOriginNoteId: number = -1;
    public slurDestinationNoteId: number = -1;
    public slurOriginNoteId: number = -1;
    public hammerPullDestinationNoteId: number = -1;
    public hammerPullOriginNoteId: number = -1;
    public slideTargetNoteId: number = -1;
    public slideOriginNoteId: number = -1;
}

/**
 * Lists all graphical sub elements within a {@link Note} which can be styled via {@link Note.style}
 */
export enum NoteSubElement {
    /**
     * The effects and annotations shown in dedicated effect bands above the staves (e.g. vibrato).
     * The style of the first note with the effect wins.
     */
    Effects = 0,

    /**
     * The note head on the standard notation staff.
     */
    StandardNotationNoteHead = 1,

    /**
     * The accidentals on the standard notation staff.
     */
    StandardNotationAccidentals = 2,

    /**
     * The effects and annotations applied to this note on the standard notation staff (e.g. bends).
     * If effects on beats result in individual note elements shown, this color will apply.
     */
    StandardNotationEffects = 3,

    /**
     * The fret number on the guitar tab staff.
     */
    GuitarTabFretNumber = 4,

    /**
     * The effects and annotations applied to this note on the guitar tab staff (e.g. bends).
     * If effects on beats result in individual note elements shown, this color will apply.
     */
    GuitarTabEffects = 5,

    /**
     * The note head on the slash notation staff.
     */
    SlashNoteHead = 6,

    /**
     * The effects and annotations applied to this note on the slash notation staff (e.g. dots).
     * If effects on beats result in individual note elements shown, this color will apply.
     */
    SlashEffects = 7,

    /**
     * The note number on the numbered notation staff.
     */
    NumberedNumber = 8,

    /**
     * The accidentals on the numbered notation staff.
     */
    NumberedAccidentals = 9,

    /**
     * The effects and annotations applied to this note on the number notation staff (e.g. dots).
     * If effects on beats result in individual note elements shown, this color will apply.
     */
    NumberedEffects = 10
}

/**
 * Defines the custom styles for notes.
 * @json
 * @json_strict
 */
export class NoteStyle extends ElementStyle<NoteSubElement> {
    /**
     * The symbol that should be used as note head.
     */
    public noteHead?: MusicFontSymbol;

    /**
     * Whether the note head symbol should be centered on the stem (e.g. for arrow notes)
     */
    public noteHeadCenterOnStem?: boolean;
}

/**
 * A note is a single played sound on a fretted instrument.
 * It consists of a fret offset and a string on which the note is played on.
 * It also can be modified by a lot of different effects.
 * @cloneable
 * @json
 * @json_strict
 */
export class Note {
    /**
     * @internal
     */
    public static GlobalNoteId: number = 0;

    /**
     * @internal
     */
    public static resetIds() {
        Note.GlobalNoteId = 0;
    }

    /**
     * Gets or sets the unique id of this note.
     * @clone_ignore
     */
    public id: number = Note.GlobalNoteId++;

    /**
     * Gets or sets the zero-based index of this note within the beat.
     * @json_ignore
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
     * @clone_ignore
     * @json_ignore
     */
    public bendOrigin: Note | null = null;

    /**
     * Gets or sets whether this note continues a bend from a previous note.
     */
    public isContinuedBend: boolean = false;

    /**
     * Gets or sets a list of the points defining the bend behavior.
     * @clone_add addBendPoint
     * @json_add addBendPoint
     */
    public bendPoints: BendPoint[] | null = null;

    /**
     * Gets or sets the bend point with the highest bend value.
     * @clone_ignore
     * @json_ignore
     */
    public maxBendPoint: BendPoint | null = null;

    public get hasBend(): boolean {
        return this.bendPoints !== null && this.bendType !== BendType.None;
    }

    public get isStringed(): boolean {
        return this.string >= 0;
    }

    /**
     * Gets or sets the fret on which this note is played on the instrument.
     * 0 is the nut.
     */
    public fret: number = -1;

    /**
     * Gets or sets the string number where the note is placed.
     * 1 is the lowest string on the guitar and the bottom line on the tablature.
     * It then increases the the number of strings on available on the track.
     */
    public string: number = -1;

    /**
     * Gets or sets whether the string number for this note should be shown.
     */
    public showStringNumber: boolean = false;

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
        return !this.isStringed && this.percussionArticulation >= 0;
    }

    /**
     * Gets or sets the percusson element.
     * @deprecated
     */
    public get element(): number {
        return this.isPercussion ? PercussionMapper.getElementAndVariation(this)[0] : -1;
    }

    /**
     * Gets or sets the variation of this note.
     * @deprecated
     */
    public get variation(): number {
        return this.isPercussion ? PercussionMapper.getElementAndVariation(this)[1] : -1;
    }

    /**
     * Gets or sets the index of percussion articulation in the related `track.percussionArticulations`.
     * If the articulation is not listed in `track.percussionArticulations` the following list based on GP7 applies:
     * - 029 Ride (choke)
     * - 030 Cymbal (hit)
     * - 031 Snare (side stick)
     * - 033 Snare (side stick)
     * - 034 Snare (hit)
     * - 035 Kick (hit)
     * - 036 Kick (hit)
     * - 037 Snare (side stick)
     * - 038 Snare (hit)
     * - 039 Hand Clap (hit)
     * - 040 Snare (hit)
     * - 041 Low Floor Tom (hit)
     * - 042 Hi-Hat (closed)
     * - 043 Very Low Tom (hit)
     * - 044 Pedal Hi-Hat (hit)
     * - 045 Low Tom (hit)
     * - 046 Hi-Hat (open)
     * - 047 Mid Tom (hit)
     * - 048 High Tom (hit)
     * - 049 Crash high (hit)
     * - 050 High Floor Tom (hit)
     * - 051 Ride (middle)
     * - 052 China (hit)
     * - 053 Ride (bell)
     * - 054 Tambourine (hit)
     * - 055 Splash (hit)
     * - 056 Cowbell medium (hit)
     * - 057 Crash medium (hit)
     * - 058 Vibraslap (hit)
     * - 059 Ride (edge)
     * - 060 Hand (hit)
     * - 061 Hand (hit)
     * - 062 Conga high (mute)
     * - 063 Conga high (hit)
     * - 064 Conga low (hit)
     * - 065 Timbale high (hit)
     * - 066 Timbale low (hit)
     * - 067 Agogo high (hit)
     * - 068 Agogo tow (hit)
     * - 069 Cabasa (hit)
     * - 070 Left Maraca (hit)
     * - 071 Whistle high (hit)
     * - 072 Whistle low (hit)
     * - 073 Guiro (hit)
     * - 074 Guiro (scrap-return)
     * - 075 Claves (hit)
     * - 076 Woodblock high (hit)
     * - 077 Woodblock low (hit)
     * - 078 Cuica (mute)
     * - 079 Cuica (open)
     * - 080 Triangle (rnute)
     * - 081 Triangle (hit)
     * - 082 Shaker (hit)
     * - 083 Tinkle Bell (hat)
     * - 083 Jingle Bell (hit)
     * - 084 Bell Tree (hit)
     * - 085 Castanets (hit)
     * - 086 Surdo (hit)
     * - 087 Surdo (mute)
     * - 091 Snare (rim shot)
     * - 092 Hi-Hat (half)
     * - 093 Ride (edge)
     * - 094 Ride (choke)
     * - 095 Splash (choke)
     * - 096 China (choke)
     * - 097 Crash high (choke)
     * - 098 Crash medium (choke)
     * - 099 Cowbell low (hit)
     * - 100 Cowbell low (tip)
     * - 101 Cowbell medium (tip)
     * - 102 Cowbell high (hit)
     * - 103 Cowbell high (tip)
     * - 104 Hand (mute)
     * - 105 Hand (slap)
     * - 106 Hand (mute)
     * - 107 Hand (slap)
     * - 108 Conga low (slap)
     * - 109 Conga low (mute)
     * - 110 Conga high (slap)
     * - 111 Tambourine (return)
     * - 112 Tambourine (roll)
     * - 113 Tambourine (hand)
     * - 114 Grancassa (hit)
     * - 115 Piatti (hat)
     * - 116 Piatti (hand)
     * - 117 Cabasa (return)
     * - 118 Left Maraca (return)
     * - 119 Right Maraca (hit)
     * - 120 Right Maraca (return)
     * - 122 Shaker (return)
     * - 123 Bell Tee (return)
     * - 124 Golpe (thumb)
     * - 125 Golpe (finger)
     * - 126 Ride (middle)
     * - 127 Ride (bell)
     */
    public percussionArticulation: number = -1;

    /**
     * Gets or sets whether this note is visible on the music sheet.
     */
    public isVisible: boolean = true;

    /**
     * Gets a value indicating whether the note is left hand tapped.
     */
    public isLeftHandTapped: boolean = false;

    /**
     * Gets or sets whether this note starts a hammeron or pulloff.
     */
    public isHammerPullOrigin: boolean = false;

    public get isHammerPullDestination(): boolean {
        return !!this.hammerPullOrigin;
    }

    /**
     * Gets the origin of the hammeron/pulloff of this note.
     * @clone_ignore
     * @json_ignore
     */
    public hammerPullOrigin: Note | null = null;

    /**
     * Gets the destination for the hammeron/pullof started by this note.
     * @clone_ignore
     * @json_ignore
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
     * @clone_ignore
     * @json_ignore
     */
    public slurOrigin: Note | null = null;

    /**
     * Gets or sets the note where the slur of this note ends.
     * @clone_ignore
     * @json_ignore
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
     * @clone_ignore
     * @json_ignore
     */
    public letRingDestination: Note | null = null;

    /**
     * Gets or sets whether this note has a palm-mute effect.
     */
    public isPalmMute: boolean = false;

    /**
     * Gets or sets the destination note for the palm-mute effect.
     * @clone_ignore
     * @json_ignore
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
     * @clone_ignore
     * @json_ignore
     */
    public slideTarget: Note | null = null;

    /**
     * Gets or sets the source note for several slide types.
     * @clone_ignore
     * @json_ignore
     */
    public slideOrigin: Note | null = null;

    /**
     * Gets or sets whether a vibrato is played on the note.
     */
    public vibrato: VibratoType = VibratoType.None;

    /**
     * Gets the origin of the tied if this note is tied.
     * @clone_ignore
     * @json_ignore
     */
    public tieOrigin: Note | null = null;

    /**
     * Gets the desination of the tie.
     * @clone_ignore
     * @json_ignore
     */
    public tieDestination: Note | null = null;

    /**
     * Gets or sets whether this note is ends a tied note.
     */
    public isTieDestination: boolean = false;

    public get isTieOrigin(): boolean {
        return this.tieDestination !== null;
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
    public get isFingering(): boolean {
        return this.leftHandFinger !== Fingers.Unknown || this.rightHandFinger !== Fingers.Unknown;
    }

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
     * Gets or sets the percentual duration of the note relative to the overall beat duration.
     */
    public durationPercent: number = 1;

    /**
     * Gets or sets how accidetnals for this note should  be handled.
     */
    public accidentalMode: NoteAccidentalMode = NoteAccidentalMode.Default;

    /**
     * Gets or sets the reference to the parent beat to which this note belongs to.
     * @clone_ignore
     * @json_ignore
     */
    public beat!: Beat;

    /**
     * Gets or sets the dynamics for this note.
     */
    public dynamics: DynamicValue = DynamicValue.F;

    /**
     * @clone_ignore
     * @json_ignore
     */
    public isEffectSlurOrigin: boolean = false;

    /**
     * @clone_ignore
     * @json_ignore
     */
    public hasEffectSlur: boolean = false;

    public get isEffectSlurDestination(): boolean {
        return !!this.effectSlurOrigin;
    }

    /**
     * @clone_ignore
     * @json_ignore
     */
    public effectSlurOrigin: Note | null = null;

    /**
     * @clone_ignore
     * @json_ignore
     */
    public effectSlurDestination: Note | null = null;

    /**
     * The ornament applied on the note.
     */
    public ornament: NoteOrnament = NoteOrnament.None;

    /**
     * The style customizations for this item.
     * @clone_ignore
     */
    public style?: NoteStyle;

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
        return this.calculateRealValue(true, true);
    }

    public get realValueWithoutHarmonic(): number {
        return this.calculateRealValue(true, false);
    }

    /**
     * Calculates the real note value of this note as midi key respecting the given options.
     * @param applyTranspositionPitch Whether or not to apply the transposition pitch of the current staff.
     * @param applyHarmonic Whether or not to apply harmonic pitches to the note.
     * @returns The calculated note value as midi key.
     */
    public calculateRealValue(applyTranspositionPitch: boolean, applyHarmonic: boolean): number {
        const transpositionPitch = applyTranspositionPitch ? this.beat.voice.bar.staff.transpositionPitch : 0;

        if (applyHarmonic) {
            let realValue = this.calculateRealValue(applyTranspositionPitch, false);
            if (this.isStringed) {
                if (this.harmonicType === HarmonicType.Natural) {
                    realValue = this.harmonicPitch + this.stringTuning - transpositionPitch;
                } else {
                    realValue += this.harmonicPitch;
                }
            }
            return realValue;
        }

        if (this.isPercussion) {
            return this.percussionArticulation;
        }
        if (this.isStringed) {
            return this.fret + this.stringTuning - transpositionPitch;
        }
        if (this.isPiano) {
            return this.octave * 12 + this.tone - transpositionPitch;
        }
        return 0;
    }

    public get harmonicPitch(): number {
        if (this.harmonicType === HarmonicType.None || !this.isStringed) {
            return 0;
        }
        const value: number = this.harmonicValue;
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

    public get initialBendValue(): number {
        if (this.hasBend) {
            return Math.floor(this.bendPoints![0].value / 2);
        }
        if (this.bendOrigin) {
            return Math.floor(this.bendOrigin.bendPoints![this.bendOrigin.bendPoints!.length - 1].value / 2);
        }
        if (this.isTieDestination && this.tieOrigin!.bendOrigin) {
            return Math.floor(
                this.tieOrigin!.bendOrigin.bendPoints![this.tieOrigin!.bendOrigin.bendPoints!.length - 1].value / 2
            );
        }
        if (this.beat.hasWhammyBar) {
            return Math.floor(this.beat.whammyBarPoints![0].value / 2);
        }
        if (this.beat.isContinuedWhammy) {
            return Math.floor(
                this.beat.previousBeat!.whammyBarPoints![this.beat.previousBeat!.whammyBarPoints!.length - 1].value / 2
            );
        }
        return 0;
    }

    public get displayValue(): number {
        return this.displayValueWithoutBend + this.initialBendValue;
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
            return this.bendPoints![0].value % 2 !== 0;
        }
        if (this.bendOrigin) {
            return this.bendOrigin.bendPoints![this.bendOrigin.bendPoints!.length - 1].value % 2 !== 0;
        }
        if (this.beat.hasWhammyBar) {
            return this.beat.whammyBarPoints![0].value % 2 !== 0;
        }
        if (this.beat.isContinuedWhammy) {
            return (
                this.beat.previousBeat!.whammyBarPoints![this.beat.previousBeat!.whammyBarPoints!.length - 1].value %
                    2 !==
                0
            );
        }
        return false;
    }

    public addBendPoint(point: BendPoint): void {
        let points = this.bendPoints;
        if (points === null) {
            points = [];
            this.bendPoints = points;
        }
        points.push(point);
        if (!this.maxBendPoint || point.value > this.maxBendPoint.value) {
            this.maxBendPoint = point;
        }
        if (this.bendType === BendType.None) {
            this.bendType = BendType.Custom;
        }
    }

    public finish(settings: Settings, sharedDataBag: Map<string, unknown> | null = null): void {
        const nextNoteOnLine: Lazy<Note | null> = new Lazy<Note | null>(() => Note.nextNoteOnSameLine(this));
        const isSongBook: boolean = settings && settings.notation.notationMode === NotationMode.SongBook;

        // connect ties
        if (this.isTieDestination) {
            this.chain(sharedDataBag);
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
            const hammerPullDestination = Note.findHammerPullDestination(this);
            if (!hammerPullDestination) {
                this.isHammerPullOrigin = false;
            } else {
                this.hammerPullDestination = hammerPullDestination;
                hammerPullDestination.hammerPullOrigin = this;
            }
        }
        // set slides
        switch (this.slideOutType) {
            case SlideOutType.Shift:
            case SlideOutType.Legato:
                if (!this.slideTarget) {
                    this.slideTarget = nextNoteOnLine.value;
                }

                if (!this.slideTarget) {
                    this.slideOutType = SlideOutType.None;
                } else {
                    this.slideTarget.slideOrigin = this;
                }
                break;
        }
        let effectSlurDestination: Note | null = null;
        if (this.isHammerPullOrigin && this.hammerPullDestination) {
            effectSlurDestination = this.hammerPullDestination;
        } else if (this.slideOutType === SlideOutType.Legato && this.slideTarget) {
            effectSlurDestination = this.slideTarget;
        }
        if (effectSlurDestination) {
            this.hasEffectSlur = true;
            if (this.effectSlurOrigin && this.beat.pickStroke === PickStroke.None) {
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
        const points = this.bendPoints;
        const hasBend = points != null && points.length > 0;

        if (hasBend) {
            const isContinuedBend: boolean = this.isTieDestination && this.tieOrigin!.hasBend;
            this.isContinuedBend = isContinuedBend;
        } else {
            this.bendType = BendType.None;
        }

        if (hasBend && this.bendType === BendType.Custom) {
            if (points!.length === 4) {
                const origin: BendPoint = points[0];
                const middle1: BendPoint = points[1];
                const middle2: BendPoint = points[2];
                const destination: BendPoint = points[3];
                // the middle points are used for holds, anything else is a new feature we do not support yet
                if (middle1.value === middle2.value) {
                    // bend higher?
                    if (destination.value > origin.value) {
                        if (middle1.value > destination.value) {
                            this.bendType = BendType.BendRelease;
                        } else if (!this.isContinuedBend && origin.value > 0) {
                            this.bendType = BendType.PrebendBend;
                            points.splice(2, 1);
                            points.splice(1, 1);
                        } else {
                            this.bendType = BendType.Bend;
                            points.splice(2, 1);
                            points.splice(1, 1);
                        }
                    } else if (destination.value < origin.value) {
                        // origin must be > 0 otherwise it's no release, we cannot bend negative
                        if (this.isContinuedBend) {
                            this.bendType = BendType.Release;
                            points.splice(2, 1);
                            points.splice(1, 1);
                        } else {
                            this.bendType = BendType.PrebendRelease;
                            points.splice(2, 1);
                            points.splice(1, 1);
                        }
                    } else {
                        if (middle1.value > origin.value) {
                            this.bendType = BendType.BendRelease;
                        } else if (origin.value > 0 && !this.isContinuedBend) {
                            this.bendType = BendType.Prebend;
                            points.splice(2, 1);
                            points.splice(1, 1);
                        } else {
                            this.bendType = BendType.Hold;
                            points.splice(2, 1);
                            points.splice(1, 1);
                        }
                    }
                } else {
                    Logger.warning('Model', 'Unsupported bend type detected, fallback to custom', null);
                }
            } else if (points.length === 2) {
                const origin: BendPoint = points[0];
                const destination: BendPoint = points[1];
                // bend higher?
                if (destination.value > origin.value) {
                    if (!this.isContinuedBend && origin.value > 0) {
                        this.bendType = BendType.PrebendBend;
                    } else {
                        this.bendType = BendType.Bend;
                    }
                } else if (destination.value < origin.value) {
                    // origin must be > 0 otherwise it's no release, we cannot bend negative
                    if (this.isContinuedBend) {
                        this.bendType = BendType.Release;
                    } else {
                        this.bendType = BendType.PrebendRelease;
                    }
                } else {
                    if (origin.value > 0 && !this.isContinuedBend) {
                        this.bendType = BendType.Prebend;
                    } else {
                        this.bendType = BendType.Hold;
                    }
                }
            }
        }

        // initial bend pitch offsets and forced accidentals don't play well together
        // we reset it
        if (this.initialBendValue > 0) {
            this.accidentalMode = NoteAccidentalMode.Default;
        }
    }

    private static readonly MaxOffsetForSameLineSearch: number = 3;

    public static nextNoteOnSameLine(note: Note): Note | null {
        let nextBeat: Beat | null = note.beat.nextBeat;
        // keep searching in same bar
        while (nextBeat && nextBeat.voice.bar.index <= note.beat.voice.bar.index + Note.MaxOffsetForSameLineSearch) {
            const noteOnString: Note | null = nextBeat.getNoteOnString(note.string);
            if (noteOnString) {
                return noteOnString;
            }
            nextBeat = nextBeat.nextBeat;
        }
        return null;
    }

    static findHammerPullDestination(note: Note): Note | null {
        // For Hammer-Pull destinations we have 2 potential candidates
        // 1. A note on the same string
        // 2. A note on a different string, but with a left-hand-tapping applied

        // for the second case we have a special logic to search for notes:
        // 1. We first search on lower strings, then on higher strings
        // 2. If we find a note with a left-hand-tap applied it becomes the target
        // 3. If we find a note without a left-hand-tap we stop searching in this direction

        let nextBeat: Beat | null = note.beat.nextBeat;
        // keep searching in same bar
        while (nextBeat && nextBeat.voice.bar.index <= note.beat.voice.bar.index + Note.MaxOffsetForSameLineSearch) {
            // 1. same string first
            let noteOnString: Note | null = nextBeat.getNoteOnString(note.string);
            if (noteOnString) {
                return noteOnString;
            }

            // 2. search toward lower strings
            for (let str = note.string; str > 0; str--) {
                noteOnString = nextBeat.getNoteOnString(str);
                if (noteOnString) {
                    if (noteOnString.isLeftHandTapped) {
                        return noteOnString;
                    }
                    break;
                }
            }

            // 3. search toward higher strings
            for (let str = note.string; str <= note.beat.voice.bar.staff.tuning.length; str++) {
                noteOnString = nextBeat.getNoteOnString(str);
                if (noteOnString) {
                    if (noteOnString.isLeftHandTapped) {
                        return noteOnString;
                    }
                    break;
                }
            }

            // nothing found, search on next beat
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
                const noteOnString: Note | null = previousBeat.getNoteOnString(note.string);
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
                    const noteWithValue: Note | null = previousBeat.getNoteWithRealValue(note.realValue);
                    if (noteWithValue) {
                        return noteWithValue;
                    }
                }
            }
            previousBeat = previousBeat.previousBeat;
        }
        return null;
    }

    private static NoteIdLookupKey = 'NoteIdLookup';

    private _noteIdBag: NoteIdBag | null = null;
    public chain(sharedDataBag: Map<string, unknown> | null = null) {
        // mainly for backwards compat in case we reach this code from somewhere outside.
        if (sharedDataBag === null) {
            return;
        }

        // if we have some IDs from a serialization flow,
        // we need to lookup/register the notes correctly
        if (this._noteIdBag !== null) {
            // get or create lookup
            let noteIdLookup: Map<number, Note>;
            if (sharedDataBag.has(Note.NoteIdLookupKey)) {
                noteIdLookup = sharedDataBag.get(Note.NoteIdLookupKey) as Map<number, Note>;
            } else {
                noteIdLookup = new Map<number, Note>();
                sharedDataBag.set(Note.NoteIdLookupKey, noteIdLookup);
            }

            // if this note is a source note for any effect, remember it for later
            // the destination note will look it up for linking
            if (
                this._noteIdBag.hammerPullDestinationNoteId !== -1 ||
                this._noteIdBag.tieDestinationNoteId !== -1 ||
                this._noteIdBag.slurDestinationNoteId !== -1 ||
                this._noteIdBag.slideTargetNoteId !== -1
            ) {
                noteIdLookup.set(this.id, this);
            }

            // on any effect destiniation, lookup the origin which should already be
            // registered
            if (this._noteIdBag.hammerPullOriginNoteId !== -1) {
                this.hammerPullOrigin = noteIdLookup.get(this._noteIdBag.hammerPullOriginNoteId)!;
                this.hammerPullOrigin.hammerPullDestination = this;
            }
            if (this._noteIdBag.tieOriginNoteId !== -1) {
                this.tieOrigin = noteIdLookup.get(this._noteIdBag.tieOriginNoteId)!;
                this.tieOrigin.tieDestination = this;
            }
            if (this._noteIdBag.slurOriginNoteId !== -1) {
                this.slurOrigin = noteIdLookup.get(this._noteIdBag.slurOriginNoteId)!;
                this.slurOrigin.slurDestination = this;
            }

            if (this._noteIdBag.slideOriginNoteId !== -1) {
                this.slideOrigin = noteIdLookup.get(this._noteIdBag.slideOriginNoteId)!;
                this.slideOrigin.slideTarget = this;
            }

            this._noteIdBag = null; // not needed anymore
        } else {
            // no tie destination at all?
            if (!this.isTieDestination && this.tieOrigin === null) {
                return;
            }

            const tieOrigin = this.tieOrigin ?? Note.findTieOrigin(this);
            if (!tieOrigin) {
                this.isTieDestination = false;
            } else {
                tieOrigin.tieDestination = this;
                this.tieOrigin = tieOrigin;
                this.fret = tieOrigin.fret;
                this.octave = tieOrigin.octave;
                this.tone = tieOrigin.tone;
                if (tieOrigin.hasBend) {
                    this.bendOrigin = this.tieOrigin;
                }
            }
        }
    }

    /**
     * @internal
     */
    public toJson(o: Map<string, unknown>) {
        // inject linked note ids into JSON
        if (this.tieDestination !== null) {
            o.set('tiedestinationnoteid', this.tieDestination.id);
        }
        if (this.tieOrigin !== null) {
            o.set('tieoriginnoteid', this.tieOrigin.id);
        }
        if (this.slurDestination !== null) {
            o.set('slurdestinationnoteid', this.slurDestination.id);
        }
        if (this.slurOrigin !== null) {
            o.set('sluroriginnoteid', this.slurOrigin.id);
        }
        if (this.hammerPullOrigin !== null) {
            o.set('hammerpulloriginnoteid', this.hammerPullOrigin.id);
        }
        if (this.hammerPullDestination !== null) {
            o.set('hammerpulldestinationnoteid', this.hammerPullDestination.id);
        }

        if (this.slideTarget !== null) {
            o.set('slidetargetnoteid', this.slideTarget.id);
        }
        if (this.slideOrigin !== null) {
            o.set('slideoriginnoteid', this.slideOrigin.id);
        }
    }

    /**
     * @internal
     */
    public setProperty(property: string, v: unknown): boolean {
        switch (property) {
            case 'tiedestinationnoteid':
                if (this._noteIdBag == null) {
                    this._noteIdBag = new NoteIdBag();
                }
                this._noteIdBag.tieDestinationNoteId = v as number;
                return true;
            case 'tieoriginnoteid':
                if (this._noteIdBag == null) {
                    this._noteIdBag = new NoteIdBag();
                }
                this._noteIdBag.tieOriginNoteId = v as number;
                return true;

            case 'slurdestinationnoteid':
                if (this._noteIdBag == null) {
                    this._noteIdBag = new NoteIdBag();
                }
                this._noteIdBag.slurDestinationNoteId = v as number;
                return true;
            case 'sluroriginnoteid':
                if (this._noteIdBag == null) {
                    this._noteIdBag = new NoteIdBag();
                }
                this._noteIdBag.slurOriginNoteId = v as number;
                return true;

            case 'hammerpulloriginnoteid':
                if (this._noteIdBag == null) {
                    this._noteIdBag = new NoteIdBag();
                }
                this._noteIdBag.hammerPullOriginNoteId = v as number;
                return true;
            case 'hammerpulldestinationnoteid':
                if (this._noteIdBag == null) {
                    this._noteIdBag = new NoteIdBag();
                }
                this._noteIdBag.hammerPullDestinationNoteId = v as number;
                return true;
            case 'slidetargetnoteid':
                if (this._noteIdBag == null) {
                    this._noteIdBag = new NoteIdBag();
                }
                this._noteIdBag.slideTargetNoteId = v as number;
                return true;
            case 'slideoriginnoteid':
                if (this._noteIdBag == null) {
                    this._noteIdBag = new NoteIdBag();
                }
                this._noteIdBag.slideOriginNoteId = v as number;
                return true;
        }
        return false;
    }
}
