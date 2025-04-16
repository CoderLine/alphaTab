import { MidiUtils } from '@src/midi/MidiUtils';
import { Automation, AutomationType } from '@src/model/Automation';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import type { Chord } from '@src/model/Chord';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import type { Fermata } from '@src/model/Fermata';
import { GraceType } from '@src/model/GraceType';
import { Note } from '@src/model/Note';
import { Ottavia } from '@src/model/Ottavia';
import { PickStroke } from '@src/model/PickStroke';
import { TupletGroup } from '@src/model/TupletGroup';
import { VibratoType } from '@src/model/VibratoType';
import type { Voice } from '@src/model/Voice';
import { WhammyType } from '@src/model/WhammyType';
import { NotationMode } from '@src/NotationSettings';
import type { Settings } from '@src/Settings';
import type { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { BeatCloner } from '@src/generated/model/BeatCloner';
import { GraceGroup } from '@src/model/GraceGroup';
import { GolpeType } from '@src/model/GolpeType';
import { FadeType } from '@src/model/FadeType';
import { WahPedal } from '@src/model/WahPedal';
import { BarreShape } from '@src/model/BarreShape';
import { Rasgueado } from '@src/model/Rasgueado';
import { ElementStyle } from '@src/model/ElementStyle';

/**
 * Lists the different modes on how beaming for a beat should be done.
 */
export enum BeatBeamingMode {
    /**
     * Automatic beaming based on the timing rules.
     */
    Auto = 0,
    /**
     * Force a split to the next beat.
     */
    ForceSplitToNext = 1,
    /**
     * Force a merge with the next beat.
     */
    ForceMergeWithNext = 2,
    /**
     * Force a split to the next beat on the secondary beam.
     */
    ForceSplitOnSecondaryToNext = 3
}

/**
 * Lists all graphical sub elements within a {@link Beat} which can be styled via {@link Beat.style}
 */
export enum BeatSubElement {
    /**
     * The effects and annotations shown in dedicated effect bands above the staves (e.g. fermata).
     * Only applies to items which are on beat level but not any individual note level effects.
     */
    Effects = 0,

    /**
     * The stems drawn for note heads in this beat on the standard notation staff.
     */
    StandardNotationStem = 1,

    /**
     * The flags drawn for note heads in this beat on the standard notation staff.
     */
    StandardNotationFlags = 2,

    /**
     * The beams drawn between this and the next beat on the standard notation staff.
     */
    StandardNotationBeams = 3,

    /**
     * The tuplet drawn on the standard notation staff (the first beat affects the whole tuplet if grouped).
     */
    StandardNotationTuplet = 4,

    /**
     * The effects and annotations applied to this beat on the standard notation staff (e.g. brushes).
     * Only applies to items which are on beat level but not any individual note level effects.
     */
    StandardNotationEffects = 5,

    /**
     * The rest symbol on the standard notation staff.
     */
    StandardNotationRests = 6,

    /**
     * The stems drawn for note heads in this beat on the guitar tab staff.
     */
    GuitarTabStem = 7,

    /**
     * The flags drawn for note heads in this beat on the guitar tab staff.
     */
    GuitarTabFlags = 8,

    /**
     * The beams drawn between this and the next beat on the guitar tab staff.
     */
    GuitarTabBeams = 9,

    /**
     * The tuplet drawn on the guitar tab staff (the first beat affects the whole tuplet if grouped).
     */
    GuitarTabTuplet = 10,

    /**
     * The effects and annotations applied to this beat on the guitar tab staff (e.g. brushes).
     * Only applies to items which are on beat level but not any individual note level effects.
     */
    GuitarTabEffects = 11,

    /**
     * The rest symbol on the guitar tab staff.
     */
    GuitarTabRests = 12,

    /**
     * The stems drawn for note heads in this beat on the slash staff.
     */
    SlashStem = 13,

    /**
     * The flags drawn for note heads in this beat on the slash staff.
     */
    SlashFlags = 14,

    /**
     * The beams drawn between this and the next beat on the slash staff.
     */
    SlashBeams = 15,

    /**
     * The tuplet drawn on the slash staff (the first beat affects the whole tuplet if grouped).
     */
    SlashTuplet = 16,

    /**
     * The rest symbol on the slash staff.
     */
    SlashRests = 17,

    /**
     * The effects and annotations applied to this beat on the slash staff (e.g. brushes).
     * Only applies to items which are on beat level but not any individual note level effects.
     */
    SlashEffects = 18,

    /**
     * The duration lines drawn for this beat on the numbered notation staff.
     */
    NumberedDuration = 19,

    /**
     * The effects and annotations applied to this beat on the numbered notation staff (e.g. brushes).
     * Only applies to items which are on beat level but not any individual note level effects.
     */
    NumberedEffects = 20,

    /**
     * The rest (0) on the numbered notation staff.
     */
    NumberedRests = 21,

    /**
     * The tuplet drawn on the numbered notation staff (the first beat affects the whole tuplet if grouped).
     */
    NumberedTuplet = 22
}

/**
 * Defines the custom styles for beats.
 * @json
 * @json_strict
 */
export class BeatStyle extends ElementStyle<BeatSubElement> {}

/**
 * A beat is a single block within a bar. A beat is a combination
 * of several notes played at the same time.
 * @json
 * @json_strict
 * @cloneable
 */
export class Beat {
    private static _globalBeatId: number = 0;

    /**
     * @internal
     */
    public static resetIds() {
        Beat._globalBeatId = 0;
    }

    /**
     * Gets or sets the unique id of this beat.
     * @clone_ignore
     */
    public id: number = Beat._globalBeatId++;

    /**
     * Gets or sets the zero-based index of this beat within the voice.
     * @json_ignore
     */
    public index: number = 0;

    /**
     * Gets or sets the previous beat within the whole song.
     * @json_ignore
     * @clone_ignore
     */
    public previousBeat: Beat | null = null;

    /**
     * Gets or sets the next beat within the whole song.
     * @json_ignore
     * @clone_ignore
     */
    public nextBeat: Beat | null = null;

    public get isLastOfVoice(): boolean {
        return this.index === this.voice.beats.length - 1;
    }

    /**
     * Gets or sets the reference to the parent voice this beat belongs to.
     * @json_ignore
     * @clone_ignore
     */
    public voice!: Voice;

    /**
     * Gets or sets the list of notes contained in this beat.
     * @json_add addNote
     * @clone_add addNote
     */
    public notes: Note[] = [];

    /**
     * Gets the lookup where the notes per string are registered.
     * If this staff contains string based notes this lookup allows fast access.
     * @json_ignore
     */
    public readonly noteStringLookup: Map<number, Note> = new Map();

    /**
     * Gets the lookup where the notes per value are registered.
     * If this staff contains string based notes this lookup allows fast access.
     * @json_ignore
     */
    public readonly noteValueLookup: Map<number, Note> = new Map();

    /**
     * Gets or sets a value indicating whether this beat is considered empty.
     */
    public isEmpty: boolean = false;

    /**
     * Gets or sets which whammy bar style should be used for this bar.
     */
    public whammyStyle: BendStyle = BendStyle.Default;

    /**
     * Gets or sets the ottava applied to this beat.
     */
    public ottava: Ottavia = Ottavia.Regular;

    /**
     * Gets or sets the fermata applied to this beat.
     * @clone_ignore
     * @json_ignore
     */
    public fermata: Fermata | null = null;

    /**
     * Gets a value indicating whether this beat starts a legato slur.
     */
    public isLegatoOrigin: boolean = false;

    public get isLegatoDestination(): boolean {
        return !!this.previousBeat && this.previousBeat.isLegatoOrigin;
    }

    /**
     * Gets or sets the note with the lowest pitch in this beat. Only visible notes are considered.
     * @json_ignore
     * @clone_ignore
     */
    public minNote: Note | null = null;

    /**
     * Gets or sets the note with the highest pitch in this beat. Only visible notes are considered.
     * @json_ignore
     * @clone_ignore
     */
    public maxNote: Note | null = null;

    /**
     * Gets or sets the note with the highest string number in this beat. Only visible notes are considered.
     * @json_ignore
     * @clone_ignore
     */
    public maxStringNote: Note | null = null;

    /**
     * Gets or sets the note with the lowest string number in this beat. Only visible notes are considered.
     * @json_ignore
     * @clone_ignore
     */
    public minStringNote: Note | null = null;

    /**
     * Gets or sets the duration of this beat.
     */
    public duration: Duration = Duration.Quarter;

    public get isRest(): boolean {
        return this.isEmpty || (!this.deadSlapped && this.notes.length === 0);
    }

    /**
     * Gets a value indicating whether this beat is a full bar rest.
     */
    public get isFullBarRest(): boolean {
        return this.isRest && this.voice.beats.length === 1 && this.duration === Duration.Whole;
    }

    /**
     * Gets or sets whether any note in this beat has a let-ring applied.
     * @json_ignore
     */
    public isLetRing: boolean = false;

    /**
     * Gets or sets whether any note in this beat has a palm-mute paplied.
     * @json_ignore
     */
    public isPalmMute: boolean = false;

    /**
     * Gets or sets a list of all automations on this beat.
     */
    public automations: Automation[] = [];

    /**
     * Gets or sets the number of dots applied to the duration of this beat.
     */
    public dots: number = 0;

    /**
     * Gets a value indicating whether this beat is fade-in.
     * @deprecated Use `fade`
     */
    public get fadeIn(): boolean {
        return this.fade === FadeType.FadeIn;
    }

    /**
     * Sets a value indicating whether this beat is fade-in.
     * @deprecated Use `fade`
     */
    public set fadeIn(value: boolean) {
        this.fade = value ? FadeType.FadeIn : FadeType.None;
    }

    /**
     * Gets or sets a value indicating whether this beat is fade-in.
     */
    public fade: FadeType = FadeType.None;

    /**
     * Gets or sets the lyrics shown on this beat.
     */
    public lyrics: string[] | null = null;

    /**
     * Gets or sets a value indicating whether the beat is played in rasgueado style.
     */
    public get hasRasgueado(): boolean {
        return this.rasgueado !== Rasgueado.None;
    }

    /**
     * Gets or sets a value indicating whether the notes on this beat are played with a pop-style (bass).
     */
    public pop: boolean = false;

    /**
     * Gets or sets a value indicating whether the notes on this beat are played with a slap-style (bass).
     */
    public slap: boolean = false;

    /**
     * Gets or sets a value indicating whether the notes on this beat are played with a tap-style (bass).
     */
    public tap: boolean = false;

    /**
     * Gets or sets the text annotation shown on this beat.
     */
    public text: string | null = null;

    /**
     * Gets or sets whether this beat should be rendered as slashed note.
     */
    public slashed: boolean = false;

    /**
     * Whether this beat should rendered and played as "dead slapped".
     */
    public deadSlapped: boolean = false;

    /**
     * Gets or sets the brush type applied to the notes of this beat.
     */
    public brushType: BrushType = BrushType.None;

    /**
     * Gets or sets the duration of the brush between the notes in midi ticks.
     */
    public brushDuration: number = 0;

    /**
     * Gets or sets the tuplet denominator.
     */
    public tupletDenominator: number = -1;

    /**
     * Gets or sets the tuplet numerator.
     */
    public tupletNumerator: number = -1;

    public get hasTuplet(): boolean {
        return (
            !(this.tupletDenominator === -1 && this.tupletNumerator === -1) &&
            !(this.tupletDenominator === 1 && this.tupletNumerator === 1)
        );
    }

    /**
     * @clone_ignore
     * @json_ignore
     */
    public tupletGroup: TupletGroup | null = null;

    /**
     * Gets or sets whether this beat continues a whammy effect.
     */
    public isContinuedWhammy: boolean = false;

    /**
     * Gets or sets the whammy bar style of this beat.
     */
    public whammyBarType: WhammyType = WhammyType.None;

    /**
     * Gets or sets the points defining the whammy bar usage.
     * @json_add addWhammyBarPoint
     * @clone_add addWhammyBarPoint
     */
    public whammyBarPoints: BendPoint[] | null = null;

    /**
     * Gets or sets the highest point with for the highest whammy bar value.
     * @json_ignore
     * @clone_ignore
     */
    public maxWhammyPoint: BendPoint | null = null;

    /**
     * Gets or sets the highest point with for the lowest whammy bar value.
     * @json_ignore
     * @clone_ignore
     */
    public minWhammyPoint: BendPoint | null = null;

    public get hasWhammyBar(): boolean {
        return this.whammyBarPoints !== null && this.whammyBarType !== WhammyType.None;
    }

    /**
     * Gets or sets the vibrato effect used on this beat.
     */
    public vibrato: VibratoType = VibratoType.None;

    /**
     * Gets or sets the ID of the chord used on this beat.
     */
    public chordId: string | null = null;

    public get hasChord(): boolean {
        return !!this.chordId;
    }

    public get chord(): Chord | null {
        return this.chordId ? this.voice.bar.staff.getChord(this.chordId)! : null;
    }

    /**
     * Gets or sets the grace style of this beat.
     */
    public graceType: GraceType = GraceType.None;

    /**
     * Gets or sets the grace group this beat belongs to.
     * If this beat is not a grace note, it holds the group which belongs to this beat.
     * @json_ignore
     * @clone_ignore
     */
    public graceGroup: GraceGroup | null = null;

    /**
     * Gets or sets the index of this beat within the grace group if
     * this is a grace beat.
     * @json_ignore
     * @clone_ignore
     */
    public graceIndex: number = -1;

    /**
     * Gets or sets the pickstroke applied on this beat.
     */
    public pickStroke: PickStroke = PickStroke.None;

    public get isTremolo(): boolean {
        return !!this.tremoloSpeed;
    }

    /**
     * Gets or sets the speed of the tremolo effect.
     */
    public tremoloSpeed: Duration | null = null;

    /**
     * Gets or sets whether a crescendo/decrescendo is applied on this beat.
     */
    public crescendo: CrescendoType = CrescendoType.None;

    /**
     * The timeline position of the voice within the current bar as it is displayed. (unit: midi ticks)
     * This might differ from the actual playback time due to special grace types.
     */
    public displayStart: number = 0;

    /**
     * The calculated visual end position of this beat in midi ticks.
     */
    public get displayEnd(): number {
        return this.displayStart + this.displayDuration;
    }

    /**
     * The timeline position of the voice within the current bar as it is played. (unit: midi ticks)
     * This might differ from the actual playback time due to special grace types.
     */
    public playbackStart: number = 0;

    /**
     * Gets or sets the duration that is used for the display of this beat. It defines the size/width of the beat in
     * the music sheet. (unit: midi ticks).
     */
    public displayDuration: number = 0;

    /**
     * Gets or sets the duration that the note is played during the audio generation.
     */
    public playbackDuration: number = 0;

    /**
     * The duration in midi ticks to use for this beat on the {@link displayDuration}
     * controlling the visual display of the beat.
     * @remarks
     * This is used in scenarios where the bar might not have 100% exactly
     * a linear structure between the beats. e.g. in MusicXML when using `<forward />`.
     */
    public overrideDisplayDuration?: number;

    /**
     * The type of golpe to play.
     */
    public golpe: GolpeType = GolpeType.None;

    public get absoluteDisplayStart(): number {
        return this.voice.bar.masterBar.start + this.displayStart;
    }

    public get absolutePlaybackStart(): number {
        return this.voice.bar.masterBar.start + this.playbackStart;
    }

    /**
     * Gets or sets the dynamics applied to this beat.
     */
    public dynamics: DynamicValue = DynamicValue.F;

    /**
     * Gets or sets a value indicating whether the beam direction should be inverted.
     */
    public invertBeamDirection: boolean = false;

    /**
     * Gets or sets the preferred beam direction as specified in the input source.
     */
    public preferredBeamDirection: BeamDirection | null = null;

    /**
     * @json_ignore
     */
    public isEffectSlurOrigin: boolean = false;

    public get isEffectSlurDestination(): boolean {
        return !!this.effectSlurOrigin;
    }

    /**
     * @clone_ignore
     * @json_ignore
     */
    public effectSlurOrigin: Beat | null = null;

    /**
     * @clone_ignore
     * @json_ignore
     */
    public effectSlurDestination: Beat | null = null;

    /**
     * Gets or sets how the beaming should be done for this beat.
     */
    public beamingMode: BeatBeamingMode = BeatBeamingMode.Auto;

    /**
     * Whether the wah pedal should be used when playing the beat.
     */
    public wahPedal: WahPedal = WahPedal.None;

    /**
     * The fret of a barré being played on this beat.
     */
    public barreFret: number = -1;

    /**
     * The shape how the barre should be played on this beat.
     */
    public barreShape: BarreShape = BarreShape.None;

    /**
     * Gets a value indicating whether the beat should be played as Barré
     */
    public get isBarre() {
        return this.barreShape !== BarreShape.None && this.barreFret >= 0;
    }

    /**
     * The Rasgueado pattern to play with this beat.
     */
    public rasgueado: Rasgueado = Rasgueado.None;

    /**
     * Whether to show the time when this beat is played the first time.
     * (requires that the midi for the song is generated so that times are calculated).
     * If no midi is generated the timer value might be filled from the input file (or manually).
     */
    public showTimer: boolean = false;

    /**
     * The absolute time in milliseconds when this beat will be played the first time.
     */
    public timer: number | null = null;

    /**
     * The style customizations for this item.
     * @clone_ignore
     */
    public style?: BeatStyle;

    public addWhammyBarPoint(point: BendPoint): void {
        let points = this.whammyBarPoints;
        if (points === null) {
            points = [];
            this.whammyBarPoints = points;
        }
        points.push(point);
        if (!this.maxWhammyPoint || point.value > this.maxWhammyPoint.value) {
            this.maxWhammyPoint = point;
        }
        if (!this.minWhammyPoint || point.value < this.minWhammyPoint.value) {
            this.minWhammyPoint = point;
        }
        if (this.whammyBarType === WhammyType.None) {
            this.whammyBarType = WhammyType.Custom;
        }
    }

    public removeWhammyBarPoint(index: number): void {
        // check index
        const points = this.whammyBarPoints;
        if (points === null || index < 0 || index >= points.length) {
            return;
        }

        // remove point
        points.splice(index, 1);
        const point: BendPoint = points[index];

        // update maxWhammy point if required
        if (point === this.maxWhammyPoint) {
            this.maxWhammyPoint = null;
            for (const currentPoint of points) {
                if (!this.maxWhammyPoint || currentPoint.value > this.maxWhammyPoint.value) {
                    this.maxWhammyPoint = currentPoint;
                }
            }
        }

        if (point === this.minWhammyPoint) {
            this.minWhammyPoint = null;
            for (const currentPoint of points) {
                if (!this.minWhammyPoint || currentPoint.value < this.minWhammyPoint.value) {
                    this.minWhammyPoint = currentPoint;
                }
            }
        }
    }

    public addNote(note: Note): void {
        note.beat = this;
        note.index = this.notes.length;
        this.notes.push(note);
        if (note.isStringed) {
            this.noteStringLookup.set(note.string, note);
        }
    }

    public removeNote(note: Note): void {
        const index: number = this.notes.indexOf(note);
        if (index >= 0) {
            this.notes.splice(index, 1);
            if (note.isStringed) {
                this.noteStringLookup.delete(note.string);
            }
        }
    }

    public getAutomation(type: AutomationType): Automation | null {
        for (let i: number = 0, j: number = this.automations.length; i < j; i++) {
            const automation: Automation = this.automations[i];
            if (automation.type === type) {
                return automation;
            }
        }
        return null;
    }

    public getNoteOnString(noteString: number): Note | null {
        if (this.noteStringLookup.has(noteString)) {
            return this.noteStringLookup.get(noteString)!;
        }
        return null;
    }

    private calculateDuration(): number {
        if (this.overrideDisplayDuration !== undefined) {
            return this.overrideDisplayDuration!;
        }
        if (this.isFullBarRest) {
            return this.voice.bar.masterBar.calculateDuration();
        }
        let ticks: number = MidiUtils.toTicks(this.duration);
        if (this.dots === 2) {
            ticks = MidiUtils.applyDot(ticks, true);
        } else if (this.dots === 1) {
            ticks = MidiUtils.applyDot(ticks, false);
        }
        if (this.tupletDenominator > 0 && this.tupletNumerator >= 0) {
            ticks = MidiUtils.applyTuplet(ticks, this.tupletNumerator, this.tupletDenominator);
        }
        return ticks;
    }

    public updateDurations(): void {
        const ticks: number = this.calculateDuration();
        this.playbackDuration = ticks;

        switch (this.graceType) {
            case GraceType.BeforeBeat:
            case GraceType.OnBeat:
                switch (this.duration) {
                    case Duration.Sixteenth:
                        this.playbackDuration = MidiUtils.toTicks(Duration.SixtyFourth);
                        break;
                    case Duration.ThirtySecond:
                        this.playbackDuration = MidiUtils.toTicks(Duration.OneHundredTwentyEighth);
                        break;
                    default:
                        this.playbackDuration = MidiUtils.toTicks(Duration.ThirtySecond);
                        break;
                }
                this.displayDuration = 0;
                break;
            case GraceType.BendGrace:
                this.playbackDuration /= 2;
                this.displayDuration = 0;
                break;
            default:
                this.displayDuration = ticks;
                const previous: Beat | null = this.previousBeat;
                if (previous && previous.graceType === GraceType.BendGrace) {
                    this.playbackDuration = previous.playbackDuration;
                }
                break;
        }
    }

    public finishTuplet(): void {
        const previousBeat: Beat | null = this.previousBeat;
        let currentTupletGroup: TupletGroup | null = previousBeat ? previousBeat.tupletGroup : null;
        if (this.hasTuplet || (this.graceType !== GraceType.None && currentTupletGroup)) {
            if (!previousBeat || !currentTupletGroup || !currentTupletGroup.check(this)) {
                currentTupletGroup = new TupletGroup(this.voice);
                currentTupletGroup.check(this);
            }
            this.tupletGroup = currentTupletGroup;
        }

        if (this.index > 0) {
            const barDuration = this.voice.bar.masterBar.calculateDuration();
            const validBeatAutomations: Automation[] = [];
            for (const automation of this.automations) {
                if (automation.ratioPosition === 0) {
                    automation.ratioPosition = this.playbackStart / barDuration;
                }

                // we store tempo automations only on masterbar level
                if (automation.type !== AutomationType.Volume) {
                    validBeatAutomations.push(automation);
                }
            }
            this.automations = validBeatAutomations;
        }
    }

    public finish(settings: Settings, sharedDataBag: Map<string, unknown> | null = null): void {
        if (
            this.getAutomation(AutomationType.Instrument) === null &&
            this.index === 0 &&
            this.voice.index === 0 &&
            this.voice.bar.index === 0 &&
            this.voice.bar.staff.index === 0
        ) {
            this.automations.push(
                Automation.buildInstrumentAutomation(false, 0, this.voice.bar.staff.track.playbackInfo.program)
            );
        }

        switch (this.graceType) {
            case GraceType.OnBeat:
            case GraceType.BeforeBeat:
                const numberOfGraceBeats: number = this.graceGroup!.beats.length;
                // set right duration for beaming/display
                if (numberOfGraceBeats === 1) {
                    this.duration = Duration.Eighth;
                } else if (numberOfGraceBeats === 2) {
                    this.duration = Duration.Sixteenth;
                } else {
                    this.duration = Duration.ThirtySecond;
                }
                break;
        }

        const displayMode: NotationMode = !settings ? NotationMode.GuitarPro : settings.notation.notationMode;
        let isGradual: boolean = this.text === 'grad' || this.text === 'grad.';
        if (isGradual && displayMode === NotationMode.SongBook) {
            this.text = '';
        }
        let needCopyBeatForBend: boolean = false;
        this.minNote = null;
        this.maxNote = null;
        this.minStringNote = null;
        this.maxStringNote = null;
        let visibleNotes: number = 0;
        let isEffectSlurBeat: boolean = false;
        for (let i: number = 0, j: number = this.notes.length; i < j; i++) {
            const note: Note = this.notes[i];
            note.dynamics = this.dynamics;
            note.finish(settings, sharedDataBag);
            if (note.isLetRing) {
                this.isLetRing = true;
            }
            if (note.isPalmMute) {
                this.isPalmMute = true;
            }
            if (displayMode === NotationMode.SongBook && note.hasBend && this.graceType !== GraceType.BendGrace) {
                if (!note.isTieOrigin) {
                    switch (note.bendType) {
                        case BendType.Bend:
                        case BendType.PrebendRelease:
                        case BendType.PrebendBend:
                            needCopyBeatForBend = true;
                            break;
                    }
                }
                if (isGradual || note.bendStyle === BendStyle.Gradual) {
                    isGradual = true;
                    note.bendStyle = BendStyle.Gradual;
                    needCopyBeatForBend = false;
                } else {
                    note.bendStyle = BendStyle.Fast;
                }
            }
            if (note.isVisible) {
                visibleNotes++;
                if (!this.minNote || note.realValue < this.minNote.realValue) {
                    this.minNote = note;
                }
                if (!this.maxNote || note.realValue > this.maxNote.realValue) {
                    this.maxNote = note;
                }
                if (!this.minStringNote || note.string < this.minStringNote.string) {
                    this.minStringNote = note;
                }
                if (!this.maxStringNote || note.string > this.maxStringNote.string) {
                    this.maxStringNote = note;
                }
                if (note.hasEffectSlur) {
                    isEffectSlurBeat = true;
                }
            }
        }
        if (isEffectSlurBeat) {
            if (this.effectSlurOrigin) {
                this.effectSlurOrigin.effectSlurDestination = this.nextBeat;
                if (this.effectSlurOrigin.effectSlurDestination) {
                    this.effectSlurOrigin.effectSlurDestination.effectSlurOrigin = this.effectSlurOrigin;
                }
                this.effectSlurOrigin = null;
            } else {
                this.isEffectSlurOrigin = true;
                this.effectSlurDestination = this.nextBeat;
                if (this.effectSlurDestination) {
                    this.effectSlurDestination.effectSlurOrigin = this;
                }
            }
        }
        if (this.notes.length > 0 && visibleNotes === 0) {
            this.isEmpty = true;
        }
        // we need to clean al letring/palmmute flags for rests
        // in case the effect is not continued on this beat
        if (!this.isRest && (!this.isLetRing || !this.isPalmMute)) {
            let currentBeat: Beat | null = this.previousBeat;
            while (currentBeat && currentBeat.isRest) {
                if (!this.isLetRing) {
                    currentBeat.isLetRing = false;
                }
                if (!this.isPalmMute) {
                    currentBeat.isPalmMute = false;
                }
                currentBeat = currentBeat.previousBeat;
            }
        } else if (
            this.isRest &&
            this.previousBeat &&
            settings &&
            settings.notation.notationMode === NotationMode.GuitarPro
        ) {
            if (this.previousBeat.isLetRing) {
                this.isLetRing = true;
            }
            if (this.previousBeat.isPalmMute) {
                this.isPalmMute = true;
            }
        }
        // try to detect what kind of bend was used and cleans unneeded points if required
        // Guitar Pro 6 and above (gpif.xml) uses exactly 4 points to define all whammys
        const points = this.whammyBarPoints;
        const hasWhammy = points !== null && points.length > 0;
        if (hasWhammy) {
            const isContinuedWhammy: boolean = !!this.previousBeat && this.previousBeat.hasWhammyBar;
            this.isContinuedWhammy = isContinuedWhammy;
        } else {
            this.whammyBarType = WhammyType.None;
        }

        if (hasWhammy && this.whammyBarType === WhammyType.Custom) {
            if (displayMode === NotationMode.SongBook) {
                this.whammyStyle = isGradual ? BendStyle.Gradual : BendStyle.Fast;
            }
            if (points!.length === 4) {
                const origin: BendPoint = points[0];
                const middle1: BendPoint = points[1];
                const middle2: BendPoint = points[2];
                const destination: BendPoint = points[3];
                // the middle points are used for holds, anything else is a new feature we do not support yet
                if (middle1.value === middle2.value) {
                    // constant decrease or increase
                    if (
                        (origin.value < middle1.value && middle1.value < destination.value) ||
                        (origin.value > middle1.value && middle1.value > destination.value)
                    ) {
                        if (origin.value !== 0 && !this.isContinuedWhammy) {
                            this.whammyBarType = WhammyType.PrediveDive;
                        } else {
                            this.whammyBarType = WhammyType.Dive;
                        }
                        points.splice(2, 1);
                        points.splice(1, 1);
                    } else if (
                        (origin.value > middle1.value && middle1.value < destination.value) ||
                        (origin.value < middle1.value && middle1.value > destination.value)
                    ) {
                        this.whammyBarType = WhammyType.Dip;
                        if (middle1.offset === middle2.offset || displayMode === NotationMode.SongBook) {
                            points.splice(2, 1);
                        }
                    } else if (origin.value === middle1.value && middle1.value === destination.value) {
                        if (origin.value !== 0 && !this.isContinuedWhammy) {
                            this.whammyBarType = WhammyType.Predive;
                        } else {
                            this.whammyBarType = WhammyType.Hold;
                        }
                        points.splice(2, 1);
                        points.splice(1, 1);
                    }
                }
            }
        }
        this.updateDurations();

        if (needCopyBeatForBend) {
            // if this beat is a simple bend convert it to a grace beat
            // and generate a placeholder beat with tied notes
            const cloneBeat: Beat = BeatCloner.clone(this);
            cloneBeat.id = Beat._globalBeatId++;
            cloneBeat.pickStroke = PickStroke.None;
            for (let i: number = 0, j: number = cloneBeat.notes.length; i < j; i++) {
                const cloneNote: Note = cloneBeat.notes[i];
                const note: Note = this.notes[i];

                // remove bend on cloned note
                cloneNote.bendType = BendType.None;
                cloneNote.maxBendPoint = null;
                cloneNote.bendPoints = null;
                cloneNote.bendStyle = BendStyle.Default;
                cloneNote.id = Note.GlobalNoteId++;

                // fix ties
                if (note.isTieOrigin) {
                    cloneNote.tieDestination = note.tieDestination!;
                    note.tieDestination!.tieOrigin = cloneNote;
                }
                if (note.isTieDestination) {
                    cloneNote.tieOrigin = note.tieOrigin ? note.tieOrigin : null;
                    note.tieOrigin!.tieDestination = cloneNote;
                }

                // if the note has a bend which is continued on the next note
                // we need to convert this note into a hold bend
                if (note.hasBend && note.isTieOrigin) {
                    const tieDestination: Note | null = Note.findTieOrigin(note);
                    if (tieDestination && tieDestination.hasBend) {
                        cloneNote.bendType = BendType.Hold;
                        const lastPoint: BendPoint = note.bendPoints![note.bendPoints!.length - 1];
                        cloneNote.addBendPoint(new BendPoint(0, lastPoint.value));
                        cloneNote.addBendPoint(new BendPoint(BendPoint.MaxPosition, lastPoint.value));
                    }
                }
                // mark as tied note
                cloneNote.isTieDestination = true;
            }
            this.graceType = GraceType.BendGrace;
            this.graceGroup = new GraceGroup();
            this.graceGroup.addBeat(this);
            this.graceGroup.isComplete = true;
            this.graceGroup.finish();
            this.updateDurations();
            this.voice.insertBeat(this, cloneBeat);

            // ensure cloned beat has also a grace simple grace group for itself
            // (see Voice.finish where every beat gets one)
            // this ensures later that grace rods are assigned correctly to this beat.
            cloneBeat.graceGroup = new GraceGroup();
            cloneBeat.graceGroup.addBeat(this);
            cloneBeat.graceGroup.isComplete = true;
            cloneBeat.graceGroup.finish();
        }
    }

    /**
     * Checks whether the current beat is timewise before the given beat.
     * @param beat
     * @returns
     */
    public isBefore(beat: Beat): boolean {
        return (
            this.voice.bar.index < beat.voice.bar.index ||
            (beat.voice.bar.index === this.voice.bar.index && this.index < beat.index)
        );
    }

    /**
     * Checks whether the current beat is timewise after the given beat.
     * @param beat
     * @returns
     */
    public isAfter(beat: Beat): boolean {
        return (
            this.voice.bar.index > beat.voice.bar.index ||
            (beat.voice.bar.index === this.voice.bar.index && this.index > beat.index)
        );
    }

    public hasNoteOnString(noteString: number): boolean {
        return this.noteStringLookup.has(noteString);
    }

    // TODO: can be likely eliminated
    public getNoteWithRealValue(noteRealValue: number): Note | null {
        if (this.noteValueLookup.has(noteRealValue)) {
            return this.noteValueLookup.get(noteRealValue)!;
        }
        return null;
    }

    public chain(sharedDataBag: Map<string, unknown> | null = null) {
        for (const n of this.notes) {
            this.noteValueLookup.set(n.realValue, n);
            n.chain(sharedDataBag);
        }
    }
}
