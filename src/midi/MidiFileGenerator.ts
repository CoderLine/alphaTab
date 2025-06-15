import { ControllerType } from '@src/midi/ControllerType';
import type { IMidiFileHandler } from '@src/midi/IMidiFileHandler';

import { MidiPlaybackController } from '@src/midi/MidiPlaybackController';
import { MasterBarTickLookup, MasterBarTickLookupTempoChange } from '@src/midi/MasterBarTickLookup';
import { MidiTickLookup } from '@src/midi/MidiTickLookup';

import { MidiUtils } from '@src/midi/MidiUtils';
import { AccentuationType } from '@src/model/AccentuationType';
import { type Automation, AutomationType } from '@src/model/Automation';
import type { Bar } from '@src/model/Bar';
import type { Beat } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import { Duration } from '@src/model/Duration';
import { GraceType } from '@src/model/GraceType';
import type { MasterBar } from '@src/model/MasterBar';
import type { Note } from '@src/model/Note';
import type { PlaybackInformation } from '@src/model/PlaybackInformation';
import type { Score } from '@src/model/Score';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import type { Staff } from '@src/model/Staff';
import type { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { VibratoType } from '@src/model/VibratoType';
import type { Voice } from '@src/model/Voice';
import { WhammyType } from '@src/model/WhammyType';
import { NotationMode } from '@src/NotationSettings';
import { Settings } from '@src/Settings';

import { Logger } from '@src/Logger';
import { SynthConstants } from '@src/synth/SynthConstants';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { DynamicValue } from '@src/model/DynamicValue';
import { FadeType } from '@src/model/FadeType';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Rasgueado } from '@src/model/Rasgueado';
import { BackingTrackSyncPoint } from '@src/synth/IAlphaSynth';

export class MidiNoteDuration {
    public noteOnly: number = 0;
    public untilTieOrSlideEnd: number = 0;
    public letRingEnd: number = 0;
}

class TripletFeelDurations {
    public firstBeatDuration: number = 0;
    public secondBeatStartOffset: number = 0;
    public secondBeatDuration: number = 0;
}

class RasgueadoInfo {
    public durations: number[] = [];
    public brushInfos: Int32Array[] = [];
}

class PlayThroughContext {
    public synthTick: number = 0;
    public synthTime: number = 0;
    public currentTempo: number = 0;
    public automationToSyncPoint: Map<Automation, BackingTrackSyncPoint> = new Map<Automation, BackingTrackSyncPoint>();
    public syncPoints!: BackingTrackSyncPoint[];
    public createNewSyncPoints: boolean = false;
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
    private _programsPerChannel: Map<number, number> = new Map<number, number>();

    private _currentTime: number = 0;
    private _calculatedBeatTimers: Set<number> = new Set<number>();

    /**
     * Gets a lookup object which can be used to quickly find beats and bars
     * at a given midi tick position.
     */
    public readonly tickLookup: MidiTickLookup = new MidiTickLookup();

    /**
     * Gets or sets whether transposition pitches should be applied to the individual midi events or not.
     */
    public applyTranspositionPitches: boolean = true;

    /**
     * The computed sync points for synchronizing the midi file with an external backing track.
     */
    public syncPoints: BackingTrackSyncPoint[] = [];

    /**
     * Gets the transposition pitches for the individual midi channels.
     */
    public readonly transpositionPitches: Map<number, number> = new Map<number, number>();

    /**
     * Initializes a new instance of the {@link MidiFileGenerator} class.
     * @param score The score for which the midi file should be generated.
     * @param settings The settings ot use for generation.
     * @param handler The handler that should be used for generating midi events.
     */
    public constructor(score: Score, settings: Settings | null, handler: IMidiFileHandler) {
        this._score = score;
        this._settings = !settings ? new Settings() : settings;
        this._handler = handler;
    }

    /**
     * Starts the generation of the midi file.
     */
    public generate(): void {
        this.transpositionPitches.clear();
        this._calculatedBeatTimers.clear();
        this._currentTime = 0;

        // initialize tracks
        for (const track of this._score.tracks) {
            this.generateTrack(track);
        }

        Logger.debug('Midi', 'Begin midi generation');

        this.syncPoints = [];
        MidiFileGenerator.playThroughSong(
            this._score,
            this.syncPoints,
            false,
            (bar, previousMasterBar, currentTick, currentTempo, occurence) => {
                this.generateMasterBar(bar, previousMasterBar, currentTick, currentTempo, occurence);
            },
            (index, currentTick, currentTempo) => {
                for (const track of this._score.tracks) {
                    for (const staff of track.staves) {
                        if (index < staff.bars.length) {
                            this.generateBar(staff.bars[index], currentTick, currentTempo);
                        }
                    }
                }
            },
            endTick => {
                for (const track of this._score.tracks) {
                    this._handler.finishTrack(track.index, endTick);
                }
            }
        );

        Logger.debug('Midi', 'Midi generation done');
    }

    private generateTrack(track: Track): void {
        // channel
        this.generateChannel(track, track.playbackInfo.primaryChannel, track.playbackInfo);
        if (track.playbackInfo.primaryChannel !== track.playbackInfo.secondaryChannel) {
            this.generateChannel(track, track.playbackInfo.secondaryChannel, track.playbackInfo);
        }
    }

    private addProgramChange(track: Track, tick: number, channel: number, program: number) {
        if (!this._programsPerChannel.has(channel) || this._programsPerChannel.get(channel) !== program) {
            this._handler.addProgramChange(track.index, tick, channel, program);
            this._programsPerChannel.set(channel, program);
        }
    }

    public static buildTranspositionPitches(score: Score, settings: Settings): Map<number, number> {
        const transpositionPitches = new Map<number, number>();
        for (const track of score.tracks) {
            const transpositionPitch =
                track.index < settings.notation.transpositionPitches.length
                    ? settings.notation.transpositionPitches[track.index]
                    : -track.staves[0].transpositionPitch;
            transpositionPitches.set(track.playbackInfo.primaryChannel, transpositionPitch);
            transpositionPitches.set(track.playbackInfo.secondaryChannel, transpositionPitch);
        }
        return transpositionPitches;
    }

    private generateChannel(track: Track, channel: number, playbackInfo: PlaybackInformation): void {
        const transpositionPitch =
            track.index < this._settings.notation.transpositionPitches.length
                ? this._settings.notation.transpositionPitches[track.index]
                : -track.staves[0].transpositionPitch;
        this.transpositionPitches.set(channel, transpositionPitch);

        const volume: number = MidiFileGenerator.toChannelShort(playbackInfo.volume);
        const balance: number = MidiFileGenerator.toChannelShort(playbackInfo.balance);
        this._handler.addControlChange(track.index, 0, channel, ControllerType.VolumeCoarse, volume);
        this._handler.addControlChange(track.index, 0, channel, ControllerType.PanCoarse, balance);
        this._handler.addControlChange(track.index, 0, channel, ControllerType.ExpressionControllerCoarse, 127);

        // set parameter that is being updated (0) -> PitchBendRangeCoarse
        this._handler.addControlChange(track.index, 0, channel, ControllerType.RegisteredParameterFine, 0);
        this._handler.addControlChange(track.index, 0, channel, ControllerType.RegisteredParameterCourse, 0);

        // Set PitchBendRangeCoarse to 12
        this._handler.addControlChange(track.index, 0, channel, ControllerType.DataEntryFine, 0);
        this._handler.addControlChange(
            track.index,
            0,
            channel,
            ControllerType.DataEntryCoarse,
            MidiFileGenerator.PitchBendRangeInSemitones
        );
        this.addProgramChange(track, 0, channel, playbackInfo.program);
    }

    /**
     * Generates the sync points for the given score without re-generating the midi itself.
     * @remarks
     * Use this method if a re-generation of the sync points after modification is required.
     * It correctly handles repeats and places sync points accoridng to their absolute midi tick when they
     * need to be considered for synchronization.
     * @param score The song for which to regenerate the sync points.
     * @param createNew Whether a new set of sync points should be generated for the sync (start, stop and tempo changes).
     * @returns The generated sync points for usage in the backing track playback.
     */
    public static generateSyncPoints(score: Score, createNew: boolean = false): BackingTrackSyncPoint[] {
        const syncPoints: BackingTrackSyncPoint[] = [];

        MidiFileGenerator.playThroughSong(
            score,
            syncPoints,
            createNew,
            (_masterBar, _previousMasterBar, _currentTick, _currentTempo, _barOccurence) => {
                // no generation
            },
            (_barIndex, _currentTick, _currentTempo) => {
                // no generation
            },
            _endTick => {
                // no generation
            }
        );

        return syncPoints;
    }

    /**
     * @internal
     */
    public static buildModifiedTempoLookup(score: Score): Map<Automation, BackingTrackSyncPoint> {
        const syncPoints: BackingTrackSyncPoint[] = [];

        const context = MidiFileGenerator.playThroughSong(
            score,
            syncPoints,
            false,
            (_masterBar, _previousMasterBar, _currentTick, _currentTempo, _barOccurence) => {
                // no generation
            },
            (_barIndex, _currentTick, _currentTempo) => {
                // no generation
            },
            _endTick => {
                // no generation
            }
        );

        return context.automationToSyncPoint;
    }

    private static playThroughSong(
        score: Score,
        syncPoints: BackingTrackSyncPoint[],
        createNewSyncPoints: boolean,
        generateMasterBar: (
            masterBar: MasterBar,
            previousMasterBar: MasterBar | null,
            currentTick: number,
            currentTempo: number,
            barOccurence: number
        ) => void,
        generateTracks: (barIndex: number, currentTick: number, currentTempo: number) => void,
        finish: (endTick: number) => void
    ) {
        const controller: MidiPlaybackController = new MidiPlaybackController(score);

        const playContext = new PlayThroughContext();
        playContext.currentTempo = score.tempo;
        playContext.syncPoints = syncPoints;
        playContext.createNewSyncPoints = createNewSyncPoints;
        let previousMasterBar: MasterBar | null = null;

        // store the previous played bar for repeats
        const barOccurence = new Map<number, number>();
        while (!controller.finished) {
            const index: number = controller.index;
            const bar: MasterBar = score.masterBars[index];
            const currentTick: number = controller.currentTick;
            controller.processCurrent();

            if (controller.shouldPlay) {
                let occurence = barOccurence.has(index) ? barOccurence.get(index)! : -1;
                occurence++;
                barOccurence.set(index, occurence);

                generateMasterBar(bar, previousMasterBar, currentTick, playContext.currentTempo, occurence);

                const trackTempo =
                    bar.tempoAutomations.length > 0 ? bar.tempoAutomations[0].value : playContext.currentTempo;
                generateTracks(index, currentTick, trackTempo);

                playContext.synthTick = currentTick;
                MidiFileGenerator.processBarTime(bar, occurence, playContext);
            }

            controller.moveNext();
            previousMasterBar = bar;
        }

        // here we interpolate the sync point which marks the end of the sync.
        // Sync points define new tempos at certain positions.
        // looking from the last sync point to the end we do not assume the end where the audio ends,
        // but where it ends according to the BPM and the remaining ticks.
        if (syncPoints.length > 0) {
            const lastSyncPoint = syncPoints[syncPoints.length - 1];
            const remainingTicks = controller.currentTick - lastSyncPoint.synthTick;
            if (remainingTicks > 0) {
                const backingTrackSyncPoint = new BackingTrackSyncPoint();
                backingTrackSyncPoint.masterBarIndex = previousMasterBar!.index;
                backingTrackSyncPoint.masterBarOccurence = barOccurence.get(previousMasterBar!.index)! - 1;
                backingTrackSyncPoint.synthTick = controller.currentTick;
                backingTrackSyncPoint.synthBpm = playContext.currentTempo;

                // we need to assume some BPM for the last interpolated point.
                // if we have more than just a start point, we keep the BPM before the last manual sync point
                // otherwise we have no customized sync BPM known and keep the synthesizer one.
                if (playContext.createNewSyncPoints) {
                    backingTrackSyncPoint.syncBpm = lastSyncPoint.synthBpm;
                    backingTrackSyncPoint.synthBpm = lastSyncPoint.synthBpm;
                } else if (syncPoints.length === 1) {
                    backingTrackSyncPoint.syncBpm = lastSyncPoint.synthBpm;
                } else {
                    backingTrackSyncPoint.syncBpm = syncPoints[syncPoints.length - 2].syncBpm;
                }

                backingTrackSyncPoint.synthTime =
                    lastSyncPoint.synthTime + MidiUtils.ticksToMillis(remainingTicks, lastSyncPoint.synthBpm);
                backingTrackSyncPoint.syncTime =
                    lastSyncPoint.syncTime + MidiUtils.ticksToMillis(remainingTicks, backingTrackSyncPoint.syncBpm);

                // update the previous sync point according to the new time
                if (!playContext.createNewSyncPoints) {
                    lastSyncPoint.updateSyncBpm(backingTrackSyncPoint.synthTime, backingTrackSyncPoint.syncTime);
                }

                syncPoints.push(backingTrackSyncPoint);
            }
        }

        finish(controller.currentTick);

        return playContext;
    }

    private static processBarTime(bar: MasterBar, occurence: number, context: PlayThroughContext) {
        const duration = bar.calculateDuration();
        const barSyncPoints = bar.syncPoints;
        const barStartTick = context.synthTick;
        if (context.createNewSyncPoints) {
            MidiFileGenerator.processBarTimeWithNewSyncPoints(bar, occurence, context);
        } else if (barSyncPoints) {
            MidiFileGenerator.processBarTimeWithSyncPoints(bar, occurence, context);
        } else {
            MidiFileGenerator.processBarTimeNoSyncPoints(bar, context);
        }

        // don't forget the part after the last tempo change
        const endTick = barStartTick + duration;
        const tickOffset = endTick - context.synthTick;
        if (tickOffset > 0) {
            context.synthTime += MidiUtils.ticksToMillis(tickOffset, context.currentTempo);
            context.synthTick = endTick;
        }
    }

    private static processBarTimeWithNewSyncPoints(bar: MasterBar, occurence: number, context: PlayThroughContext) {
        // start marker
        const barStartTick = context.synthTick;
        if (bar.index === 0 && occurence === 0) {
            context.currentTempo = bar.score.tempo;

            const backingTrackSyncPoint = new BackingTrackSyncPoint();
            backingTrackSyncPoint.masterBarIndex = bar.index;
            backingTrackSyncPoint.masterBarOccurence = occurence;
            backingTrackSyncPoint.synthTick = barStartTick;
            backingTrackSyncPoint.synthBpm = context.currentTempo;
            backingTrackSyncPoint.synthTime = context.synthTime;
            backingTrackSyncPoint.syncBpm = context.currentTempo;
            backingTrackSyncPoint.syncTime = context.synthTime;

            context.syncPoints.push(backingTrackSyncPoint);
        }

        // walk tempo changes and create points
        const duration = bar.calculateDuration();
        for (const change of bar.tempoAutomations) {
            const absoluteTick = barStartTick + change.ratioPosition * duration;
            const tickOffset = absoluteTick - context.synthTick;
            if (tickOffset > 0) {
                context.synthTick = absoluteTick;
                context.synthTime += MidiUtils.ticksToMillis(tickOffset, context.currentTempo);
            }

            if (change.value !== context.currentTempo) {
                context.currentTempo = change.value;

                const backingTrackSyncPoint = new BackingTrackSyncPoint();
                backingTrackSyncPoint.masterBarIndex = bar.index;
                backingTrackSyncPoint.masterBarOccurence = occurence;
                backingTrackSyncPoint.synthTick = absoluteTick;
                backingTrackSyncPoint.synthBpm = context.currentTempo;
                backingTrackSyncPoint.synthTime = context.synthTime;
                backingTrackSyncPoint.syncBpm = context.currentTempo;
                backingTrackSyncPoint.syncTime = context.synthTime;

                context.syncPoints.push(backingTrackSyncPoint);
            }
        }
    }

    private static processBarTimeWithSyncPoints(bar: MasterBar, occurence: number, context: PlayThroughContext) {
        const barStartTick = context.synthTick;
        const duration = bar.calculateDuration();

        let tempoChangeIndex = 0;
        let tickOffset: number;

        for (const syncPoint of bar.syncPoints!) {
            if (syncPoint.syncPointValue!.barOccurence !== occurence) {
                continue;
            }

            const syncPointTick = barStartTick + syncPoint.ratioPosition * duration;

            // first process all tempo changes until this sync point
            while (
                tempoChangeIndex < bar.tempoAutomations.length &&
                bar.tempoAutomations[tempoChangeIndex].ratioPosition <= syncPoint.ratioPosition
            ) {
                const tempoChange = bar.tempoAutomations[tempoChangeIndex];
                const absoluteTick = barStartTick + tempoChange.ratioPosition * duration;
                tickOffset = absoluteTick - context.synthTick;

                if (tickOffset > 0) {
                    context.synthTick = absoluteTick;
                    context.synthTime += MidiUtils.ticksToMillis(tickOffset, context.currentTempo);
                }

                context.currentTempo = tempoChange.value;
                tempoChangeIndex++;
            }

            // process time until sync point
            tickOffset = syncPointTick - context.synthTick;
            if (tickOffset > 0) {
                context.synthTick = syncPointTick;
                context.synthTime += MidiUtils.ticksToMillis(tickOffset, context.currentTempo);
            }

            // update the previous sync point according to the new time
            if (context.syncPoints.length > 0) {
                context.syncPoints[context.syncPoints.length - 1].updateSyncBpm(
                    context.synthTime,
                    syncPoint.syncPointValue!.millisecondOffset
                );
            }

            // create the new sync point
            const backingTrackSyncPoint = new BackingTrackSyncPoint();
            backingTrackSyncPoint.masterBarIndex = bar.index;
            backingTrackSyncPoint.masterBarOccurence = occurence;
            backingTrackSyncPoint.synthTick = syncPointTick;
            backingTrackSyncPoint.synthBpm = context.currentTempo;
            backingTrackSyncPoint.synthTime = context.synthTime;
            backingTrackSyncPoint.syncTime = syncPoint.syncPointValue!.millisecondOffset;
            backingTrackSyncPoint.syncBpm = 0 /* calculated by next sync point */;

            context.syncPoints.push(backingTrackSyncPoint);
            context.automationToSyncPoint.set(syncPoint, backingTrackSyncPoint);
        }

        // process remaining tempo changes after all sync points
        while (tempoChangeIndex < bar.tempoAutomations.length) {
            const tempoChange = bar.tempoAutomations[tempoChangeIndex];
            const absoluteTick = barStartTick + tempoChange.ratioPosition * duration;
            tickOffset = absoluteTick - context.synthTick;
            if (tickOffset > 0) {
                context.synthTick = absoluteTick;
                context.synthTime += MidiUtils.ticksToMillis(tickOffset, context.currentTempo);
            }

            context.currentTempo = tempoChange.value;
            tempoChangeIndex++;
        }
    }

    private static processBarTimeNoSyncPoints(bar: MasterBar, context: PlayThroughContext) {
        // walk through the tempo changes
        const barStartTick = context.synthTick;
        const duration = bar.calculateDuration();
        for (const changes of bar.tempoAutomations) {
            const absoluteTick = barStartTick + changes.ratioPosition * duration;
            const tickOffset = absoluteTick - context.synthTick;
            if (tickOffset > 0) {
                context.synthTick = absoluteTick;
                context.synthTime += MidiUtils.ticksToMillis(tickOffset, context.currentTempo);
            }

            context.currentTempo = changes.value;
        }
    }

    private static toChannelShort(data: number): number {
        const value: number = Math.max(-32768, Math.min(32767, data * 8 - 1));
        return Math.max(value, -1) + 1;
    }

    private generateMasterBar(
        masterBar: MasterBar,
        previousMasterBar: MasterBar | null,
        currentTick: number,
        currentTempo: number,
        barOccurence: number
    ): void {
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

        const masterBarDuration = masterBar.calculateDuration();
        const masterBarLookup: MasterBarTickLookup = new MasterBarTickLookup();

        // tempo
        if (masterBar.tempoAutomations.length > 0) {
            if (masterBar.tempoAutomations[0].ratioPosition > 0) {
                masterBarLookup.tempoChanges.push(new MasterBarTickLookupTempoChange(currentTick, currentTempo));
            }

            for (const automation of masterBar.tempoAutomations) {
                const tick = currentTick + masterBarDuration * automation.ratioPosition;
                this._handler.addTempo(tick, automation.value);
                masterBarLookup.tempoChanges.push(new MasterBarTickLookupTempoChange(tick, automation.value));
            }
        } else if (!previousMasterBar) {
            this._handler.addTempo(currentTick, masterBar.score.tempo);
            masterBarLookup.tempoChanges.push(new MasterBarTickLookupTempoChange(currentTick, masterBar.score.tempo));
        } else {
            masterBarLookup.tempoChanges.push(new MasterBarTickLookupTempoChange(currentTick, currentTempo));
        }

        masterBarLookup.masterBar = masterBar;
        masterBarLookup.start = currentTick;
        masterBarLookup.end = masterBarLookup.start + masterBarDuration;
        this.tickLookup.addMasterBar(masterBarLookup);
    }

    private generateBar(bar: Bar, barStartTick: number, tempoOnBarStart: number): void {
        const playbackBar: Bar = this.getPlaybackBar(bar);

        const barStartTime = this._currentTime;
        for (const v of playbackBar.voices) {
            this._currentTime = barStartTime;
            this.generateVoice(v, barStartTick, bar, tempoOnBarStart);
        }

        // calculate the real bar end time (bars might be not full or overfilled)
        const masterBar = playbackBar.masterBar;
        const tickDuration = masterBar.calculateDuration();
        const tempoAutomations = masterBar.tempoAutomations.slice();
        if (tempoAutomations.length === 0) {
            // fast path: no tempo automations -> simply apply whole duration
            this._currentTime = barStartTime + MidiUtils.ticksToMillis(tickDuration, tempoOnBarStart);
        } else {
            // slow path: loop through slices and advance time
            this._currentTime = barStartTime;

            let currentTick = barStartTick;
            let currentTempo = tempoOnBarStart;

            const endTick = barStartTick + tickDuration;

            for (const automation of tempoAutomations) {
                // calculate the tick difference to the next tempo automation
                const automationTick = tickDuration * automation.ratioPosition;
                const diff = automationTick - currentTick;

                // apply the time
                if (diff > 0) {
                    this._currentTime += MidiUtils.ticksToMillis(diff, currentTempo);
                }

                // apply automation advance time
                currentTempo = automation.value;
                currentTick += diff;
            }

            // apply time until end
            const remainingTick = endTick - currentTick;
            if (remainingTick > 0) {
                this._currentTime += MidiUtils.ticksToMillis(remainingTick, currentTempo);
            }
        }

        // in case of simile marks where we repeat we register the empty beat for the whole bar
        if (playbackBar.id !== bar.id) {
            this.tickLookup.addBeat(bar.voices[0].beats[0], 0, tickDuration);
            //this.tickLookup.addBeat(beat, 0, audioDuration);
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

    private generateVoice(voice: Voice, barStartTick: number, realBar: Bar, tempoOnVoiceStart: number): void {
        if (voice.isEmpty && (!voice.bar.isEmpty || voice.index !== 0)) {
            return;
        }

        const remainingBarTempoAutomations = realBar.masterBar.tempoAutomations.slice();
        let tempoOnBeatStart = tempoOnVoiceStart;

        const barDuration = realBar.masterBar.calculateDuration();

        for (const b of voice.beats) {
            const ratio = b.playbackStart / barDuration;

            while (remainingBarTempoAutomations.length > 0 && remainingBarTempoAutomations[0].ratioPosition <= ratio) {
                tempoOnBeatStart = remainingBarTempoAutomations.shift()!.value;
            }

            this.generateBeat(b, barStartTick, realBar, tempoOnBeatStart);
        }
    }

    private _currentTripletFeel: TripletFeelDurations | null = null;

    private generateBeat(beat: Beat, barStartTick: number, realBar: Bar, tempoOnBeatStart: number): void {
        let beatStart: number = beat.playbackStart;
        let audioDuration: number = beat.playbackDuration;
        const masterBarDuration = beat.voice.bar.masterBar.calculateDuration();

        if (beat.voice.bar.isEmpty) {
            audioDuration = masterBarDuration;
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

        if (beat.showTimer && !this._calculatedBeatTimers.has(beat.id)) {
            beat.timer = this._currentTime;
            this._calculatedBeatTimers.add(beat.id);
        }
        this._currentTime += MidiUtils.ticksToMillis(audioDuration, tempoOnBeatStart);

        // in case of normal playback register playback
        if (realBar === beat.voice.bar) {
            this.tickLookup.addBeat(beat, beatStart, audioDuration);
        }

        const track: Track = beat.voice.bar.staff.track;
        for (const automation of beat.automations) {
            this.generateNonTempoAutomation(beat, automation, barStartTick);
        }
        if (beat.isRest) {
            this._handler.addRest(track.index, barStartTick + beatStart, track.playbackInfo.primaryChannel);
        } else if (beat.deadSlapped) {
            this.generateDeadSlap(beat, barStartTick + beatStart);
        } else {
            const brushInfo = this.getBrushInfo(beat);
            const rasgueadoInfo = this.getRasgueadoInfo(beat, audioDuration);
            for (const n of beat.notes) {
                this.generateNote(
                    n,
                    barStartTick + beatStart,
                    audioDuration,
                    tempoOnBeatStart,
                    brushInfo,
                    rasgueadoInfo
                );
            }
        }

        if (beat.fade !== FadeType.None) {
            this.generateFade(beat, barStartTick + beatStart, audioDuration);
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
                barStartTick + beatStart,
                beat.playbackDuration,
                phaseLength,
                0,
                bendAmplitude,
                (tick, value) => {
                    this._handler.addBend(
                        beat.voice.bar.staff.track.index,
                        tick,
                        track.playbackInfo.secondaryChannel,
                        value
                    );
                }
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

    private generateDeadSlap(beat: Beat, beatStart: number): void {
        // we generate dead-slap as 64th note on all strings (0 fret)
        const deadSlapDuration = MidiUtils.toTicks(Duration.SixtyFourth);
        const staff = beat.voice.bar.staff;
        if (staff.tuning.length > 0) {
            for (const t of staff.tuning) {
                this._handler.addNote(
                    staff.track.index,
                    beatStart,
                    deadSlapDuration,
                    t,
                    MidiUtils.dynamicToVelocity(DynamicValue.F),
                    staff.track.playbackInfo.primaryChannel
                );
            }
        }
    }

    private needsSecondaryChannel(note: Note): boolean {
        return note.hasBend || note.beat.hasWhammyBar || note.beat.vibrato !== VibratoType.None;
    }
    private determineChannel(track: Track, note: Note): number {
        // on certain effects we use the secondary channel to avoid interference with other notes
        if (this.needsSecondaryChannel(note)) {
            return track.playbackInfo.secondaryChannel;
        }

        // walk back to tie chain to see if any note needs the secondary channel
        let currentNote = note;
        while (currentNote.isTieDestination) {
            currentNote = currentNote.tieOrigin!;
            if (this.needsSecondaryChannel(currentNote)) {
                return track.playbackInfo.secondaryChannel;
            }
        }

        // walk forward to tie chain to see if any note needs the secondary channel
        currentNote = note;
        while (currentNote.isTieOrigin) {
            currentNote = currentNote.tieDestination!;
            if (this.needsSecondaryChannel(currentNote)) {
                return track.playbackInfo.secondaryChannel;
            }
        }

        // can stay on primary channel
        return track.playbackInfo.primaryChannel;
    }

    private generateNote(
        note: Note,
        beatStart: number,
        beatDuration: number,
        tempoOnBeatStart: number,
        brushInfo: Int32Array,
        rasgueadoInfo: RasgueadoInfo | null
    ): void {
        const track: Track = note.beat.voice.bar.staff.track;
        const staff: Staff = note.beat.voice.bar.staff;
        let noteKey: number = note.calculateRealValue(this.applyTranspositionPitches, true);
        if (note.isPercussion) {
            const articulation = PercussionMapper.getArticulation(note);
            if (articulation) {
                noteKey = articulation.outputMidiNumber;
            }
        }
        const brushOffset: number =
            rasgueadoInfo == null && note.isStringed && note.string <= brushInfo.length
                ? brushInfo[note.string - 1]
                : 0;
        const noteStart: number = beatStart + brushOffset;
        const noteDuration: MidiNoteDuration = this.getNoteDuration(note, beatDuration, tempoOnBeatStart);
        noteDuration.untilTieOrSlideEnd -= brushOffset;
        noteDuration.noteOnly -= brushOffset;
        noteDuration.letRingEnd -= brushOffset;
        const velocity: number = MidiFileGenerator.getNoteVelocity(note);
        const channel: number = this.determineChannel(track, note);
        let initialBend: number = 0;

        const noteSoundDuration: number = Math.max(noteDuration.untilTieOrSlideEnd, noteDuration.letRingEnd);

        if (note.hasBend) {
            initialBend = MidiFileGenerator.getPitchWheel(note.bendPoints![0].value);
        } else if (note.beat.hasWhammyBar) {
            initialBend = MidiFileGenerator.getPitchWheel(note.beat.whammyBarPoints![0].value);
        } else if (
            note.isTieDestination ||
            (note.slideOrigin && note.slideOrigin.slideOutType === SlideOutType.Legato)
        ) {
            initialBend = -1;
        } else {
            initialBend = MidiFileGenerator.getPitchWheel(0);
        }

        if (initialBend >= 0) {
            this._handler.addNoteBend(track.index, noteStart, channel, noteKey, initialBend);
        }

        // Rasgueado
        if (note.beat.hasRasgueado) {
            this.generateRasgueado(track, note, noteStart, noteKey, velocity, channel, rasgueadoInfo!);
            // no further generation needed / supported
            return;
        }

        // Ornaments
        if (note.ornament !== NoteOrnament.None) {
            this.generateOrnament(track, note, noteStart, noteSoundDuration, noteKey, velocity, channel);
            // no further generation needed / supported
            return;
        }

        //
        // Trill
        if (note.isTrill && !staff.isPercussion) {
            this.generateTrill(note, noteStart, noteDuration, noteKey, velocity, channel);
            // no further generation needed
            return;
        }

        //
        // Tremolo Picking
        if (note.beat.isTremolo) {
            this.generateTremoloPicking(note, noteStart, noteDuration, noteKey, velocity, channel);
            // no further generation needed
            return;
        }

        //
        // All String Bending/Variation effects
        if (note.hasBend) {
            this.generateBend(note, noteStart, noteDuration, noteKey, channel, tempoOnBeatStart);
        } else if (note.beat.hasWhammyBar && note.index === 0) {
            this.generateWhammy(note.beat, noteStart, noteDuration, channel, tempoOnBeatStart);
        } else if (note.slideInType !== SlideInType.None || note.slideOutType !== SlideOutType.None) {
            this.generateSlide(note, noteStart, noteDuration, noteKey, channel, tempoOnBeatStart);
        } else if (
            note.vibrato !== VibratoType.None ||
            (note.isTieDestination && note.tieOrigin!.vibrato !== VibratoType.None)
        ) {
            this.generateVibrato(note, noteStart, noteDuration, noteKey, channel);
        }

        // for tied notes, and target notes of legato slides we do not pick the note
        // the previous one is extended
        if (!note.isTieDestination && (!note.slideOrigin || note.slideOrigin.slideOutType !== SlideOutType.Legato)) {
            this._handler.addNote(track.index, noteStart, noteSoundDuration, noteKey, velocity, channel);
        }
    }

    /**
     * For every note within the octave, the number of keys to go up when playing ornaments.
     * For white keys this is the next white key,
     * For black keys it is either the next black or white key depending on the distance.
     *
     * Ornaments are not really a strictly defined element, alphaTab is using shipping some default.
     */
    // prettier-ignore
    private static readonly OrnamentKeysUp = [
        /* C -> D */ 2, /* C# -> D# */ 2, /* D -> E */ 2, /* D# -> E */ 1, /* E -> F */ 1, /* F -> G */ 2,
        /* F# -> G# */ 2, /* G -> A */ 2, /* G# -> A# */ 2, /* A -> B */ 2, /* A# -> B */ 1, /* B -> C */ 1
    ];

    /**
     * For every note within the octave, the number of keys to go down when playing ornaments.
     * This is typically only a key down.
     *
     * Ornaments are not really a strictly defined element, alphaTab is using shipping some default.
     */
    // prettier-ignore
    private static readonly OrnamentKeysDown = [
        /* C -> B */ -1, /* C# -> C */ -1, /* D -> C# */ -1, /* D# -> D */ -1, /* E -> D# */ -1, /* F -> E */ -1,
        /* F# -> F */ -1, /* G -> F# */ -1, /* G# -> G */ -1, /* A -> G# */ -1, /* A# -> A */ -1, /* B -> A# */ -1
    ];

    private generateOrnament(
        track: Track,
        note: Note,
        noteStart: number,
        noteDuration: number,
        noteKey: number,
        velocity: number,
        channel: number
    ) {
        // the duration of the ornament notes preceeding the main note
        // is rather short and fixed.
        // additionally the velocity for the notes is reduced to be softer (like a hammer-on/pull-off)

        let ornamentNoteKeys: number[];
        let ornamentNoteDurations: number[];

        const index = noteKey % 12;

        const triplet = 1 / 3;
        switch (note.ornament) {
            case NoteOrnament.Turn:
                // 1 note -> 4 notes
                // 1. One note above
                // 2. Main note
                // 3. One note below
                // 4. Main note (remaining duration)
                ornamentNoteKeys = [
                    noteKey + MidiFileGenerator.OrnamentKeysUp[index],
                    noteKey,
                    noteKey + MidiFileGenerator.OrnamentKeysDown[index]
                ];
                ornamentNoteDurations = [
                    MidiUtils.toTicks(Duration.Sixteenth) * triplet,
                    MidiUtils.toTicks(Duration.Sixteenth) * triplet,
                    MidiUtils.toTicks(Duration.Sixteenth) * triplet
                ];
                break;
            case NoteOrnament.InvertedTurn:
                // 1 note -> 4 notes
                // 1. One note below
                // 2. Main note
                // 3. One note above
                // 4. Main note  (remaining duration)
                ornamentNoteKeys = [
                    noteKey + MidiFileGenerator.OrnamentKeysDown[index],
                    noteKey,
                    noteKey + MidiFileGenerator.OrnamentKeysUp[index]
                ];
                ornamentNoteDurations = [
                    MidiUtils.toTicks(Duration.Sixteenth) * triplet,
                    MidiUtils.toTicks(Duration.Sixteenth) * triplet,
                    MidiUtils.toTicks(Duration.Sixteenth) * triplet
                ];

                break;
            case NoteOrnament.UpperMordent:
                // 1 note -> 3 notes
                // 1. Main Note
                // 2. One note above
                // 3. Main Note  (remaining duration)
                ornamentNoteKeys = [noteKey, noteKey + MidiFileGenerator.OrnamentKeysUp[index]];
                ornamentNoteDurations = [
                    MidiUtils.toTicks(Duration.ThirtySecond),
                    MidiUtils.toTicks(Duration.ThirtySecond)
                ];

                break;
            case NoteOrnament.LowerMordent:
                // 1 note -> 3 notes
                // 1. Main Note
                // 2. One note below
                // 3. Main Note  (remaining duration)
                ornamentNoteKeys = [noteKey, noteKey + MidiFileGenerator.OrnamentKeysDown[index]];
                ornamentNoteDurations = [
                    MidiUtils.toTicks(Duration.ThirtySecond),
                    MidiUtils.toTicks(Duration.ThirtySecond)
                ];

                break;
            default:
                return;
        }

        // for already short notes we have to further shorten them to fit into the note duration.
        let ornamentDurationFactor = 1;
        if (noteDuration < MidiUtils.QuarterTime) {
            ornamentDurationFactor = noteDuration / MidiUtils.QuarterTime;
        }

        velocity -= MidiUtils.VelocityIncrement;

        let totalOrnamentDuration = 0;
        for (let i = 0; i < ornamentNoteKeys.length; i++) {
            const realDuration = ornamentNoteDurations[i] * ornamentDurationFactor;
            this._handler.addNote(track.index, noteStart, realDuration, ornamentNoteKeys[i], velocity, channel);

            noteStart += realDuration;
            totalOrnamentDuration += realDuration;
        }

        const remaining = noteDuration - totalOrnamentDuration;
        this._handler.addNote(track.index, noteStart, remaining, noteKey, velocity, channel);
    }

    private getNoteDuration(note: Note, duration: number, tempoOnBeatStart: number): MidiNoteDuration {
        const durationWithEffects: MidiNoteDuration = new MidiNoteDuration();
        durationWithEffects.noteOnly = duration;
        durationWithEffects.untilTieOrSlideEnd = duration;
        durationWithEffects.letRingEnd = duration;
        if (note.isDead) {
            durationWithEffects.noteOnly = this.applyStaticDuration(
                MidiFileGenerator.DefaultDurationDead,
                duration,
                tempoOnBeatStart
            );
            durationWithEffects.untilTieOrSlideEnd = durationWithEffects.noteOnly;
            durationWithEffects.letRingEnd = durationWithEffects.noteOnly;
            return durationWithEffects;
        }
        if (note.isPalmMute) {
            durationWithEffects.noteOnly = this.applyStaticDuration(
                MidiFileGenerator.DefaultDurationPalmMute,
                duration,
                tempoOnBeatStart
            );
            durationWithEffects.untilTieOrSlideEnd = durationWithEffects.noteOnly;
            durationWithEffects.letRingEnd = durationWithEffects.noteOnly;
            return durationWithEffects;
        }
        if (note.isStaccato) {
            durationWithEffects.noteOnly = (duration / 2) | 0;
            durationWithEffects.untilTieOrSlideEnd = durationWithEffects.noteOnly;
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
                        endNote.beat.playbackDuration,
                        tempoOnBeatStart
                    );
                    const endTick: number =
                        endNote.beat.absolutePlaybackStart + tieDestinationDuration.untilTieOrSlideEnd;
                    durationWithEffects.untilTieOrSlideEnd = endTick - startTick;
                } else {
                    // for continuing ties, take the current duration + the one from the destination
                    // this branch will be entered as part of the recusion of the if branch
                    const tieDestinationDuration: MidiNoteDuration = this.getNoteDuration(
                        endNote,
                        endNote.beat.playbackDuration,
                        tempoOnBeatStart
                    );
                    durationWithEffects.untilTieOrSlideEnd = duration + tieDestinationDuration.untilTieOrSlideEnd;
                }
            }
        } else if (note.slideOutType === SlideOutType.Legato) {
            const endNote: Note = note.slideTarget!;
            if (endNote) {
                const startTick: number = note.beat.absolutePlaybackStart;
                const slideTargetDuration: MidiNoteDuration = this.getNoteDuration(
                    endNote,
                    endNote.beat.playbackDuration,
                    tempoOnBeatStart
                );
                const endTick: number = endNote.beat.absolutePlaybackStart + slideTargetDuration.untilTieOrSlideEnd;
                durationWithEffects.untilTieOrSlideEnd = endTick - startTick;
            }
        }

        if (note.isLetRing && this._settings.notation.notationMode === NotationMode.GuitarPro) {
            // LetRing ends when:
            // - rest
            let lastLetRingBeat: Beat = note.beat;
            let letRingEnd: number = 0;
            const maxDuration: number = note.beat.voice.bar.masterBar.calculateDuration();
            while (lastLetRingBeat.nextBeat) {
                const next: Beat = lastLetRingBeat.nextBeat;
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
            durationWithEffects.letRingEnd = durationWithEffects.untilTieOrSlideEnd;
        }
        return durationWithEffects;
    }

    private applyStaticDuration(duration: number, maximum: number, tempo: number): number {
        const value: number = ((tempo * duration) / BendPoint.MaxPosition) | 0;
        return Math.min(value, maximum);
    }

    private static getNoteVelocity(note: Note): number {
        let adjustment: number = 0;
        // more silent on hammer destination
        if (!note.beat.voice.bar.staff.isPercussion && note.hammerPullOrigin) {
            adjustment--;
        }
        // more silent on ghost notes
        if (note.isGhost) {
            adjustment--;
        }
        // louder on accent
        switch (note.accentuated) {
            case AccentuationType.Normal:
                adjustment++;
                break;
            case AccentuationType.Heavy:
                adjustment += 2;
                break;
        }

        return MidiUtils.dynamicToVelocity(note.dynamics, adjustment);
    }

    private generateFade(beat: Beat, beatStart: number, beatDuration: number): void {
        const track: Track = beat.voice.bar.staff.track;
        switch (beat.fade) {
            case FadeType.FadeIn:
                this.generateFadeSteps(
                    track,
                    beatStart,
                    beatDuration,
                    0,
                    MidiFileGenerator.toChannelShort(track.playbackInfo.volume)
                );
                break;
            case FadeType.FadeOut:
                this.generateFadeSteps(
                    track,
                    beatStart,
                    beatDuration,
                    MidiFileGenerator.toChannelShort(track.playbackInfo.volume),
                    0
                );
                break;
            case FadeType.VolumeSwell:
                const half = (beatDuration / 2) | 0;
                this.generateFadeSteps(
                    track,
                    beatStart,
                    half,
                    0,
                    MidiFileGenerator.toChannelShort(track.playbackInfo.volume)
                );
                this.generateFadeSteps(
                    track,
                    beatStart + half,
                    half,
                    MidiFileGenerator.toChannelShort(track.playbackInfo.volume),
                    0
                );

                break;
        }
    }

    private generateFadeSteps(
        track: Track,
        start: number,
        duration: number,
        startVolume: number,
        endVolume: number
    ): void {
        const tickStep: number = 120;
        // we want to reach the target volume a bit earlier than the end of the note
        duration = (duration * 0.8) | 0;

        const volumeFactor: number = (endVolume - startVolume) / duration;

        const steps: number = (duration / tickStep + 1) | 0;
        const endTick: number = start + duration;

        for (let i = 0; i < steps; i++) {
            // ensure final value at end depending on rounding we might not reach it exactly
            const isLast = i === steps - 1;
            const tick: number = isLast ? endTick : start + i * tickStep;
            const volume: number = isLast ? endVolume : Math.round(startVolume + (tick - start) * volumeFactor);

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

    private generateVibrato(
        note: Note,
        noteStart: number,
        noteDuration: MidiNoteDuration,
        noteKey: number,
        channel: number
    ): void {
        let phaseLength: number = 0;
        let bendAmplitude: number = 0;
        const vibratoType =
            note.vibrato !== VibratoType.None
                ? note.vibrato
                : note.isTieDestination
                  ? note.tieOrigin!.vibrato
                  : VibratoType.Slight; /* should never happen unless called wrongly */
        switch (vibratoType) {
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
        let bendBase = 0;
        // if this is a vibrato at the end of a bend, the vibrato wave needs to start at the pitch where the bend ends
        if (note.isTieDestination && note.tieOrigin!.hasBend) {
            const bendPoints = note.tieOrigin!.bendPoints!;
            bendBase = bendPoints[bendPoints.length - 1].value;
        }
        this.generateVibratorWithParams(
            noteStart,
            noteDuration.noteOnly,
            phaseLength,
            bendBase,
            bendAmplitude,
            (tick, value) => {
                this._handler.addNoteBend(track.index, tick, channel, noteKey, value);
            }
        );
    }

    public vibratoResolution: number = 16;
    private generateVibratorWithParams(
        noteStart: number,
        noteDuration: number,
        phaseLength: number,
        bendBase: number,
        bendAmplitude: number,
        addBend: (tick: number, value: number) => void
    ): void {
        const resolution: number = this.vibratoResolution;
        const phaseHalf: number = (phaseLength / 2) | 0;
        // vibrato is a sine wave with the given amplitude and phase length
        const noteEnd: number = noteStart + noteDuration;
        while (noteStart < noteEnd) {
            let phase: number = 0;
            const phaseDuration: number = noteStart + phaseLength < noteEnd ? phaseLength : noteEnd - noteStart;
            while (phase < phaseDuration) {
                const bend: number = bendBase + bendAmplitude * Math.sin((phase * Math.PI) / phaseHalf);
                addBend((noteStart + phase) | 0, MidiFileGenerator.getPitchWheel(bend));
                phase += resolution;
            }
            noteStart += phaseLength;
        }

        // reset at end
        addBend(noteEnd | 0, MidiFileGenerator.getPitchWheel(bendBase));
    }

    /**
     * Maximum semitones that are supported in bends in one direction (up or down)
     * GP has 8 full tones on whammys.
     */
    private static readonly PitchBendRangeInSemitones = 8 * 2;
    /**
     * The value on how many pitch-values are used for one semitone
     */
    private static readonly PitchValuePerSemitone: number =
        SynthConstants.DefaultPitchWheel / MidiFileGenerator.PitchBendRangeInSemitones;

    /**
     * The minimum number of breakpoints generated per semitone bend.
     */
    private static readonly MinBreakpointsPerSemitone = 6;

    /**
     * How long until a new breakpoint is generated for a bend.
     */
    private static readonly MillisecondsPerBreakpoint = 150;

    /**
     * Calculates the midi pitch wheel value for the give bend value.
     */
    public static getPitchWheel(bendValue: number) {
        // bend values are 1/4 notes therefore we only take half a semitone value per bend value
        return SynthConstants.DefaultPitchWheel + (bendValue / 2) * MidiFileGenerator.PitchValuePerSemitone;
    }

    private generateSlide(
        note: Note,
        noteStart: number,
        noteDuration: MidiNoteDuration,
        noteKey: number,
        channel: number,
        tempoOnBeatStart: number
    ) {
        const duration: number =
            note.slideOutType === SlideOutType.Legato ? noteDuration.noteOnly : noteDuration.untilTieOrSlideEnd;
        const playedBendPoints: BendPoint[] = [];
        const track: Track = note.beat.voice.bar.staff.track;

        const simpleSlidePitchOffset = this._settings.player.slide.simpleSlidePitchOffset;
        const simpleSlideDurationOffset = Math.floor(
            BendPoint.MaxPosition * this._settings.player.slide.simpleSlideDurationRatio
        );
        const shiftSlideDurationOffset = Math.floor(
            BendPoint.MaxPosition * this._settings.player.slide.shiftSlideDurationRatio
        );

        // Shift Slide: Play note, move up to target note, play end note
        // Legato Slide: Play note, move up to target note, no pick on end note, just keep it ringing

        // 2 bend points: one on 0/0, dy/MaxPos.

        // Slide into from above/below: Play note on lower pitch, slide into it quickly at start
        // Slide out above/blow: Play note on normal pitch, slide out quickly at end

        switch (note.slideInType) {
            case SlideInType.IntoFromAbove:
                playedBendPoints.push(new BendPoint(0, simpleSlidePitchOffset));
                playedBendPoints.push(new BendPoint(simpleSlideDurationOffset, 0));
                break;
            case SlideInType.IntoFromBelow:
                playedBendPoints.push(new BendPoint(0, -simpleSlidePitchOffset));
                playedBendPoints.push(new BendPoint(simpleSlideDurationOffset, 0));
                break;
        }

        switch (note.slideOutType) {
            case SlideOutType.Legato:
            case SlideOutType.Shift:
                playedBendPoints.push(new BendPoint(shiftSlideDurationOffset, 0));
                // normal note values are in 1/2 tones, bends are in 1/4 tones
                const dy =
                    (note.slideTarget!.calculateRealValue(this.applyTranspositionPitches, true) -
                        note.calculateRealValue(this.applyTranspositionPitches, true)) *
                    2;
                playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, dy));
                break;
            case SlideOutType.OutDown:
                playedBendPoints.push(new BendPoint(BendPoint.MaxPosition - simpleSlideDurationOffset, 0));
                playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, -simpleSlidePitchOffset));
                break;
            case SlideOutType.OutUp:
                playedBendPoints.push(new BendPoint(BendPoint.MaxPosition - simpleSlideDurationOffset, 0));
                playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, simpleSlidePitchOffset));
                break;
        }

        this.generateWhammyOrBend(noteStart, duration, playedBendPoints, tempoOnBeatStart, (tick, value) => {
            this._handler.addNoteBend(track.index, tick, channel, noteKey, value);
        });
    }

    private generateBend(
        note: Note,
        noteStart: number,
        noteDuration: MidiNoteDuration,
        noteKey: number,
        channel: number,
        tempoOnBeatStart: number
    ): void {
        const bendPoints: BendPoint[] = note.bendPoints!;
        const track: Track = note.beat.voice.bar.staff.track;

        const addBend: (tick: number, value: number) => void = (tick, value) => {
            this._handler.addNoteBend(track.index, tick, channel, noteKey, value);
        };

        // if bend is extended on next tied note, we directly bend to the final bend value
        let finalBendValue: number | null = null;
        // Bends are spread across all tied notes unless they have a bend on their own.
        let duration: number;
        if (note.isTieOrigin && this._settings.notation.extendBendArrowsOnTiedNotes) {
            let endNote: Note = note;
            while (
                endNote.isTieOrigin &&
                !endNote.tieDestination!.hasBend &&
                endNote.tieDestination!.vibrato === VibratoType.None
            ) {
                endNote = endNote.tieDestination!;
            }
            duration =
                endNote.beat.absolutePlaybackStart -
                note.beat.absolutePlaybackStart +
                this.getNoteDuration(endNote, endNote.beat.playbackDuration, tempoOnBeatStart).noteOnly;
        } else if (note.isTieOrigin && note.beat.graceType !== GraceType.None) {
            switch (note.tieDestination!.bendType) {
                case BendType.Bend:
                case BendType.BendRelease:
                case BendType.PrebendBend:
                    finalBendValue = note.tieDestination!.bendPoints![1].value;
                    break;
                case BendType.Prebend:
                case BendType.PrebendRelease:
                    finalBendValue = note.tieDestination!.bendPoints![0].value;
                    break;
            }
            duration = Math.max(
                noteDuration.noteOnly,
                MidiUtils.millisToTicks(this._settings.player.songBookBendDuration, tempoOnBeatStart)
            );
        } else {
            duration = noteDuration.noteOnly;
        }
        // ensure prebends are slightly before the actual note.
        if (bendPoints[0].value > 0 && !note.isContinuedBend && noteStart > 0) {
            noteStart--;
        }
        const bendDuration: number = Math.min(
            duration,
            MidiUtils.millisToTicks(this._settings.player.songBookBendDuration, tempoOnBeatStart)
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
                        playedBendPoints.push(new BendPoint(0, note.bendPoints![0].value));
                        if (!finalBendValue || finalBendValue < note.bendPoints![1].value) {
                            finalBendValue = note.bendPoints![1].value;
                        }
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, finalBendValue));
                        break;
                    case BendStyle.Fast:
                        if (!finalBendValue || finalBendValue < note.bendPoints![1].value) {
                            finalBendValue = note.bendPoints![1].value;
                        }
                        if (note.beat.graceType === GraceType.BendGrace) {
                            this.generateSongBookWhammyOrBend(
                                noteStart,
                                duration,
                                true,
                                [note.bendPoints![0].value, finalBendValue],
                                bendDuration,
                                tempoOnBeatStart,
                                addBend
                            );
                        } else {
                            this.generateSongBookWhammyOrBend(
                                noteStart,
                                duration,
                                false,
                                [note.bendPoints![0].value, finalBendValue],
                                bendDuration,
                                tempoOnBeatStart,
                                addBend
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
                        playedBendPoints.push(new BendPoint(0, note.bendPoints![0].value));
                        playedBendPoints.push(
                            new BendPoint((BendPoint.MaxPosition / 2) | 0, note.bendPoints![1].value)
                        );
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, note.bendPoints![2].value));
                        break;
                    case BendStyle.Fast:
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            duration,
                            false,
                            [note.bendPoints![0].value, note.bendPoints![1].value, note.bendPoints![2].value],
                            bendDuration,
                            tempoOnBeatStart,
                            addBend
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
                        playedBendPoints.push(new BendPoint(0, note.bendPoints![0].value));
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, note.bendPoints![1].value));
                        break;
                    case BendStyle.Fast:
                        const preBendValue: number = MidiFileGenerator.getPitchWheel(note.bendPoints![0].value);
                        addBend(noteStart, preBendValue | 0);
                        if (!finalBendValue || finalBendValue < note.bendPoints![1].value) {
                            finalBendValue = note.bendPoints![1].value;
                        }
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            duration,
                            false,
                            [note.bendPoints![0].value, finalBendValue],
                            bendDuration,
                            tempoOnBeatStart,
                            addBend
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
                        playedBendPoints.push(new BendPoint(0, note.bendPoints![0].value));
                        playedBendPoints.push(new BendPoint(BendPoint.MaxPosition, note.bendPoints![1].value));
                        break;
                    case BendStyle.Fast:
                        const preBendValue: number = MidiFileGenerator.getPitchWheel(note.bendPoints![0].value);
                        addBend(noteStart, preBendValue | 0);
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            duration,
                            false,
                            [note.bendPoints![0].value, note.bendPoints![1].value],
                            bendDuration,
                            tempoOnBeatStart,
                            addBend
                        );
                        return;
                }
                break;
        }
        this.generateWhammyOrBend(noteStart, duration, playedBendPoints, tempoOnBeatStart, addBend);
    }

    private generateSongBookWhammyOrBend(
        noteStart: number,
        duration: number,
        bendAtBeginning: boolean,
        bendValues: number[],
        bendDuration: number,
        tempoOnBeatStart: number,
        addBend: (tick: number, value: number) => void
    ): void {
        const startTick: number = bendAtBeginning ? noteStart : noteStart + duration - bendDuration;
        const ticksBetweenPoints: number = bendDuration / (bendValues.length - 1);
        for (let i: number = 0; i < bendValues.length - 1; i++) {
            const currentBendValue: number = MidiFileGenerator.getPitchWheel(bendValues[i]);
            const nextBendValue: number = MidiFileGenerator.getPitchWheel(bendValues[i + 1]);
            const tick: number = startTick + ticksBetweenPoints * i;
            this.generateBendValues(
                tick,
                ticksBetweenPoints,
                currentBendValue,
                nextBendValue,
                tempoOnBeatStart,
                addBend
            );
        }
    }

    private generateWhammy(
        beat: Beat,
        noteStart: number,
        noteDuration: MidiNoteDuration,
        channel: number,
        tempoOnBeatStart: number
    ): void {
        const bendPoints: BendPoint[] = beat.whammyBarPoints!;
        const track: Track = beat.voice.bar.staff.track;
        const duration: number = noteDuration.noteOnly;
        // ensure prebends are slightly before the actual note.
        if (bendPoints[0].value > 0 && !beat.isContinuedWhammy) {
            noteStart--;
        }

        const addBend: (tick: number, value: number) => void = (tick, value) => {
            this._handler.addBend(track.index, tick, channel, value);
        };

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
                            MidiUtils.millisToTicks(this._settings.player.songBookBendDuration, tempoOnBeatStart)
                        );
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            duration,
                            false,
                            [bendPoints[0].value, bendPoints[1].value],
                            whammyDuration,
                            tempoOnBeatStart,
                            addBend
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
                            MidiUtils.millisToTicks(this._settings.player.songBookDipDuration, tempoOnBeatStart)
                        );
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            duration,
                            true,
                            [bendPoints[0].value, bendPoints[1].value, bendPoints[2].value],
                            whammyDuration,
                            tempoOnBeatStart,
                            addBend
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
                        const preDiveValue: number = MidiFileGenerator.getPitchWheel(bendPoints[0].value);
                        this._handler.addBend(track.index, noteStart, channel, preDiveValue | 0);
                        const whammyDuration: number = Math.min(
                            duration,
                            MidiUtils.millisToTicks(this._settings.player.songBookBendDuration, tempoOnBeatStart)
                        );
                        this.generateSongBookWhammyOrBend(
                            noteStart,
                            duration,
                            false,
                            [bendPoints[0].value, bendPoints[1].value],
                            whammyDuration,
                            tempoOnBeatStart,
                            addBend
                        );
                        return;
                }
                break;
        }
        this.generateWhammyOrBend(noteStart, duration, playedBendPoints, tempoOnBeatStart, addBend);
    }

    private generateWhammyOrBend(
        noteStart: number,
        duration: number,
        playedBendPoints: BendPoint[],
        tempoOnBeatStart: number,
        addBend: (tick: number, value: number) => void
    ): void {
        const ticksPerPosition: number = duration / BendPoint.MaxPosition;
        for (let i: number = 0; i < playedBendPoints.length - 1; i++) {
            const currentPoint: BendPoint = playedBendPoints[i];
            const nextPoint: BendPoint = playedBendPoints[i + 1];
            // calculate the midi pitchbend values start and end values
            const currentBendValue: number = MidiFileGenerator.getPitchWheel(currentPoint.value);
            const nextBendValue: number = MidiFileGenerator.getPitchWheel(nextPoint.value);
            // how many midi ticks do we have to spend between this point and the next one?
            const ticksBetweenPoints: number = ticksPerPosition * (nextPoint.offset - currentPoint.offset);
            // we will generate one pitchbend message for each value
            // for this we need to calculate how many ticks to offset per value
            const tick: number = noteStart + ticksPerPosition * currentPoint.offset;
            this.generateBendValues(
                tick,
                ticksBetweenPoints,
                currentBendValue,
                nextBendValue,
                tempoOnBeatStart,
                addBend
            );
        }
    }

    private generateBendValues(
        currentTick: number,
        ticksBetweenPoints: number,
        currentBendValue: number,
        nextBendValue: number,
        tempoOnBeatStart: number,
        addBend: (tick: number, value: number) => void
    ): void {
        const millisBetweenPoints = MidiUtils.ticksToMillis(ticksBetweenPoints, tempoOnBeatStart);
        const numberOfSemitones = Math.abs(nextBendValue - currentBendValue) / MidiFileGenerator.PitchValuePerSemitone;
        const numberOfSteps = Math.max(
            MidiFileGenerator.MinBreakpointsPerSemitone * numberOfSemitones,
            millisBetweenPoints / MidiFileGenerator.MillisecondsPerBreakpoint
        );
        const ticksPerBreakpoint: number = ticksBetweenPoints / numberOfSteps;
        const pitchPerBreakpoint = (nextBendValue - currentBendValue) / numberOfSteps;

        const endTick = currentTick + ticksBetweenPoints;

        for (let i = 0; i < numberOfSteps; i++) {
            addBend(currentTick | 0, Math.round(currentBendValue));
            currentBendValue += pitchPerBreakpoint;
            currentTick += ticksPerBreakpoint;
        }

        addBend(endTick | 0, nextBendValue);
    }

    private generateRasgueado(
        track: Track,
        note: Note,
        noteStart: number,
        noteKey: number,
        velocity: number,
        channel: number,
        rasgueadoInfo: RasgueadoInfo
    ) {
        let tick: number = noteStart;

        for (let i = 0; i < rasgueadoInfo.durations.length; i++) {
            const brushInfo = rasgueadoInfo.brushInfos[i];
            const brushOffset: number =
                note.isStringed && note.string <= brushInfo.length ? brushInfo[note.string - 1] : 0;
            const duration = rasgueadoInfo.durations[i] as number;

            this._handler.addNote(track.index, tick + brushOffset, duration - brushOffset, noteKey, velocity, channel);

            tick += duration;
        }
    }

    private generateTrill(
        note: Note,
        noteStart: number,
        noteDuration: MidiNoteDuration,
        noteKey: number,
        dynamicValue: number,
        channel: number
    ): void {
        const track: Track = note.beat.voice.bar.staff.track;
        const trillKey: number = note.stringTuning + note.trillFret;
        let trillLength: number = MidiUtils.toTicks(note.trillSpeed);
        let realKey: boolean = true;
        let tick: number = noteStart;
        const end: number = noteStart + noteDuration.untilTieOrSlideEnd;
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
        dynamicValue: number,
        channel: number
    ): void {
        const track: Track = note.beat.voice.bar.staff.track;
        let tpLength: number = MidiUtils.toTicks(note.beat.tremoloSpeed!);
        let tick: number = noteStart;
        const end: number = noteStart + noteDuration.untilTieOrSlideEnd;
        while (tick + 10 < end) {
            // only the rest on last trill play
            if (tick + tpLength >= end) {
                tpLength = end - tick;
            }
            this._handler.addNote(track.index, tick, tpLength, noteKey, dynamicValue, channel);
            tick += tpLength;
        }
    }

    private static readonly RasgueadoDirections = new Map<Rasgueado, BrushType[]>([
        [Rasgueado.Ii, [BrushType.BrushDown, BrushType.BrushUp]],
        [Rasgueado.Mi, [BrushType.BrushDown, BrushType.BrushDown]],
        [Rasgueado.MiiTriplet, [BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushUp]],
        [Rasgueado.MiiAnapaest, [BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushUp]],
        [Rasgueado.PmpTriplet, [BrushType.BrushUp, BrushType.BrushDown, BrushType.BrushDown]],
        [Rasgueado.PmpAnapaest, [BrushType.BrushUp, BrushType.BrushDown, BrushType.BrushDown]],
        [Rasgueado.PeiTriplet, [BrushType.BrushUp, BrushType.BrushDown, BrushType.BrushDown]],
        [Rasgueado.PeiAnapaest, [BrushType.BrushUp, BrushType.BrushDown, BrushType.BrushDown]],
        [Rasgueado.PaiTriplet, [BrushType.BrushUp, BrushType.BrushDown, BrushType.BrushDown]],
        [Rasgueado.PaiAnapaest, [BrushType.BrushUp, BrushType.BrushDown, BrushType.BrushDown]],
        [Rasgueado.AmiTriplet, [BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown]],
        [Rasgueado.AmiAnapaest, [BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown]],
        [Rasgueado.Ppp, [BrushType.None, BrushType.BrushDown, BrushType.BrushUp]],
        [Rasgueado.Amii, [BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushUp]],
        [Rasgueado.Amip, [BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushUp]],
        [Rasgueado.Eami, [BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown]],
        [
            Rasgueado.Eamii,
            [BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushUp]
        ],
        [
            Rasgueado.Peami,
            [BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushDown, BrushType.BrushUp]
        ]
    ]);

    // these are the durations of the rasgueados assuming we have a quarter note
    // the patterns are then relatively scaled to the actual beat duration
    private static readonly RasgueadoDurations = new Map<Rasgueado, number[]>([
        [Rasgueado.Ii, [MidiUtils.toTicks(Duration.Eighth), MidiUtils.toTicks(Duration.Eighth)]],
        [Rasgueado.Mi, [MidiUtils.toTicks(Duration.Eighth), MidiUtils.toTicks(Duration.Eighth)]],
        [
            Rasgueado.MiiTriplet,
            [
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3
            ]
        ],
        [
            Rasgueado.MiiAnapaest,
            [
                MidiUtils.toTicks(Duration.Sixteenth),
                MidiUtils.toTicks(Duration.Sixteenth),
                MidiUtils.toTicks(Duration.Eighth)
            ]
        ],
        [
            Rasgueado.PmpTriplet,
            [
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3
            ]
        ],
        [
            Rasgueado.PmpAnapaest,
            [
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3
            ]
        ],
        [
            Rasgueado.PeiTriplet,
            [
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3
            ]
        ],
        [
            Rasgueado.PeiAnapaest,
            [
                MidiUtils.toTicks(Duration.Sixteenth),
                MidiUtils.toTicks(Duration.Sixteenth),
                MidiUtils.toTicks(Duration.Eighth)
            ]
        ],
        [
            Rasgueado.PaiTriplet,
            [
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3
            ]
        ],
        [
            Rasgueado.PaiAnapaest,
            [
                MidiUtils.toTicks(Duration.Sixteenth),
                MidiUtils.toTicks(Duration.Sixteenth),
                MidiUtils.toTicks(Duration.Eighth)
            ]
        ],
        [
            Rasgueado.AmiTriplet,
            [
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3
            ]
        ],
        [
            Rasgueado.AmiAnapaest,
            [
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3
            ]
        ],
        [
            Rasgueado.Ppp,
            [
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Eighth) / 3
            ]
        ],
        [
            Rasgueado.Amii,
            [
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Eighth)
            ]
        ],
        [
            Rasgueado.Amip,
            [
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Sixteenth) / 3,
                MidiUtils.toTicks(Duration.Eighth)
            ]
        ],
        [
            Rasgueado.Eami,
            [
                MidiUtils.toTicks(Duration.Sixteenth),
                MidiUtils.toTicks(Duration.Sixteenth),
                MidiUtils.toTicks(Duration.Sixteenth),
                MidiUtils.toTicks(Duration.Sixteenth)
            ]
        ],
        [
            Rasgueado.Eamii,
            [
                MidiUtils.toTicks(Duration.Sixteenth) / 5,
                MidiUtils.toTicks(Duration.Sixteenth) / 5,
                MidiUtils.toTicks(Duration.Sixteenth) / 5,
                MidiUtils.toTicks(Duration.Sixteenth) / 5,
                MidiUtils.toTicks(Duration.Sixteenth) / 5
            ]
        ],
        [
            Rasgueado.Peami,
            [
                MidiUtils.toTicks(Duration.Sixteenth) / 5,
                MidiUtils.toTicks(Duration.Sixteenth) / 5,
                MidiUtils.toTicks(Duration.Sixteenth) / 5,
                MidiUtils.toTicks(Duration.Sixteenth) / 5,
                MidiUtils.toTicks(Duration.Sixteenth) / 5
            ]
        ]
    ]);

    private getRasgueadoInfo(beat: Beat, beatDuration: number): RasgueadoInfo | null {
        if (!beat.hasRasgueado) {
            return null;
        }

        const info = new RasgueadoInfo();

        // stretch pattern from absolute definition to needed beat duration
        const rasgueadoPattern = MidiFileGenerator.RasgueadoDurations.get(beat.rasgueado)!;
        const patternDuration = rasgueadoPattern.reduce((p, v) => p + v, 0);

        info.durations = MidiFileGenerator.RasgueadoDurations.get(beat.rasgueado)!.map(
            v => (beatDuration * v) / patternDuration
        );
        info.brushInfos = new Array<Int32Array>(info.durations.length);

        // precalculate the values needed for all brush infos
        const sixteenthBrush = MidiUtils.toTicks(Duration.Sixteenth);
        let stringUsed: number = 0;
        let stringCount: number = 0;
        for (const n of beat.notes) {
            if (n.isTieDestination) {
                continue;
            }
            stringUsed |= 0x01 << (n.string - 1);
            stringCount++;
        }

        // compute brush info for all slots matching the duration
        const rasgueadoDirections = MidiFileGenerator.RasgueadoDirections.get(beat.rasgueado)!;
        for (let i = 0; i < info.durations.length; i++) {
            // QuarterTime -> 16th note brush
            // real duration -> ?
            const brushDuration = (info.durations[i] * sixteenthBrush) / MidiUtils.QuarterTime;

            const brushInfo = new Int32Array(beat.voice.bar.staff.tuning.length);
            info.brushInfos[i] = brushInfo;

            const brushType = rasgueadoDirections[i];
            if (brushType !== BrushType.None) {
                this.fillBrushInfo(
                    beat,
                    brushInfo,
                    brushType === BrushType.ArpeggioDown || brushType === BrushType.BrushDown,
                    stringUsed,
                    stringCount,
                    brushDuration
                );
            }
        }

        return info;
    }

    private getBrushInfo(beat: Beat): Int32Array {
        const brushInfo = new Int32Array(beat.voice.bar.staff.tuning.length);

        if (beat.brushType) {
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

            this.fillBrushInfo(
                beat,
                brushInfo,
                beat.brushType === BrushType.ArpeggioDown || beat.brushType === BrushType.BrushDown,
                stringUsed,
                stringCount,
                beat.brushDuration
            );
        }

        return brushInfo;
    }

    private fillBrushInfo(
        beat: Beat,
        brushInfo: Int32Array,
        down: boolean,
        stringUsed: number,
        stringCount: number,
        brushDuration: number
    ) {
        //
        // calculate time offset for all strings
        if (beat.notes.length > 0) {
            let brushMove: number = 0;
            const brushIncrement: number = (brushDuration / (stringCount - 1)) | 0;
            for (let i: number = 0; i < beat.voice.bar.staff.tuning.length; i++) {
                const index: number = down ? i : brushInfo.length - 1 - i;
                if ((stringUsed & (0x01 << index)) !== 0) {
                    brushInfo[index] = brushMove;
                    brushMove += brushIncrement;
                }
            }
        }

        return brushInfo;
    }

    private generateNonTempoAutomation(beat: Beat, automation: Automation, startMove: number): void {
        switch (automation.type) {
            case AutomationType.Instrument:
                this.addProgramChange(
                    beat.voice.bar.staff.track,
                    beat.playbackStart + startMove,
                    beat.voice.bar.staff.track.playbackInfo.primaryChannel,
                    (automation.value | 0) & 0xff
                );
                this.addProgramChange(
                    beat.voice.bar.staff.track,
                    beat.playbackStart + startMove,
                    beat.voice.bar.staff.track.playbackInfo.secondaryChannel,
                    (automation.value | 0) & 0xff
                );
                break;
            case AutomationType.Balance:
                const balance: number = MidiFileGenerator.toChannelShort(automation.value);
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
                const volume: number = MidiFileGenerator.toChannelShort(automation.value);
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

    public prepareSingleBeat(beat: Beat) {
        // collect tempo and program at given beat
        let tempo = -1;
        let program = -1;

        // traverse to previous beats until we maybe hit the automations needed
        let currentBeat: Beat | null = beat;
        while (currentBeat && (tempo === -1 || program === -1)) {
            for (const automation of beat.automations) {
                switch (automation.type) {
                    case AutomationType.Instrument:
                        program = automation.value;
                        break;
                    case AutomationType.Tempo:
                        tempo = automation.value;
                        break;
                }
            }
            currentBeat = currentBeat.previousBeat;
        }

        const track = beat.voice.bar.staff.track;
        const masterBar = beat.voice.bar.masterBar;
        if (tempo === -1) {
            tempo = masterBar.score.tempo;
        }

        const positionRatio = beat.playbackStart / masterBar.calculateDuration();
        for (const automation of masterBar.tempoAutomations) {
            if (automation.ratioPosition <= positionRatio) {
                tempo = automation.value;
            } else {
                break;
            }
        }

        if (program === -1) {
            program = track.playbackInfo.program;
        }

        const volume = track.playbackInfo.volume;

        // setup channel
        this.generateTrack(track);
        this._handler.addTimeSignature(0, masterBar.timeSignatureNumerator, masterBar.timeSignatureDenominator);
        this._handler.addTempo(0, tempo);

        const volumeCoarse: number = MidiFileGenerator.toChannelShort(volume);
        this._handler.addControlChange(
            0,
            0,
            track.playbackInfo.primaryChannel,
            ControllerType.VolumeCoarse,
            volumeCoarse
        );
        this._handler.addControlChange(
            0,
            0,
            track.playbackInfo.secondaryChannel,
            ControllerType.VolumeCoarse,
            volumeCoarse
        );

        return tempo;
    }

    public generateSingleBeat(beat: Beat) {
        const tempo = this.prepareSingleBeat(beat);
        this.generateBeat(beat, -beat.playbackStart /* to bring it to 0*/, beat.voice.bar, tempo);
    }

    public generateSingleNote(note: Note) {
        const tempo = this.prepareSingleBeat(note.beat);
        this.generateNote(
            note,
            0,
            note.beat.playbackDuration,
            tempo,
            new Int32Array(note.beat.voice.bar.staff.tuning.length),
            null
        );
    }
}
