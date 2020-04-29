import { MidiUtils } from '@src/audio/util/MidiUtils';
import { Automation, AutomationType } from '@src/model/Automation';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fermata } from '@src/model/Fermata';
import { GraceType } from '@src/model/GraceType';
import { Note } from '@src/model/Note';
import { Ottavia } from '@src/model/Ottavia';
import { PickStroke } from '@src/model/PickStroke';
import { TupletGroup } from '@src/model/TupletGroup';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { WhammyType } from '@src/model/WhammyType';
import { NotationMode } from '@src/NotationSettings';
import { Settings } from '@src/Settings';
import { Logger } from '@src/util/Logger';

/**
 * A beat is a single block within a bar. A beat is a combination
 * of several notes played at the same time.
 */
export class Beat {
    private static _globalBeatId: number = 0;

    /**
     * Gets or sets the unique id of this beat.
     */
    public id: number = Beat._globalBeatId++;

    /**
     * Gets or sets the zero-based index of this beat within the voice.
     */
    public index: number = 0;

    /**
     * Gets or sets the previous beat within the whole song.
     */
    public previousBeat: Beat | null = null;

    /**
     * Gets or sets the next beat within the whole song.
     */
    public nextBeat: Beat | null = null;

    public get isLastOfVoice(): boolean {
        return this.index === this.voice.beats.length - 1;
    }

    /**
     * Gets or sets the reference to the parent voice this beat belongs to.
     */
    public voice!: Voice;

    /**
     * Gets or sets the list of notes contained in this beat.
     */
    public notes: Note[] = [];

    /**
     * Gets the lookup where the notes per string are registered.
     * If this staff contains string based notes this lookup allows fast access.
     */
    public readonly noteStringLookup: Map<number, Note> = new Map();

    /**
     * Gets the lookup where the notes per value are registered.
     * If this staff contains string based notes this lookup allows fast access.
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
     */
    public minNote: Note | null = null;

    /**
     * Gets or sets the note with the highest pitch in this beat. Only visible notes are considered.
     */
    public maxNote: Note | null = null;

    /**
     * Gets or sets the note with the highest string number in this beat. Only visible notes are considered.
     */
    public maxStringNote: Note | null = null;

    /**
     * Gets or sets the note with the lowest string number in this beat. Only visible notes are considered.
     */
    public minStringNote: Note | null = null;

    /**
     * Gets or sets the duration of this beat.
     */
    public duration: Duration = Duration.Quarter;

    public get isRest(): boolean {
        return this.isEmpty || this.notes.length === 0;
    }

    /**
     * Gets or sets whether any note in this beat has a let-ring applied.
     */
    public isLetRing: boolean = false;

    /**
     * Gets or sets whether any note in this beat has a palm-mute paplied.
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
     * Gets or sets a value indicating whether this beat is fade-in.
     */
    public fadeIn: boolean = false;

    /**
     * Gets or sets the lyrics shown on this beat.
     */
    public lyrics: string[] | null = null;

    /**
     * Gets or sets a value indicating whether the beat is played in rasgueado style.
     */
    public hasRasgueado: boolean = false;

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
     */
    public whammyBarPoints: BendPoint[] = [];

    /**
     * Gets or sets the highest point with for the highest whammy bar value.
     */
    public maxWhammyPoint: BendPoint | null = null;

    /**
     * Gets or sets the highest point with for the lowest whammy bar value.
     */
    public minWhammyPoint: BendPoint | null = null;

    public get hasWhammyBar(): boolean {
        return this.whammyBarType !== WhammyType.None;
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
        return this.chordId ? this.voice.bar.staff.chords.get(this.chordId)! : null;
    }

    /**
     * Gets or sets the grace style of this beat.
     */
    public graceType: GraceType = GraceType.None;

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

    public isEffectSlurOrigin: boolean = false;

    public get isEffectSlurDestination(): boolean {
        return !!this.effectSlurOrigin;
    }

    public effectSlurOrigin: Beat | null = null;

    public effectSlurDestination: Beat | null = null;

    public static copyTo(src: Beat, dst: Beat): void {
        dst.id = src.id;
        dst.index = src.index;
        dst.isEmpty = src.isEmpty;
        dst.duration = src.duration;
        dst.dots = src.dots;
        dst.fadeIn = src.fadeIn;
        if (src.lyrics) {
            dst.lyrics = new Array<string>(src.lyrics.length);
            for (let i: number = 0; i < src.lyrics.length; i++) {
                dst.lyrics[i] = src.lyrics[i];
            }
        }
        dst.pop = src.pop;
        dst.hasRasgueado = src.hasRasgueado;
        dst.slap = src.slap;
        dst.tap = src.tap;
        dst.text = src.text;
        dst.brushType = src.brushType;
        dst.brushDuration = src.brushDuration;
        dst.tupletDenominator = src.tupletDenominator;
        dst.tupletNumerator = src.tupletNumerator;
        dst.vibrato = src.vibrato;
        dst.chordId = src.chordId;
        dst.graceType = src.graceType;
        dst.pickStroke = src.pickStroke;
        dst.tremoloSpeed = src.tremoloSpeed;
        dst.crescendo = src.crescendo;
        dst.displayStart = src.displayStart;
        dst.displayDuration = src.displayDuration;
        dst.playbackStart = src.playbackStart;
        dst.playbackDuration = src.playbackDuration;
        dst.dynamics = src.dynamics;
        dst.isLegatoOrigin = src.isLegatoOrigin;
        dst.invertBeamDirection = src.invertBeamDirection;
        dst.whammyBarType = src.whammyBarType;
        dst.isContinuedWhammy = src.isContinuedWhammy;
        dst.ottava = src.ottava;
        dst.whammyStyle = src.whammyStyle;
    }

    public clone(): Beat {
        let beat: Beat = new Beat();
        let id: number = beat.id;
        for (const p of this.whammyBarPoints) {
            beat.addWhammyBarPoint(p.clone());
        }
        for (const n of this.notes) {
            beat.addNoteInternal(n.clone(), n.realValue);
        }
        Beat.copyTo(this, beat);
        for (const a of this.automations) {
            beat.automations.push(a.clone());
        }
        beat.id = id;
        return beat;
    }

    public addWhammyBarPoint(point: BendPoint): void {
        this.whammyBarPoints.push(point);
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
        if (index < 0 || index >= this.whammyBarPoints.length) {
            return;
        }

        // remove point
        this.whammyBarPoints.splice(index, 1);
        let point: BendPoint = this.whammyBarPoints[index];

        // update maxWhammy point if required
        if (point === this.maxWhammyPoint) {
            this.maxWhammyPoint = null;
            for (let currentPoint of this.whammyBarPoints) {
                if (!this.maxWhammyPoint || currentPoint.value > this.maxWhammyPoint.value) {
                    this.maxWhammyPoint = currentPoint;
                }
            }
        }

        if (point === this.minWhammyPoint) {
            this.minWhammyPoint = null;
            for (let currentPoint of this.whammyBarPoints) {
                if (!this.minWhammyPoint || currentPoint.value < this.minWhammyPoint.value) {
                    this.minWhammyPoint = currentPoint;
                }
            }
        }
    }

    public addNote(note: Note): void {
        this.addNoteInternal(note, -1);
    }

    private addNoteInternal(note: Note, realValue: number = -1): void {
        note.beat = this;
        note.index = this.notes.length;
        this.notes.push(note);
        if (note.isStringed) {
            this.noteStringLookup.set(note.string, note);
        }
        if (realValue === -1) {
            realValue = note.realValue;
        }
        this.noteValueLookup.set(realValue, note);
    }

    public removeNote(note: Note): void {
        let index: number = this.notes.indexOf(note);
        if (index >= 0) {
            this.notes.splice(index, 1);
        }
    }

    public getAutomation(type: AutomationType): Automation | null {
        for (let i: number = 0, j: number = this.automations.length; i < j; i++) {
            let automation: Automation = this.automations[i];
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
        let ticks: number = this.calculateDuration();
        this.playbackDuration = ticks;
        this.displayDuration = ticks;
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
                break;
            case GraceType.BendGrace:
                this.playbackDuration /= 2;
                break;
            default:
                let previous: Beat | null = this.previousBeat;
                if (previous && previous.graceType === GraceType.BendGrace) {
                    this.playbackDuration = previous.playbackDuration;
                } else {
                    while (previous && previous.graceType === GraceType.OnBeat) {
                        // if the previous beat is a on-beat grace it steals the duration from this beat
                        this.playbackDuration -= previous.playbackDuration;
                        previous = previous.previousBeat;
                    }
                }
                break;
        }
    }

    public finishTuplet(): void {
        let previousBeat: Beat | null = this.previousBeat;
        let currentTupletGroup: TupletGroup | null = previousBeat ? previousBeat.tupletGroup : null;
        if (this.hasTuplet || (this.graceType !== GraceType.None && currentTupletGroup)) {
            if (!previousBeat || !currentTupletGroup || !currentTupletGroup.check(this)) {
                currentTupletGroup = new TupletGroup(this.voice);
                currentTupletGroup.check(this);
            }
            this.tupletGroup = currentTupletGroup;
        }
    }

    public finish(settings: Settings): void {
        let displayMode: NotationMode = !settings ? NotationMode.GuitarPro : settings.notation.notationMode;
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
            let note: Note = this.notes[i];
            note.finish(settings);
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
        if (this.whammyBarPoints.length > 0 && this.whammyBarType === WhammyType.Custom) {
            if (displayMode === NotationMode.SongBook) {
                this.whammyStyle = isGradual ? BendStyle.Gradual : BendStyle.Fast;
            }
            let isContinuedWhammy: boolean = !!this.previousBeat && this.previousBeat.hasWhammyBar;
            this.isContinuedWhammy = isContinuedWhammy;
            if (this.whammyBarPoints.length === 4) {
                let origin: BendPoint = this.whammyBarPoints[0];
                let middle1: BendPoint = this.whammyBarPoints[1];
                let middle2: BendPoint = this.whammyBarPoints[2];
                let destination: BendPoint = this.whammyBarPoints[3];
                // the middle points are used for holds, anything else is a new feature we do not support yet
                if (middle1.value === middle2.value) {
                    // constant decrease or increase
                    if (
                        (origin.value < middle1.value && middle1.value < destination.value) ||
                        (origin.value > middle1.value && middle1.value > destination.value)
                    ) {
                        if (origin.value !== 0 && !isContinuedWhammy) {
                            this.whammyBarType = WhammyType.PrediveDive;
                        } else {
                            this.whammyBarType = WhammyType.Dive;
                        }
                        this.whammyBarPoints.splice(2, 1);
                        this.whammyBarPoints.splice(1, 1);
                    } else if (
                        (origin.value > middle1.value && middle1.value < destination.value) ||
                        (origin.value < middle1.value && middle1.value > destination.value)
                    ) {
                        this.whammyBarType = WhammyType.Dip;
                        if (middle1.offset === middle2.offset || displayMode === NotationMode.SongBook) {
                            this.whammyBarPoints.splice(2, 1);
                        }
                    } else if (origin.value === middle1.value && middle1.value === destination.value) {
                        if (origin.value !== 0 && !isContinuedWhammy) {
                            this.whammyBarType = WhammyType.Predive;
                        } else {
                            this.whammyBarType = WhammyType.Hold;
                        }
                        this.whammyBarPoints.splice(2, 1);
                        this.whammyBarPoints.splice(1, 1);
                    } else {
                        Logger.warning('Model', 'Unsupported whammy type detected, fallback to custom', null);
                    }
                } else {
                    Logger.warning('Model', 'Unsupported whammy type detected, fallback to custom', null);
                }
            }
        }
        this.updateDurations();
        if (needCopyBeatForBend) {
            // if this beat is a simple bend convert it to a grace beat
            // and generate a placeholder beat with tied notes
            let cloneBeat: Beat = this.clone();
            cloneBeat.id = Beat._globalBeatId++;
            for (let i: number = 0, j: number = cloneBeat.notes.length; i < j; i++) {
                let cloneNote: Note = cloneBeat.notes[i];
                // remove bend on cloned note
                cloneNote.bendType = BendType.None;
                cloneNote.maxBendPoint = null;
                cloneNote.bendPoints = [];
                cloneNote.bendStyle = BendStyle.Default;
                cloneNote.id = Note.GlobalNoteId++;
                // if the note has a bend which is continued on the next note
                // we need to convert this note into a hold bend
                let note: Note = this.notes[i];
                if (note.hasBend && note.isTieOrigin) {
                    let tieDestination: Note | null = Note.nextNoteOnSameLine(note);
                    if (tieDestination && tieDestination.hasBend) {
                        cloneNote.bendType = BendType.Hold;
                        let lastPoint: BendPoint = note.bendPoints[note.bendPoints.length - 1];
                        cloneNote.addBendPoint(new BendPoint(0, lastPoint.value));
                        cloneNote.addBendPoint(new BendPoint(BendPoint.MaxPosition, lastPoint.value));
                    }
                }
                // mark as tied note
                cloneNote.isTieDestination = true;
            }
            this.graceType = GraceType.BendGrace;
            this.updateDurations();
            this.voice.insertBeat(this, cloneBeat);
        }
        this.fermata = this.voice.bar.masterBar.getFermata(this);
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

    public getNoteWithRealValue(noteRealValue: number): Note | null {
        if (this.noteValueLookup.has(noteRealValue)) {
            return this.noteValueLookup.get(noteRealValue)!;
        }
        return null;
    }
}
