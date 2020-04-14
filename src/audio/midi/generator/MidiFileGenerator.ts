import { BeatTickLookup } from '@src/audio/midi/BeatTickLookup';

import { ControllerType } from '@src/audio/midi/event/ControllerType';
import { IMidiFileHandler } from '@src/audio/midi/generator/IMidiFileHandler';

import { MidiPlaybackController } from '@src/audio/midi/generator/MidiPlaybackController';
import { MasterBarTickLookup } from '@src/audio/midi/MasterBarTickLookup';
import { MidiTickLookup } from '@src/audio/midi/MidiTickLookup';

import { MidiUtils } from '@src/audio/util/MidiUtils';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType } from '@src/model/Automation';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { GraceType } from '@src/model/GraceType';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { PlaybackInformation } from '@src/model/PlaybackInformation';
import { Score } from '@src/model/Score';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { WhammyType } from '@src/model/WhammyType';
import { NotationMode } from '@src/NotationSettings';
import { Settings } from '@src/Settings';

import { Logger } from '@src/util/Logger';

export class MidiNoteDuration {
    public noteOnly: number = 0;
    public untilTieEnd: number = 0;
    public letRingEnd: number = 0;
}

class TripletFeelDurations {
    public firstBeatDuration: number = 0;
    public secondBeatStartOffset: number = 0;
    public secondBeatDuration: number = 0;
}

/**
 * This generator creates a midi file using a score.
 */
export class MidiFileGenerator {
    private static readonly DefaultDurationDead: number = 30;
    private static readonly DefaultDurationPalmMute: number = 80;

    private readonly _score: Score;
    private _settings: Settings;
    private _handler: IMidiFileHandler;
    private _currentTempo: number = 0;
    private _currentBarRepeatLookup: BeatTickLookup | null = null;

    /**
     * Gets a lookup object which can be used to quickly find beats and bars
     * at a given midi tick position.
     */
    public readonly tickLookup: MidiTickLookup = new MidiTickLookup();

    /**
     * Initializes a new instance of the {@link MidiFileGenerator} class.
     * @param score The score for which the midi file should be generated.
     * @param settings The settings ot use for generation.
     * @param handler The handler that should be used for generating midi events.
     */
    public constructor(score: Score, settings: Settings | null, handler: IMidiFileHandler) {
        this._score = score;
        this._settings = !settings ? new Settings() : settings;
        this._currentTempo = this._score.tempo;
        this._handler = handler;
    }

    /**
     * Starts the generation of the midi file.
     */
    public generate(): void {
        // initialize tracks
        for (const track of this._score.tracks) {
            this.generateTrack(track);
        }

        Logger.info('Midi', 'Begin midi generation');
        const controller: MidiPlaybackController = new MidiPlaybackController(this._score);

        let previousMasterBar: MasterBar | null = null;
        // store the previous played bar for repeats
        while (!controller.finished) {
            const index: number = controller.index;
            const bar: MasterBar = this._score.masterBars[index];
            const currentTick: number = controller.currentTick;
            controller.processCurrent();

            if (controller.shouldPlay) {
                this.generateMasterBar(bar, previousMasterBar, currentTick);
                for (const track of this._score.tracks) {
                    for (const staff of track.staves) {
                        if (index < staff.bars.length) {
                            this.generateBar(staff.bars[index], currentTick);
                        }
                    }
                }
            }

            controller.moveNext();
            previousMasterBar = bar;
        }

        for (const track of this._score.tracks) {
            this._handler.finishTrack(track.index, controller.currentTick);
        }

        this.tickLookup.finish();
        Logger.info('Midi', 'Midi generation done');
    }

    private generateTrack(track: Track): void {
        // channel
        this.generateChannel(track, track.playbackInfo.primaryChannel, track.playbackInfo);
        if (track.playbackInfo.primaryChannel !== track.playbackInfo.secondaryChannel) {
            this.generateChannel(track, track.playbackInfo.secondaryChannel, track.playbackInfo);
        }
    }

    private generateChannel(track: Track, channel: number, playbackInfo: PlaybackInformation): void {
        let volume: number = MidiFileGenerator.toChannelShort(playbackInfo.volume);
        let balance: number = MidiFileGenerator.toChannelShort(playbackInfo.balance);
        this._handler.addControlChange(track.index, 0, channel, ControllerType.VolumeCoarse, volume);
        this._handler.addControlChange(track.index, 0, channel, ControllerType.PanCoarse, balance);
        this._handler.addControlChange(track.index, 0, channel, ControllerType.ExpressionControllerCoarse, 127);
        // set parameter that is being updated (0) -> PitchBendRangeCoarse
        this._handler.addControlChange(track.index, 0, channel, ControllerType.RegisteredParameterFine, 0);
        this._handler.addControlChange(track.index, 0, channel, ControllerType.RegisteredParameterCourse, 0);
        // Set PitchBendRangeCoarse to 12
        this._handler.addControlChange(track.index, 0, channel, ControllerType.DataEntryFine, 0);
        this._handler.addControlChange(track.index, 0, channel, ControllerType.DataEntryCoarse, 12);
        this._handler.addProgramChange(track.index, 0, channel, playbackInfo.program);
    }

    private static toChannelShort(data: number): number {
        const value: number = Math.max(-32768, Math.min(32767, data * 8 - 1));
        return Math.max(value, -1) + 1;
    }

    private generateMasterBar(masterBar: MasterBar, previousMasterBar: MasterBar | null, currentTick: number): void {
        // time signature
        if (
            !previousMasterBar ||
            previousMasterBar.timeSignatureDenominator !== masterBar.timeSignatureDenominator ||
            previousMasterBar.timeSignatureNumerator !== masterBar.timeSignatureNumerator
        ) {
            this._handler.addTimeSignature(
                currentTick,
                masterBar.timeSignatureNumerator,
                masterBar.timeSignatureDenominator
            );
        }

        // tempo
        if (!previousMasterBar) {
            this._handler.addTempo(currentTick, masterBar.score.tempo);
            this._currentTempo = masterBar.score.tempo;
        } else if (masterBar.tempoAutomation) {
            this._handler.addTempo(currentTick, masterBar.tempoAutomation.value);
            this._currentTempo = masterBar.tempoAutomation.value;
        }

        const masterBarLookup: MasterBarTickLookup = new MasterBarTickLookup();
        masterBarLookup.masterBar = masterBar;
        masterBarLookup.start = currentTick;
        masterBarLookup.tempo = this._currentTempo;
        masterBarLookup.end = masterBarLookup.start + masterBar.calculateDuration();
        this.tickLookup.addMasterBar(masterBarLookup);
    }

    private generateBar(bar: Bar, barStartTick: number): void {
        let playbackBar: Bar = this.getPlaybackBar(bar);
        this._currentBarRepeatLookup = null;
        for (const v of playbackBar.voices) {
            this.generateVoice(v, barStartTick, bar);
        }
    }

    private getPlaybackBar(bar: Bar): Bar {
        switch (bar.simileMark) {
            case SimileMark.Simple:
                if (bar.previousBar) {
                    bar = this.getPlaybackBar(bar.previousBar);
                }
                break;
            case SimileMark.FirstOfDouble:
                if (bar.previousBar && bar.previousBar.previousBar) {
                    bar = this.getPlaybackBar(bar.previousBar.previousBar);
                }
                break;
            case SimileMark.SecondOfDouble:
                if (bar.previousBar && bar.previousBar.previousBar) {
                    bar = this.getPlaybackBar(bar.previousBar.previousBar);
                }
                break;
        }
        return bar;
    }

    private generateVoice(voice: Voice, barStartTick: number, realBar: Bar): void {
        if (voice.isEmpty && (!voice.bar.isEmpty || voice.index !== 0)) {
            return;
        }

        for (const b of voice.beats) {
            this.generateBeat(b, barStartTick, realBar);
        }
    }

    private _currentTripletFeel: TripletFeelDurations | null = null;

    private generateBeat(beat: Beat, barStartTick: number, realBar: Bar): void {
        let beatStart: number = beat.playbackStart;
        let audioDuration: number = beat.playbackDuration;
        if (beat.voice.bar.isEmpty) {
            audioDuration = beat.voice.bar.masterBar.calculateDuration();
        } else if (
            beat.voice.bar.masterBar.tripletFeel !== TripletFeel.NoTripletFeel &&
            this._settings.player.playTripletFeel
        ) {
            if (this._currentTripletFeel) {
                beatStart -= this._currentTripletFeel.secondBeatStartOffset;
                audioDuration = this._currentTripletFeel.secondBeatDuration;
                this._currentTripletFeel = null;
            } else {
                this._currentTripletFeel = MidiFileGenerator.calculateTripletFeelInfo(beatStart, audioDuration, beat);
                if (this._currentTripletFeel) {
                    audioDuration = this._currentTripletFeel.firstBeatDuration;
                }
            }
        }

        const beatLookup: BeatTickLookup = new BeatTickLookup();
        beatLookup.start = barStartTick + beatStart;

        const realTickOffset: number = !beat.nextBeat
            ? audioDuration
            : beat.nextBeat.absolutePlaybackStart - beat.absolutePlaybackStart;
        beatLookup.end = barStartTick + beatStart;
        beatLookup.highlightBeat(beat);
        beatLookup.end += realTickOffset > audioDuration ? realTickOffset : audioDuration;

        // in case of normal playback register playback
        if (realBar === beat.voice.bar) {
            beatLookup.beat = beat;
            this.tickLookup.addBeat(beatLookup);
        } else {
            beatLookup.isEmptyBar = true;
            beatLookup.beat = realBar.voices[0].beats[0];
            if (!this._currentBarRepeatLookup) {
                this._currentBarRepeatLookup = beatLookup;
                this.tickLookup.addBeat(this._currentBarRepeatLookup);
            } else {
                this._currentBarRepeatLookup.end = beatLookup.end;
            }
        }

        const track: Track = beat.voice.bar.staff.track;
        for (const automation of beat.automations) {
            this.generateAutomation(beat, automation, barStartTick);
        }
        if (beat.isRest) {
            this._handler.addRest(track.index, barStartTick + beatStart, track.playbackInfo.primaryChannel);
        } else {
            let brushInfo: Int32Array = this.getBrushInfo(beat);
            for (const n of beat.notes) {
                this.generateNote(n, barStartTick + beatStart, audioDuration, brushInfo);
            }
        }

        if (beat.vibrato !== VibratoType.None) {
            let phaseLength: number = 240;
            let bendAmplitude: number = 3;
            switch (beat.vibrato) {
                case VibratoType.Slight:
                    phaseLength = this._settings.player.vibrato.beatSlightLength;
                    bendAmplitude = this._settings.player.vibrato.beatSlightAmplitude;
                    break;
                case VibratoType.Wide:
                    phaseLength = this._settings.player.vibrato.beatWideLength;
                    bendAmplitude = this._settings.player.vibrato.beatWideAmplitude;
                    break;
            }
            this.generateVibratorWithParams(
                beat.voice.bar.staff.track,
                barStartTick + beatStart,
                beat.playbackDuration,
                phaseLength,
                bendAmplitude,
                track.playbackInfo.secondaryChannel
            );
        }
    }

    private static calculateTripletFeelInfo(
        beatStart: number,
        audioDuration: number,
        beat: Beat
    ): TripletFeelDurations | null {
        let initialDuration: Duration;
        switch (beat.voice.bar.masterBar.tripletFeel) {
            case TripletFeel.Triplet8th:
            case TripletFeel.Dotted8th:
            case TripletFeel.Scottish8th:
                initialDuration = Duration.Eighth;
                break;
            case TripletFeel.Triplet16th:
            case TripletFeel.Dotted16th:
            case TripletFeel.Scottish16th:
                initialDuration = Duration.Sixteenth;
                break;
            default:
                // not possible
                return null;
        }

        const interval: number = MidiUtils.toTicks(initialDuration);

        // it must be a plain note with the expected duration
        // without dots, triplets, grace notes etc.
        if (audioDuration !== interval) {
            return null;
        }

        // check if the beat is aligned in respect to the duration
        // e.g. the eighth notes on a 4/4 time signature must start exactly on the following
        // times to get a triplet feel applied
        // 0 480 960 1440 1920 2400 2880 3360
        if (beatStart % interval !== 0) {
            return null;
        }

        // ensure next beat matches spec
        if (!beat.nextBeat || beat.nextBeat.voice !== beat.voice || beat.playbackDuration !== interval) {
            return null;
        }

        // looks like we have a triplet feel combination start here!
        const durations: TripletFeelDurations = new TripletFeelDurations();
        switch (beat.voice.bar.masterBar.tripletFeel) {
            case TripletFeel.Triplet8th:
                durations.firstBeatDuration = MidiUtils.applyTuplet(MidiUtils.toTicks(Duration.Quarter), 3, 2);
                durations.secondBeatDuration = MidiUtils.applyTuplet(MidiUtils.toTicks(Duration.Eighth), 3, 2);
                break;
            case TripletFeel.Dotted8th:
                durations.firstBeatDuration = MidiUtils.applyDot(MidiUtils.toTicks(Duration.Eighth), false);
                durations.secondBeatDuration = MidiUtils.toTicks(Duration.Sixteenth);
                break;
            case TripletFeel.Scottish8th:
                durations.firstBeatDuration = MidiUtils.toTicks(Duration.Sixteenth);
                durations.secondBeatDuration = MidiUtils.applyDot(MidiUtils.toTicks(Duration.Eighth), false);
                break;
            case TripletFeel.Triplet16th:
                durations.firstBeatDuration = MidiUtils.applyTuplet(MidiUtils.toTicks(Duration.Eighth), 3, 2);
                durations.secondBeatDuration = MidiUtils.applyTuplet(MidiUtils.toTicks(Duration.Sixteenth), 3, 2);
                break;
            case TripletFeel.Dotted16th:
                durations.firstBeatDuration = MidiUtils.applyDot(MidiUtils.toTicks(Duration.Sixteenth), false);
                durations.secondBeatDuration = MidiUtils.toTicks(Duration.ThirtySecond);
                break;
            case TripletFeel.Scottish16th:
                durations.firstBeatDuration = MidiUtils.toTicks(Duration.ThirtySecond);
                durations.secondBeatDuration = MidiUtils.applyDot(MidiUtils.toTicks(Duration.Sixteenth), false);
                break;
        }
        // calculate the number of ticks the second beat can start earlier
        durations.secondBeatStartOffset = audioDuration - durations.firstBeatDuration;
        return durations;
    }

    private generateNote(note: Note, beatStart: number, beatDuration: number, brushInfo: Int32Array): void {
        const track: Track = note.beat.voice.bar.staff.track;
        const staff: Staff = note.beat.voice.bar.staff;
        const noteKey: number = note.realValue;
        const brushOffset: number = note.isStringed && note.string <= brushInfo.length ? brushInfo[note.string - 1] : 0;
        const noteStart: number = beatStart + brushOffset;
        const noteDuration: MidiNoteDuration = this.getNoteDuration(note, beatDuration);
        noteDuration.untilTieEnd -= brushOffset;
        noteDuration.noteOnly -= brushOffset;
        noteDuration.letRingEnd -= brushOffset;
        const dynamicValue: DynamicValue = MidiFileGenerator.getDynamicValue(note);
        const channel: number =
            note.hasBend || note.beat.hasWhammyBar || note.beat.vibrato !== VibratoType.None
                ? track.playbackInfo.secondaryChannel
                : track.playbackInfo.primaryChannel;
        let initialBend: number = MidiFileGenerator.DefaultBend;

        if (note.hasBend) {
            initialBend += Math.round(note.bendPoints[0].value * MidiFileGenerator.DefaultBendSemitone);
        } else if (note.beat.hasWhammyBar) {
            initialBend += Math.round(note.beat.whammyBarPoints[0].value * MidiFileGenerator.DefaultBendSemitone);
        } else if (note.isTieDestination) {
            initialBend = 0;
        }
        if (initialBend > 0) {
            this._handler.addBend(track.index, noteStart, channel, initialBend);
        }

        //
        // Fade in
        if (note.beat.fadeIn) {
            this.generateFadeIn(note, noteStart, noteDuration);
        }

        //
        // Trill
        if (note.isTrill && !staff.isPercussion) {
            this.generateTrill(note, noteStart, noteDuration, noteKey, dynamicValue, channel);
            // no further generation needed
            return;
        }

        //
        // Tremolo Picking
        if (note.beat.isTremolo) {
            this.generateTremoloPicking(note, noteStart, noteDuration, noteKey, dynamicValue, channel);
            // no further generation needed
            return;
        }

        //
        // All String Bending/Variation effects
        if (note.hasBend) {
            this.generateBend(note, noteStart, noteDuration, channel);
        } else if (note.beat.hasWhammyBar && note.index === 0) {
            this.generateWhammy(note.beat, noteStart, noteDuration, channel);
        } else if (note.slideInType !== SlideInType.None || note.slideOutType !== SlideOutType.None) {
            // TODO GenerateSlide(note, noteStart, noteDuration, noteKey, dynamicValue, channel);
        } else if (note.vibrato !== VibratoType.None) {
            this.generateVibrato(note, noteStart, noteDuration, channel);
        }

        if (!note.isTieDestination) {
            let noteSoundDuration: number = Math.max(noteDuration.untilTieEnd, noteDuration.letRingEnd);
            this._handler.addNote(track.index, noteStart, noteSoundDuration, noteKey, dynamicValue, channel);
        }
    }

    private getNoteDuration(note: Note, duration: number): MidiNoteDuration {
        const durationWithEffects: MidiNoteDuration = new MidiNoteDuration();
        durationWithEffects.noteOnly = duration;
        durationWithEffects.untilTieEnd = duration;
        durationWithEffects.letRingEnd = duration;
        if (note.isDead) {
            durationWithEffects.noteOnly = this.applyStaticDuration(MidiFileGenerator.DefaultDurationDead, duration);
            durationWithEffects.untilTieEnd = durationWithEffects.noteOnly;
            durationWithEffects.letRingEnd = durationWithEffects.noteOnly;
            return durationWithEffects;
        }
        if (note.isPalmMute) {
            durationWithEffects.noteOnly = this.applyStaticDuration(
                MidiFileGenerator.DefaultDurationPalmMute,
                duration
            );
            durationWithEffects.untilTieEnd = durationWithEffects.noteOnly;
            durationWithEffects.letRingEnd = durationWithEffects.noteOnly;
            return durationWithEffects;
        }
        if (note.isStaccato) {
            durationWithEffects.noteOnly = (duration / 2) | 0;
            durationWithEffects.untilTieEnd = durationWithEffects.noteOnly;
            durationWithEffects.letRingEnd = durationWithEffects.noteOnly;
            return durationWithEffects;
        }
        if (note.isTieOrigin) {
            const endNote: Note = note.tieDestination!;
            // for the initial start of the tie calculate absolute duration from start to end note
            if (endNote) {
                if (!note.isTieDestination) {
                    const startTick: number = note.beat.absolutePlaybackStart;
                    const tieDestinationDuration: MidiNoteDuration = this.getNoteDuration(
                        endNote,
                        endNote.beat.playbackDuration
                    );
                    const endTick: number = endNote.beat.absolutePlaybackStart + tieDestinationDuration.untilTieEnd;
                    durationWithEffects.untilTieEnd = endTick - startTick;
                } else {
                    // for continuing ties, take the current duration + the one from the destination
                    // this branch will be entered as part of the recusion of the if branch
                    const tieDestinationDuration: MidiNoteDuration = this.getNoteDuration(
                        endNote,
                        endNote.beat.playbackDuration
                    );
                    durationWithEffects.untilTieEnd = duration + tieDestinationDuration.untilTieEnd;
                }
            }
        }

        if (note.isLetRing && this._settings.notation.notationMode === NotationMode.GuitarPro) {
            // LetRing ends when:
            // - rest
            let lastLetRingBeat: Beat = note.beat;
            let letRingEnd: number = 0;
            const maxDuration: number = note.beat.voice.bar.masterBar.calculateDuration();
            while (lastLetRingBeat.nextBeat) {
                let next: Beat = lastLetRingBeat.nextBeat;
                if (next.isRest) {
                    break;
                }
                // note on the same string
                if (note.isStringed && next.hasNoteOnString(note.string)) {
                    break;
                }
                lastLetRingBeat = lastLetRingBeat.nextBeat;
                letRingEnd =
                    lastLetRingBeat.absolutePlaybackStart -
                    note.beat.absolutePlaybackStart +
                    lastLetRingBeat.playbackDuration;
                if (letRingEnd > maxDuration) {
                    letRingEnd = maxDuration;
                    break;
                }
            }
            if (lastLetRingBeat === note.beat) {
                durationWithEffects.letRingEnd = duration;
            } else {
                durationWithEffects.letRingEnd = letRingEnd;
            }
        } else {
            durationWithEffects.letRingEnd = durationWithEffects.untilTieEnd;
        }
        return durationWithEffects;
    }

    private applyStaticDuration(duration: number, maximum: number): number {
        const value: number = ((this._currentTempo * duration) / BendPoint.MaxPosition) | 0;
        return Math.min(value, maximum);
    }

    private static getDynamicValue(note: Note): DynamicValue {
        let dynamicValue: DynamicValue = note.dynamics;
        // more silent on hammer destination
        if (!note.beat.voice.bar.staff.isPercussion && note.hammerPullOrigin) {
            dynamicValue--;
        }
        // more silent on ghost notes
        if (note.isGhost) {
            dynamicValue--;
        }
        // louder on accent
        switch (note.accentuated) {
            case AccentuationType.Normal:
                dynamicValue++;
                break;
            case AccentuationType.Heavy:
                dynamicValue += 2;
                break;
        }
        return dynamicValue;
    }

    private generateFadeIn(note: Note, noteStart: number, noteDuration: MidiNoteDuration): void {
        const track: Track = note.beat.voice.bar.staff.track;
        const endVolume: number = MidiFileGenerator.toChannelShort(track.playbackInfo.volume);
        const volumeFactor: number = endVolume / noteDuration.noteOnly;
        const tickStep: number = 120;
        const steps: number = (noteDuration.noteOnly / tickStep) | 0;
        const endTick: number = noteStart + noteDuration.noteOnly;
        for (let i: number = steps - 1; i >= 0; i--) {
            const tick: number = endTick - i * tickStep;
            const volume: number = (tick - noteStart) * volumeFactor;
            if (i === steps - 1) {
                this._handler.addControlChange(
                    track.index,
                    noteStart,
                    track.playbackInfo.primaryChannel,
                    ControllerType.VolumeCoarse,
                    volume
                );
                this._handler.addControlChange(
                    track.index,
                    noteStart,
                    track.playbackInfo.secondaryChannel,
                    ControllerType.VolumeCoarse,
                    volume
                );
            }
            this._handler.addControlChange(
                track.index,
                tick,
                track.playbackInfo.primaryChannel,
                ControllerType.VolumeCoarse,
                volume
            );
            this._handler.addControlChange(
                track.index,
                tick,
                track.playbackInfo.secondaryChannel,
                ControllerType.VolumeCoarse,
                volume
            );
        }
    }

    private generateVibrato(note: Note, noteStart: number, noteDuration: MidiNoteDuration, channel: number): void {
        let phaseLength: number = 0;
        let bendAmplitude: number = 0;
        switch (note.vibrato) {
            case VibratoType.Slight:
                phaseLength = this._settings.player.vibrato.noteSlightLength;
                bendAmplitude = this._settings.player.vibrato.noteSlightAmplitude;
                break;
            case VibratoType.Wide:
                phaseLength = this._settings.player.vibrato.noteWideLength;
                bendAmplitude = this._settings.player.vibrato.noteWideAmplitude;
                break;
            default:
                return;
        }
        const track: Track = note.beat.voice.bar.staff.track;
        this.generateVibratorWithParams(track, noteStart, noteDuration.noteOnly, phaseLength, bendAmplitude, channel);
    }

    private generateVibratorWithParams(
        track: Track,
        noteStart: number,
        noteDuration: number,
        phaseLength: number,
        bendAmplitude: number,
        channel: number
    ): void {
        const resolution: number = 16;
        const phaseHalf: number = (phaseLength / 2) | 0;
        // 1st Phase stays at bend 0,
        // then we have a sine wave with the given amplitude and phase length
        noteStart += phaseLength;
        const noteEnd: number = noteStart + noteDuration;
        while (noteStart < noteEnd) {
            let phase: number = 0;
            const phaseDuration: number = noteStart + phaseLength < noteEnd ? phaseLength : noteEnd - noteStart;
            while (phase < phaseDuration) {
                let bend: number = bendAmplitude * Math.sin((phase * Math.PI) / phaseHalf);
                this._handler.addBend(
                    track.index,
                    (noteStart + phase) | 0,
                    channel,
                    MidiFileGenerator.DefaultBend + bend
                );
                phase += resolution;
            }
            noteStart += phaseLength;
        }
    }

    private static readonly DefaultBend: number = 0x20;
    private static readonly DefaultBendSemitone: number = 2.75;

    private generateBend(note: Note, noteStart: number, noteDuration: MidiNoteDuration, channel: number): void {
        let bendPoints: BendPoint[] = note.bendPoints;
        let track: Track = note.beat.voice.bar.staff.track;
        // if bend is extended on next tied note, we directly bend to the final bend value
        let finalBendValue: number | null = null;
        // Bends are spread across all tied notes unless they have a bend on their own.
        let duration: number;
        if (note.isTieOrigin && this._settings.notation.extendBendArrowsOnTiedNotes) {
            let endNote: Note = note;
            while (endNote.isTieOrigin && !endNote.tieDestination!.hasBend) {
                endNote = endNote.tieDestination!;
            }
            duration =
                endNote.beat.absolutePlaybackStart -
                note.beat.absolutePlaybackStart +
                this.getNoteDuration(endNote, endNote.beat.playbackDuration).noteOnly;
        } else if (note.isTieOrigin && note.beat.graceType !== GraceType.None) {
            switch (note.tieDestination!.bendType) {
                case BendType.Bend:
                case BendType.BendRelease:
                case BendType.PrebendBend:
                    finalBendValue = note.tieDestination!.bendPoints[1].value;
                    break;
                case BendType.Prebend:
                case BendType.PrebendRelease:
                    finalBendValue = note.tieDestination!.bendPoints[0].value;
                    break;
            }
            duration = Math.max(
                noteDuration.noteOnly,
                MidiUtils.millisToTicks(this._settings.player.songBookBendDuration, this._currentTempo)
            );
        } else {
            duration = noteDuration.noteOnly;
        }
        // ensure prebends are slightly before the actual note.
        if (bendPoints[0].value > 0 && !note.isContinuedBend) {
            noteStart--;
        }
        const bendDuration: number = Math.min(
            duration,
            MidiUtils.millisToTicks(this._settings.player.songBookBendDuration, this._currentTempo)
        );
        let playedBendPoints: BendPoint[] = [];
        switch (note.bendType) {
            case BendType.Custom:
                playedBendPoints = bendPoints;
                break;
            case BendType.Bend:
            case BendType.Release:
                switch (note.bendStyle) {
                    case BendStyle.Default:
                        playedBendPoints = bendPoints;
                        break;
                    case BendStyle.Gradual:
                        playedBendPoints.push(new BendPoint(0, note.bendPoints[0].value));
                        if (!finalBendValue || finalBendValue < note.bendPoints[1].value) {
                            finalBendValue = note.bendPoints[1].value;
                        }
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, finalBendValue));
                        break;
                    case BendStyle.Fast:
                        if (!finalBendValue || finalBendValue < note.bendPoints[1].value) {
                            finalBendValue = note.bendPoints[1].value;
                        }
                        if (note.beat.graceType === GraceType.BendGrace) {
                            this.generateSongBookWhammyOrBend(
                                noteStart,
                                channel,
                                duration,
                                track,
                                true,
                                new Int32Array([note.bendPoints[0].value, finalBendValue]),
                                bendDuration
                            );
                        } else {
                            this.generateSongBookWhammyOrBend(
                                noteStart,
                                channel,
                                duration,
                                track,
                                false,
                                new Int32Array([note.bendPoints[0].value, finalBendValue]),
                                bendDuration
                            );
                        }
                        return;
                }
                break;
            case BendType.BendRelease:
                switch (note.bendStyle) {
                    case BendStyle.Default:
                        playedBendPoints = bendPoints;
                        break;
                    case BendStyle.Gradual:
                        playedBendPoints.push(new BendPoint(0, note.bendPoints[0].value));
                        playedBendPoints.push(new BendPoint((BendPoint.MaxPosition / 2) | 0, note.bendPoints[1].value));
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, note.bendPoints[2].value));
                        break;
                    case BendStyle.Fast:
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            channel,
                            duration,
                            track,
                            false,
                            new Int32Array([
                                note.bendPoints[0].value,
                                note.bendPoints[1].value,
                                note.bendPoints[2].value
                            ]),
                            bendDuration
                        );
                        return;
                }
                break;
            case BendType.Hold:
                playedBendPoints = bendPoints;
                break;
            case BendType.Prebend:
                playedBendPoints = bendPoints;
                break;
            case BendType.PrebendBend:
                switch (note.bendStyle) {
                    case BendStyle.Default:
                        playedBendPoints = bendPoints;
                        break;
                    case BendStyle.Gradual:
                        playedBendPoints.push(new BendPoint(0, note.bendPoints[0].value));
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, note.bendPoints[1].value));
                        break;
                    case BendStyle.Fast:
                        const preBendValue: number =
                            MidiFileGenerator.DefaultBend +
                            note.bendPoints[0].value * MidiFileGenerator.DefaultBendSemitone;
                        this._handler.addBend(track.index, noteStart, channel, preBendValue | 0);
                        if (!finalBendValue || finalBendValue < note.bendPoints[1].value) {
                            finalBendValue = note.bendPoints[1].value;
                        }
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            channel,
                            duration,
                            track,
                            false,
                            new Int32Array([note.bendPoints[0].value, finalBendValue]),
                            bendDuration
                        );
                        return;
                }
                break;
            case BendType.PrebendRelease:
                switch (note.bendStyle) {
                    case BendStyle.Default:
                        playedBendPoints = bendPoints;
                        break;
                    case BendStyle.Gradual:
                        playedBendPoints.push(new BendPoint(0, note.bendPoints[0].value));
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, note.bendPoints[1].value));
                        break;
                    case BendStyle.Fast:
                        const preBendValue: number =
                            MidiFileGenerator.DefaultBend +
                            note.bendPoints[0].value * MidiFileGenerator.DefaultBendSemitone;
                        this._handler.addBend(track.index, noteStart, channel, preBendValue | 0);
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            channel,
                            duration,
                            track,
                            false,
                            new Int32Array([note.bendPoints[0].value, note.bendPoints[1].value]),
                            bendDuration
                        );
                        return;
                }
                break;
        }
        this.generateWhammyOrBend(noteStart, channel, duration, playedBendPoints, track);
    }

    private generateSongBookWhammyOrBend(
        noteStart: number,
        channel: number,
        duration: number,
        track: Track,
        bendAtBeginning: boolean,
        bendValues: Int32Array,
        bendDuration: number
    ): void {
        const startTick: number = bendAtBeginning ? noteStart : noteStart + duration - bendDuration;
        const ticksBetweenPoints: number = bendDuration / (bendValues.length - 1);
        for (let i: number = 0; i < bendValues.length - 1; i++) {
            const currentBendValue: number =
                MidiFileGenerator.DefaultBend + bendValues[i] * MidiFileGenerator.DefaultBendSemitone;
            const nextBendValue: number =
                MidiFileGenerator.DefaultBend + bendValues[i + 1] * MidiFileGenerator.DefaultBendSemitone;
            const tick: number = startTick + ticksBetweenPoints * i;
            this.generateBendValues(tick, channel, track, ticksBetweenPoints, currentBendValue, nextBendValue);
        }
    }

    private generateWhammy(beat: Beat, noteStart: number, noteDuration: MidiNoteDuration, channel: number): void {
        const bendPoints: BendPoint[] = beat.whammyBarPoints;
        const track: Track = beat.voice.bar.staff.track;
        const duration: number = noteDuration.noteOnly;
        // ensure prebends are slightly before the actual note.
        if (bendPoints[0].value > 0 && !beat.isContinuedWhammy) {
            noteStart--;
        }

        let playedBendPoints: BendPoint[] = [];
        switch (beat.whammyBarType) {
            case WhammyType.Custom:
                playedBendPoints = bendPoints;
                break;
            case WhammyType.Dive:
                switch (beat.whammyStyle) {
                    case BendStyle.Default:
                        playedBendPoints = bendPoints;
                        break;
                    case BendStyle.Gradual:
                        playedBendPoints.push(new BendPoint(0, bendPoints[0].value));
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, bendPoints[1].value));
                        break;
                    case BendStyle.Fast:
                        const whammyDuration: number = Math.min(
                            duration,
                            MidiUtils.millisToTicks(this._settings.player.songBookBendDuration, this._currentTempo)
                        );
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            channel,
                            duration,
                            track,
                            false,
                            new Int32Array([bendPoints[0].value, bendPoints[1].value]),
                            whammyDuration
                        );
                        return;
                }
                break;
            case WhammyType.Dip:
                switch (beat.whammyStyle) {
                    case BendStyle.Default:
                        playedBendPoints = bendPoints;
                        break;
                    case BendStyle.Gradual:
                        playedBendPoints.push(new BendPoint(0, bendPoints[0].value));
                        playedBendPoints.push(new BendPoint((BendPoint.MaxPosition / 2) | 0, bendPoints[1].value));
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, bendPoints[2].value));
                        break;
                    case BendStyle.Fast:
                        const whammyDuration: number = Math.min(
                            duration,
                            MidiUtils.millisToTicks(this._settings.player.songBookDipDuration, this._currentTempo)
                        );
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            channel,
                            duration,
                            track,
                            true,
                            new Int32Array([bendPoints[0].value, bendPoints[1].value, bendPoints[2].value]),
                            whammyDuration
                        );
                        return;
                }
                break;
            case WhammyType.Hold:
                playedBendPoints = bendPoints;
                break;
            case WhammyType.Predive:
                playedBendPoints = bendPoints;
                break;
            case WhammyType.PrediveDive:
                switch (beat.whammyStyle) {
                    case BendStyle.Default:
                        playedBendPoints = bendPoints;
                        break;
                    case BendStyle.Gradual:
                        playedBendPoints.push(new BendPoint(0, bendPoints[0].value));
                        playedBendPoints.push(new BendPoint((BendPoint.MaxPosition / 2) | 0, bendPoints[0].value));
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, bendPoints[1].value));
                        break;
                    case BendStyle.Fast:
                        const preDiveValue: number =
                            MidiFileGenerator.DefaultBend + bendPoints[0].value * MidiFileGenerator.DefaultBendSemitone;
                        this._handler.addBend(track.index, noteStart, channel, preDiveValue | 0);
                        const whammyDuration: number = Math.min(
                            duration,
                            MidiUtils.millisToTicks(this._settings.player.songBookBendDuration, this._currentTempo)
                        );
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            channel,
                            duration,
                            track,
                            false,
                            new Int32Array([bendPoints[0].value, bendPoints[1].value]),
                            whammyDuration
                        );
                        return;
                }
                break;
        }
        this.generateWhammyOrBend(noteStart, channel, duration, playedBendPoints, track);
    }

    private generateWhammyOrBend(
        noteStart: number,
        channel: number,
        duration: number,
        playedBendPoints: BendPoint[],
        track: Track
    ): void {
        const ticksPerPosition: number = duration / BendPoint.MaxPosition;
        for (let i: number = 0; i < playedBendPoints.length - 1; i++) {
            const currentPoint: BendPoint = playedBendPoints[i];
            const nextPoint: BendPoint = playedBendPoints[i + 1];
            // calculate the midi pitchbend values start and end values
            const currentBendValue: number =
                MidiFileGenerator.DefaultBend + currentPoint.value * MidiFileGenerator.DefaultBendSemitone;
            const nextBendValue: number =
                MidiFileGenerator.DefaultBend + nextPoint.value * MidiFileGenerator.DefaultBendSemitone;
            // how many midi ticks do we have to spend between this point and the next one?
            const ticksBetweenPoints: number = ticksPerPosition * (nextPoint.offset - currentPoint.offset);
            // we will generate one pitchbend message for each value
            // for this we need to calculate how many ticks to offset per value
            const tick: number = noteStart + ticksPerPosition * currentPoint.offset;
            this.generateBendValues(tick, channel, track, ticksBetweenPoints, currentBendValue, nextBendValue);
        }
    }

    private generateBendValues(
        currentTick: number,
        channel: number,
        track: Track,
        ticksBetweenPoints: number,
        currentBendValue: number,
        nextBendValue: number
    ): void {
        const ticksPerValue: number = ticksBetweenPoints / Math.abs(nextBendValue - currentBendValue);
        // bend up
        if (currentBendValue < nextBendValue) {
            while (currentBendValue <= nextBendValue) {
                this._handler.addBend(track.index, currentTick | 0, channel, Math.round(currentBendValue));
                currentBendValue++;
                currentTick += ticksPerValue;
            }
        } else if (currentBendValue > nextBendValue) {
            while (currentBendValue >= nextBendValue) {
                this._handler.addBend(track.index, currentTick | 0, channel, Math.round(currentBendValue));
                currentBendValue--;
                currentTick += ticksPerValue;
            }
        } else {
            this._handler.addBend(track.index, currentTick | 0, channel, Math.round(currentBendValue));
        }
    }

    private generateTrill(
        note: Note,
        noteStart: number,
        noteDuration: MidiNoteDuration,
        noteKey: number,
        dynamicValue: DynamicValue,
        channel: number
    ): void {
        const track: Track = note.beat.voice.bar.staff.track;
        const trillKey: number = note.stringTuning + note.trillFret;
        let trillLength: number = MidiUtils.toTicks(note.trillSpeed);
        let realKey: boolean = true;
        let tick: number = noteStart;
        let end: number = noteStart + noteDuration.untilTieEnd;
        while (tick + 10 < end) {
            // only the rest on last trill play
            if (tick + trillLength >= end) {
                trillLength = end - tick;
            }
            this._handler.addNote(track.index, tick, trillLength, realKey ? trillKey : noteKey, dynamicValue, channel);
            realKey = !realKey;
            tick += trillLength;
        }
    }

    private generateTremoloPicking(
        note: Note,
        noteStart: number,
        noteDuration: MidiNoteDuration,
        noteKey: number,
        dynamicValue: DynamicValue,
        channel: number
    ): void {
        const track: Track = note.beat.voice.bar.staff.track;
        let tpLength: number = MidiUtils.toTicks(note.beat.tremoloSpeed!);
        let tick: number = noteStart;
        const end: number = noteStart + noteDuration.untilTieEnd;
        while (tick + 10 < end) {
            // only the rest on last trill play
            if (tick + tpLength >= end) {
                tpLength = end - tick;
            }
            this._handler.addNote(track.index, tick, tpLength, noteKey, dynamicValue, channel);
            tick += tpLength;
        }
    }

    private getBrushInfo(beat: Beat): Int32Array {
        const brushInfo: Int32Array = new Int32Array(beat.voice.bar.staff.tuning.length);
        if (beat.brushType !== BrushType.None) {
            //
            // calculate the number of
            // a mask where the single bits indicate the strings used
            let stringUsed: number = 0;
            let stringCount: number = 0;
            for (const n of beat.notes) {
                if (n.isTieDestination) {
                    continue;
                }
                stringUsed |= 0x01 << (n.string - 1);
                stringCount++;
            }
            //
            // calculate time offset for all strings
            if (beat.notes.length > 0) {
                let brushMove: number = 0;
                const brushIncrement: number = (beat.brushDuration / (stringCount - 1)) | 0;
                for (let i: number = 0; i < beat.voice.bar.staff.tuning.length; i++) {
                    let index: number =
                        beat.brushType === BrushType.ArpeggioDown || beat.brushType === BrushType.BrushDown
                            ? i
                            : brushInfo.length - 1 - i;
                    if ((stringUsed & (0x01 << index)) !== 0) {
                        brushInfo[index] = brushMove;
                        brushMove += brushIncrement;
                    }
                }
            }
        }
        return brushInfo;
    }

    private generateAutomation(beat: Beat, automation: Automation, startMove: number): void {
        switch (automation.type) {
            case AutomationType.Instrument:
                this._handler.addProgramChange(
                    beat.voice.bar.staff.track.index,
                    beat.playbackStart + startMove,
                    beat.voice.bar.staff.track.playbackInfo.primaryChannel,
                    (automation.value | 0) & 0xff
                );
                this._handler.addProgramChange(
                    beat.voice.bar.staff.track.index,
                    beat.playbackStart + startMove,
                    beat.voice.bar.staff.track.playbackInfo.secondaryChannel,
                    (automation.value | 0) & 0xff
                );
                break;
            case AutomationType.Balance:
                let balance: number = MidiFileGenerator.toChannelShort(automation.value);
                this._handler.addControlChange(
                    beat.voice.bar.staff.track.index,
                    beat.playbackStart + startMove,
                    beat.voice.bar.staff.track.playbackInfo.primaryChannel,
                    ControllerType.PanCoarse,
                    balance
                );
                this._handler.addControlChange(
                    beat.voice.bar.staff.track.index,
                    beat.playbackStart + startMove,
                    beat.voice.bar.staff.track.playbackInfo.secondaryChannel,
                    ControllerType.PanCoarse,
                    balance
                );
                break;
            case AutomationType.Volume:
                let volume: number = MidiFileGenerator.toChannelShort(automation.value);
                this._handler.addControlChange(
                    beat.voice.bar.staff.track.index,
                    beat.playbackStart + startMove,
                    beat.voice.bar.staff.track.playbackInfo.primaryChannel,
                    ControllerType.VolumeCoarse,
                    volume
                );
                this._handler.addControlChange(
                    beat.voice.bar.staff.track.index,
                    beat.playbackStart + startMove,
                    beat.voice.bar.staff.track.playbackInfo.secondaryChannel,
                    ControllerType.VolumeCoarse,
                    volume
                );
                break;
        }
    }
}
