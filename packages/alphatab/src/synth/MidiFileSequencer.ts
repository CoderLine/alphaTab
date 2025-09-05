import {
    MidiEventType,
    type NoteOnEvent,
    type ProgramChangeEvent,
    type TempoChangeEvent,
    type TimeSignatureEvent
} from '@src/midi/MidiEvent';
import type { MidiFile } from '@src/midi/MidiFile';
import type { PlaybackRange } from '@src/synth/PlaybackRange';
import { SynthEvent } from '@src/synth/synthesis/SynthEvent';
import { Logger } from '@src/Logger';
import { SynthConstants } from '@src/synth/SynthConstants';
import { MidiUtils } from '@src/midi/MidiUtils';
import type { IAudioSampleSynthesizer } from '@src/synth/IAudioSampleSynthesizer';
import { BackingTrackSyncPoint } from '@src/synth/IAlphaSynth';

export class MidiFileSequencerTempoChange {
    public bpm: number;
    public ticks: number;
    public time: number;

    public constructor(bpm: number, ticks: number, time: number) {
        this.bpm = bpm;
        this.ticks = ticks;
        this.time = time;
    }
}

class MidiSequencerState {
    public tempoChanges: MidiFileSequencerTempoChange[] = [];
    public tempoChangeIndex: number = 0;
    public syncPoints: BackingTrackSyncPoint[] = [];
    public firstProgramEventPerChannel: Map<number, SynthEvent> = new Map();
    public firstTimeSignatureNumerator: number = 0;
    public firstTimeSignatureDenominator: number = 0;
    public synthData: SynthEvent[] = [];
    public division: number = MidiUtils.QuarterTime;
    public eventIndex: number = 0;
    public currentTime: number = 0;
    public syncPointIndex: number = 0;
    public playbackRange: PlaybackRange | null = null;
    public playbackRangeStartTime: number = 0;
    public playbackRangeEndTime: number = 0;
    public endTick: number = 0;
    public endTime: number = 0;
    public currentTempo: number = 0;
    public syncPointTempo: number = 0;
}

/**
 * This sequencer dispatches midi events to the synthesizer based on the current
 * synthesize position. The sequencer does not consider the playback speed.
 */
export class MidiFileSequencer {
    private _synthesizer: IAudioSampleSynthesizer;
    private _currentState: MidiSequencerState;
    private _mainState: MidiSequencerState;
    private _oneTimeState: MidiSequencerState | null = null;
    private _countInState: MidiSequencerState | null = null;

    public get isPlayingMain(): boolean {
        return this._currentState === this._mainState;
    }

    public get isPlayingOneTimeMidi(): boolean {
        return this._currentState === this._oneTimeState;
    }

    public get isPlayingCountIn(): boolean {
        return this._currentState === this._countInState;
    }

    public constructor(synthesizer: IAudioSampleSynthesizer) {
        this._synthesizer = synthesizer;
        this._mainState = new MidiSequencerState();
        this._currentState = this._mainState;
    }

    public get mainPlaybackRange(): PlaybackRange | null {
        return this._mainState.playbackRange;
    }

    public set mainPlaybackRange(value: PlaybackRange | null) {
        this._mainState.playbackRange = value;
        if (value) {
            this._mainState.playbackRangeStartTime = this.tickPositionToTimePositionWithSpeed(
                this._mainState,
                value.startTick,
                1
            );
            this._mainState.playbackRangeEndTime = this.tickPositionToTimePositionWithSpeed(
                this._mainState,
                value.endTick,
                1
            );
        }
    }

    public isLooping: boolean = false;

    public get currentTime() {
        return this._currentState.currentTime / this.playbackSpeed;
    }

    /**
     * Gets the duration of the song in ticks.
     */
    public get currentEndTick() {
        return this._currentState.endTick;
    }

    public get currentEndTime(): number {
        return this._currentState.endTime / this.playbackSpeed;
    }

    public get currentTempo(): number {
        return this._currentState.currentTempo;
    }

    public get modifiedTempo(): number {
        return this._currentState.syncPointTempo * this.playbackSpeed;
    }

    public get syncPointTempo(): number {
        return this._currentState.syncPointTempo;
    }

    public get currentSyncPoints(): BackingTrackSyncPoint[] {
        return this._currentState.syncPoints;
    }

    /**
     * Gets or sets the playback speed.
     */
    public playbackSpeed: number = 1;

    public mainSeek(timePosition: number): void {
        // map to speed=1
        timePosition *= this.playbackSpeed;

        // ensure playback range
        if (this.mainPlaybackRange) {
            if (timePosition < this._mainState.playbackRangeStartTime) {
                timePosition = this._mainState.playbackRangeStartTime;
            } else if (timePosition > this._mainState.playbackRangeEndTime) {
                timePosition = this._mainState.playbackRangeEndTime;
            }
        }

        if (timePosition > this._mainState.currentTime) {
            this.mainSilentProcess(timePosition - this._mainState.currentTime);
        } else if (timePosition < this._mainState.currentTime) {
            // we have to restart the midi to make sure we get the right state: instruments, volume, pan, etc
            this._mainState.currentTime = 0;
            this._mainState.eventIndex = 0;
            this._mainState.syncPointIndex = 0;
            this._mainState.tempoChangeIndex = 0;
            this._mainState.currentTempo = this._mainState.tempoChanges[0].bpm;
            this._mainState.syncPointTempo =
                this._mainState.syncPoints.length > 0
                    ? this._mainState.syncPoints[0].syncBpm
                    : this._mainState.currentTempo;
            if (this.isPlayingMain) {
                const metronomeVolume: number = this._synthesizer.metronomeVolume;
                this._synthesizer.noteOffAll(true);
                this._synthesizer.resetSoft();
                this._synthesizer.setupMetronomeChannel(metronomeVolume);
            }
            this.mainSilentProcess(timePosition);
        }
    }

    private mainSilentProcess(milliseconds: number): void {
        if (milliseconds <= 0) {
            return;
        }

        const start: number = Date.now();
        const finalTime: number = this._mainState.currentTime + milliseconds;

        if (this.isPlayingMain) {
            while (this._mainState.currentTime < finalTime) {
                if (this.fillMidiEventQueueLimited(finalTime - this._mainState.currentTime)) {
                    this._synthesizer.synthesizeSilent(SynthConstants.MicroBufferSize);
                }
            }
        }

        this._mainState.currentTime = finalTime;

        const duration: number = Date.now() - start;
        Logger.debug('Sequencer', `Silent seek finished in ${duration}ms (main)`);
    }

    public loadOneTimeMidi(midiFile: MidiFile): void {
        this._oneTimeState = this.createStateFromFile(midiFile);
        this._currentState = this._oneTimeState;
    }

    public instrumentPrograms: Set<number> = new Set<number>();
    public percussionKeys: Set<number> = new Set<number>();

    public loadMidi(midiFile: MidiFile): void {
        this.instrumentPrograms.clear();
        this.percussionKeys.clear();
        this._mainState = this.createStateFromFile(midiFile);
        this._currentState = this._mainState;
    }

    public createStateFromFile(midiFile: MidiFile): MidiSequencerState {
        const state = new MidiSequencerState();

        this.percussionKeys.add(SynthConstants.MetronomeKey); // Metronome

        state.tempoChanges = [];

        state.division = midiFile.division;
        state.eventIndex = 0;
        state.currentTime = 0;

        // build synth events.
        state.synthData = [];

        // Converts midi to milliseconds for easy sequencing
        let bpm: number = 120;
        let absTick: number = 0;
        let absTime: number = 0.0;

        let metronomeCount: number = 0;
        let metronomeLengthInTicks: number = 0;
        let metronomeLengthInMillis: number = 0;
        let metronomeTick: number = 0;
        let metronomeTime: number = 0.0;

        let previousTick: number = 0;
        for (const mEvent of midiFile.events) {
            const synthData: SynthEvent = new SynthEvent(state.synthData.length, mEvent);
            state.synthData.push(synthData);

            const deltaTick: number = mEvent.tick - previousTick;
            absTick += deltaTick;
            absTime += deltaTick * (60000.0 / (bpm * midiFile.division));
            synthData.time = absTime;
            previousTick = mEvent.tick;

            if (metronomeLengthInTicks > 0) {
                while (metronomeTick < absTick) {
                    const metronome: SynthEvent = SynthEvent.newMetronomeEvent(
                        state.synthData.length,
                        metronomeTick,
                        Math.floor(metronomeTick / metronomeLengthInTicks) % metronomeCount,
                        metronomeLengthInTicks,
                        metronomeLengthInMillis
                    );
                    state.synthData.push(metronome);
                    metronome.time = metronomeTime;
                    metronomeTick += metronomeLengthInTicks;
                    metronomeTime += metronomeLengthInMillis;
                }
            }

            if (mEvent.type === MidiEventType.TempoChange) {
                const meta: TempoChangeEvent = mEvent as TempoChangeEvent;
                bpm = meta.beatsPerMinute;
                state.tempoChanges.push(new MidiFileSequencerTempoChange(bpm, absTick, absTime));
                metronomeLengthInMillis = metronomeLengthInTicks * (60000.0 / (bpm * midiFile.division));
            } else if (mEvent.type === MidiEventType.TimeSignature) {
                const meta: TimeSignatureEvent = mEvent as TimeSignatureEvent;
                const timeSignatureDenominator: number = Math.pow(2, meta.denominatorIndex);
                metronomeCount = meta.numerator;
                metronomeLengthInTicks = (state.division * (4.0 / timeSignatureDenominator)) | 0;
                metronomeLengthInMillis = metronomeLengthInTicks * (60000.0 / (bpm * midiFile.division));
                if (state.firstTimeSignatureDenominator === 0) {
                    state.firstTimeSignatureNumerator = meta.numerator;
                    state.firstTimeSignatureDenominator = timeSignatureDenominator;
                }
            } else if (mEvent.type === MidiEventType.ProgramChange) {
                const programChange = mEvent as ProgramChangeEvent;
                const channel: number = programChange.channel;
                if (!state.firstProgramEventPerChannel.has(channel)) {
                    state.firstProgramEventPerChannel.set(channel, synthData);
                }
                const isPercussion = channel === SynthConstants.PercussionChannel;
                if (!isPercussion) {
                    this.instrumentPrograms.add(programChange.program);
                }
            } else if (mEvent.type === MidiEventType.NoteOn) {
                const noteOn = mEvent as NoteOnEvent;
                const isPercussion = noteOn.channel === SynthConstants.PercussionChannel;
                if (isPercussion) {
                    this.percussionKeys.add(noteOn.noteKey);
                }
            }
        }

        state.currentTempo = state.tempoChanges.length > 0 ? state.tempoChanges[0].bpm : bpm;
        state.syncPointTempo = state.currentTempo;

        state.synthData.sort((a, b) => {
            if (a.time > b.time) {
                return 1;
            }
            if (a.time < b.time) {
                return -1;
            }
            return a.eventIndex - b.eventIndex;
        });
        state.endTime = absTime;
        state.endTick = absTick;

        return state;
    }

    public fillMidiEventQueue(): boolean {
        return this.fillMidiEventQueueLimited(-1);
    }

    public fillMidiEventQueueToEndTime(endTime: number) {
        while (this._mainState.currentTime < endTime) {
            if (this.fillMidiEventQueueLimited(endTime - this._mainState.currentTime)) {
                this._synthesizer.synthesizeSilent(SynthConstants.MicroBufferSize);
            }
        }

        let anyEventsDispatched: boolean = false;
        this._currentState.currentTime = endTime;
        while (
            this._currentState.eventIndex < this._currentState.synthData.length &&
            this._currentState.synthData[this._currentState.eventIndex].time < this._currentState.currentTime
        ) {
            const synthEvent = this._currentState.synthData[this._currentState.eventIndex];
            this._synthesizer.dispatchEvent(synthEvent);
            this._currentState.eventIndex++;
            anyEventsDispatched = true;
        }

        return anyEventsDispatched;
    }

    private fillMidiEventQueueLimited(maxMilliseconds: number): boolean {
        let millisecondsPerBuffer: number =
            (SynthConstants.MicroBufferSize / this._synthesizer.outSampleRate) * 1000 * this.playbackSpeed;
        let endTime: number = this.internalEndTime;
        if (maxMilliseconds > 0) {
            // ensure that first microbuffer does not already exceed max time
            if (maxMilliseconds < millisecondsPerBuffer) {
                millisecondsPerBuffer = maxMilliseconds;
            }
            endTime = Math.min(this.internalEndTime, this._currentState.currentTime + maxMilliseconds);
        }

        let anyEventsDispatched: boolean = false;
        this._currentState.currentTime += millisecondsPerBuffer;
        while (
            this._currentState.eventIndex < this._currentState.synthData.length &&
            this._currentState.synthData[this._currentState.eventIndex].time < this._currentState.currentTime &&
            this._currentState.currentTime < endTime
        ) {
            this._synthesizer.dispatchEvent(this._currentState.synthData[this._currentState.eventIndex]);
            this._currentState.eventIndex++;
            anyEventsDispatched = true;
        }

        return anyEventsDispatched;
    }

    public mainTickPositionToTimePosition(tickPosition: number): number {
        return this.tickPositionToTimePositionWithSpeed(this._mainState, tickPosition, this.playbackSpeed);
    }

    public mainUpdateSyncPoints(syncPoints: BackingTrackSyncPoint[]) {
        const state = this._mainState;
        syncPoints.sort((a, b) => a.synthTick - b.synthTick); // just in case
        state.syncPoints = [];

        if (syncPoints.length >= 0) {
            let bpm: number = 120;
            let absTick: number = 0;
            let absTime: number = 0.0;

            let tempoChangeIndex = 0;

            for (let i = 0; i < syncPoints.length; i++) {
                const p = syncPoints[i];
                let deltaTick = 0;

                // TODO: merge interpolation into MidiFileGenerator where we already play through
                // the time axis.

                // remember state from previous sync point (or start). to handle linear interpolation
                let previousModifiedTempo: number;
                let previousMillisecondOffset: number;
                let previousTick: number;

                if (i === 0) {
                    previousModifiedTempo = bpm;
                    previousMillisecondOffset = 0;
                    previousTick = 0;
                } else {
                    const previousSyncPoint = syncPoints[i - 1];
                    previousModifiedTempo = previousSyncPoint.syncBpm;
                    previousMillisecondOffset = previousSyncPoint.syncTime;
                    previousTick = previousSyncPoint.synthTick;
                }

                // process time until sync point
                // here it gets a bit tricky. if we have tempo changes on the synthesizer time axis (inbetween two sync points)
                // we have to calculate a interpolated sync point on the alphaTab time axis.
                // otherwise the linear interpolation later in the lookup will fail.
                // goal is to have always a linear increase between two points, no matter if the time axis is sliced by tempo changes or sync points
                while (
                    tempoChangeIndex < state.tempoChanges.length &&
                    state.tempoChanges[tempoChangeIndex].ticks <= p.synthTick
                ) {
                    deltaTick = state.tempoChanges[tempoChangeIndex].ticks - absTick;
                    if (deltaTick > 0) {
                        absTick += deltaTick;
                        absTime += deltaTick * (60000.0 / (bpm * state.division));

                        const millisPerTick = (p.syncTime - previousMillisecondOffset) / (p.synthTick - previousTick);
                        const interpolatedMillisecondOffset =
                            (absTick - previousTick) * millisPerTick + previousMillisecondOffset;

                        const syncPoint = new BackingTrackSyncPoint();
                        syncPoint.synthTick = absTick;
                        syncPoint.synthBpm = bpm;
                        syncPoint.synthTime = absTime;
                        syncPoint.syncTime = interpolatedMillisecondOffset;
                        syncPoint.syncBpm = previousModifiedTempo;
                    }

                    bpm = state.tempoChanges[tempoChangeIndex].bpm;
                    tempoChangeIndex++;
                }

                deltaTick = p.synthTick - absTick;
                absTick += deltaTick;
                absTime += deltaTick * (60000.0 / (bpm * state.division));
                state.syncPoints.push(p);
            }
        }

        state.syncPointIndex = 0;
        state.syncPointTempo = state.syncPoints.length > 0 ? state.syncPoints[0].syncBpm : state.currentTempo;
    }

    public currentTimePositionToTickPosition(timePosition: number): number {
        const state = this._currentState;
        if (state.tempoChanges.length === 0) {
            return 0;
        }

        timePosition *= this.playbackSpeed;

        this.updateCurrentTempo(state, timePosition);
        const lastTempoChange = state.tempoChanges[state.tempoChangeIndex];
        const timeDiff = timePosition - lastTempoChange.time;
        const ticks = (timeDiff / (60000.0 / (lastTempoChange.bpm * state.division))) | 0;
        // we add 1 for possible rounding errors.(floating point issuses)
        return lastTempoChange.ticks + ticks + 1;
    }

    public currentUpdateCurrentTempo(timePosition: number) {
        this.updateCurrentTempo(this._mainState, timePosition * this.playbackSpeed);
    }

    private updateCurrentTempo(state: MidiSequencerState, timePosition: number) {
        let tempoChangeIndex = state.tempoChangeIndex;
        if (timePosition < state.tempoChanges[tempoChangeIndex].time) {
            tempoChangeIndex = 0;
        }

        while (
            tempoChangeIndex + 1 < state.tempoChanges.length &&
            state.tempoChanges[tempoChangeIndex + 1].time <= timePosition
        ) {
            tempoChangeIndex++;
        }

        if (tempoChangeIndex !== state.tempoChangeIndex) {
            state.tempoChangeIndex = tempoChangeIndex;
            state.currentTempo = state.tempoChanges[state.tempoChangeIndex].bpm;

            if (state.syncPoints.length === 0) {
                state.syncPointTempo = state.currentTempo;
            }
        }
    }

    public currentUpdateSyncPoints(timePosition: number) {
        this.updateSyncPoints(this._mainState, timePosition);
    }

    private updateSyncPoints(state: MidiSequencerState, timePosition: number) {
        const syncPoints = state.syncPoints;
        if (syncPoints.length > 0) {
            let syncPointIndex = Math.min(state.syncPointIndex, syncPoints.length - 1);
            if (timePosition < syncPoints[syncPointIndex].syncTime) {
                syncPointIndex = 0;
            }
            while (syncPointIndex + 1 < syncPoints.length && syncPoints[syncPointIndex + 1].syncTime <= timePosition) {
                syncPointIndex++;
            }
            if (syncPointIndex !== state.syncPointIndex) {
                state.syncPointIndex = syncPointIndex;
                state.syncPointTempo = syncPoints[syncPointIndex].syncBpm;
            }
        } else {
            state.syncPointTempo = state.currentTempo;
        }
    }

    public mainTimePositionFromBackingTrack(timePosition: number, backingTrackLength: number): number {
        const mainState = this._mainState;
        const syncPoints = mainState.syncPoints;

        if (timePosition < 0 || syncPoints.length === 0) {
            return timePosition;
        }

        this.updateSyncPoints(this._mainState, timePosition);

        const syncPointIndex = Math.min(mainState.syncPointIndex, syncPoints.length - 1);

        const currentSyncPoint = syncPoints[syncPointIndex];
        const timeDiff = timePosition - currentSyncPoint.syncTime;

        let alphaTabTimeDiff: number;

        if (syncPointIndex + 1 < syncPoints.length) {
            const nextSyncPoint = syncPoints[syncPointIndex + 1];
            const relativeTimeDiff = timeDiff / (nextSyncPoint.syncTime - currentSyncPoint.syncTime);

            alphaTabTimeDiff = (nextSyncPoint.synthTime - currentSyncPoint.synthTime) * relativeTimeDiff;
        } else {
            const relativeTimeDiff = timeDiff / (backingTrackLength - currentSyncPoint.syncTime);
            alphaTabTimeDiff = (mainState.endTime - currentSyncPoint.synthTime) * relativeTimeDiff;
        }

        return (currentSyncPoint.synthTime + alphaTabTimeDiff) / this.playbackSpeed;
    }

    public mainTimePositionToBackingTrack(timePosition: number, backingTrackLength: number): number {
        const mainState = this._mainState;
        const syncPoints = mainState.syncPoints;
        if (timePosition < 0 || syncPoints.length === 0) {
            return timePosition;
        }

        timePosition *= this.playbackSpeed;

        let syncPointIndex = Math.min(mainState.syncPointIndex, syncPoints.length - 1);
        if (timePosition < syncPoints[syncPointIndex].synthTime) {
            syncPointIndex = 0;
        }
        while (syncPointIndex + 1 < syncPoints.length && syncPoints[syncPointIndex + 1].synthTime <= timePosition) {
            syncPointIndex++;
        }

        // NOTE: this logic heavily relies on the interpolation done in mainUpdateSyncPoints
        // we ensure that we have a linear increase between two points
        const currentSyncPoint = syncPoints[syncPointIndex];
        const alphaTabTimeDiff = timePosition - currentSyncPoint.synthTime;

        let backingTrackPos: number;
        if (syncPointIndex + 1 < syncPoints.length) {
            const nextSyncPoint = syncPoints[syncPointIndex + 1];
            const relativeAlphaTabTimeDiff = alphaTabTimeDiff / (nextSyncPoint.synthTime - currentSyncPoint.synthTime);
            const backingTrackDiff = nextSyncPoint.syncTime - currentSyncPoint.syncTime;
            backingTrackPos = currentSyncPoint.syncTime + backingTrackDiff * relativeAlphaTabTimeDiff;
        } else {
            const relativeAlphaTabTimeDiff = alphaTabTimeDiff / (mainState.endTime - currentSyncPoint.synthTime);
            const frameDiff = backingTrackLength - currentSyncPoint.syncTime;
            backingTrackPos = currentSyncPoint.syncTime + frameDiff * relativeAlphaTabTimeDiff;
        }

        return backingTrackPos;
    }

    private tickPositionToTimePositionWithSpeed(
        state: MidiSequencerState,
        tickPosition: number,
        playbackSpeed: number
    ): number {
        let timePosition: number = 0.0;
        let bpm: number = 120.0;
        let lastChange: number = 0;

        // find start and bpm of last tempo change before time
        for (const c of state.tempoChanges) {
            if (tickPosition < c.ticks) {
                break;
            }

            timePosition = c.time;
            bpm = c.bpm;
            lastChange = c.ticks;
        }

        // add the missing millis
        tickPosition -= lastChange;
        timePosition += tickPosition * (60000.0 / (bpm * state.division));

        return timePosition / playbackSpeed;
    }

    private get internalEndTime(): number {
        if (this.isPlayingMain) {
            return !this.mainPlaybackRange ? this._currentState.endTime : this._currentState.playbackRangeEndTime;
        }
        return this._currentState.endTime;
    }

    public get isFinished(): boolean {
        return this._currentState.currentTime >= this.internalEndTime;
    }

    public stop(): void {
        if (this.isPlayingMain && this.mainPlaybackRange) {
            this._currentState.currentTime = this.mainPlaybackRange.startTick;
        } else {
            this._currentState.currentTime = 0;
        }

        this._currentState.eventIndex = 0;
    }

    public resetOneTimeMidi() {
        this._oneTimeState = null;
        this._currentState = this._mainState;
    }

    public resetCountIn() {
        this._countInState = null;
        this._currentState = this._mainState;
    }

    public startCountIn() {
        this.generateCountInMidi();
        this._currentState = this._countInState!;

        this.stop();
        this._synthesizer.noteOffAll(true);
    }

    generateCountInMidi() {
        const state = new MidiSequencerState();
        state.division = this._mainState.division;

        let bpm: number = 120;
        let timeSignatureNumerator = 4;
        let timeSignatureDenominator = 4;
        if (this._mainState.eventIndex === 0) {
            bpm = this._mainState.tempoChanges[0].bpm;
            timeSignatureNumerator = this._mainState.firstTimeSignatureNumerator;
            timeSignatureDenominator = this._mainState.firstTimeSignatureDenominator;
        } else {
            bpm = this._synthesizer.currentTempo;
            timeSignatureNumerator = this._synthesizer.timeSignatureNumerator;
            timeSignatureDenominator = this._synthesizer.timeSignatureDenominator;
        }

        state.tempoChanges.push(new MidiFileSequencerTempoChange(bpm, 0, 0));

        const metronomeLengthInTicks: number = (state.division * (4.0 / timeSignatureDenominator)) | 0;
        const metronomeLengthInMillis: number = metronomeLengthInTicks * (60000.0 / (bpm * this._mainState.division));
        let metronomeTick: number = 0;
        let metronomeTime: number = 0.0;

        for (let i = 0; i < timeSignatureNumerator; i++) {
            const metronome: SynthEvent = SynthEvent.newMetronomeEvent(
                state.synthData.length,
                metronomeTick,
                i,
                metronomeLengthInTicks,
                metronomeLengthInMillis
            );
            state.synthData.push(metronome);
            metronome.time = metronomeTime;
            metronomeTick += metronomeLengthInTicks;
            metronomeTime += metronomeLengthInMillis;
        }

        state.synthData.sort((a, b) => {
            if (a.time > b.time) {
                return 1;
            }
            if (a.time < b.time) {
                return -1;
            }
            return a.eventIndex - b.eventIndex;
        });
        state.endTime = metronomeTime;
        state.endTick = metronomeTick;
        state.currentTempo = bpm;
        state.syncPointTempo = bpm;
        this._countInState = state;
    }
}
