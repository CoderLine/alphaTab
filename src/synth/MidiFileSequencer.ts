import { MetaDataEvent } from '@src/midi/MetaDataEvent';
import { MetaEventType } from '@src/midi/MetaEvent';
import { MetaNumberEvent } from '@src/midi/MetaNumberEvent';
import { MidiEventType } from '@src/midi/MidiEvent';
import { MidiFile } from '@src/midi/MidiFile';
import { PlaybackRange } from '@src/synth/PlaybackRange';
import { SynthEvent } from '@src/synth/synthesis/SynthEvent';
import { TinySoundFont } from '@src/synth/synthesis/TinySoundFont';
import { Logger } from '@src/Logger';
import { SynthConstants } from './SynthConstants';

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
    public firstProgramEventPerChannel: Map<number, SynthEvent> = new Map();
    public firstTimeSignatureNumerator: number = 0;
    public firstTimeSignatureDenominator: number = 0;
    public synthData: SynthEvent[] = [];
    public division: number = 0;
    public eventIndex: number = 0;
    public currentTime: number = 0;
    public playbackRange: PlaybackRange | null = null;
    public playbackRangeStartTime: number = 0;
    public playbackRangeEndTime: number = 0;
    public endTick: number = 0;
    public endTime: number = 0;
}

/**
 * This sequencer dispatches midi events to the synthesizer based on the current
 * synthesize position. The sequencer does not consider the playback speed.
 */
export class MidiFileSequencer {
    private _synthesizer: TinySoundFont;
    private _currentState: MidiSequencerState;
    private _mainState: MidiSequencerState;
    private _oneTimeState: MidiSequencerState | null = null;
    private _countInState: MidiSequencerState | null = null;

    public get isPlayingOneTimeMidi(): boolean {
        return this._currentState == this._oneTimeState;
    }

    public get isPlayingCountIn(): boolean {
        return this._currentState == this._countInState;
    }

    public constructor(synthesizer: TinySoundFont) {
        this._synthesizer = synthesizer;
        this._mainState = new MidiSequencerState();
        this._currentState = this._mainState;
    }

    public get playbackRange(): PlaybackRange | null {
        return this._currentState.playbackRange;
    }

    public set playbackRange(value: PlaybackRange | null) {
        this._currentState.playbackRange = value;
        if (value) {
            this._currentState.playbackRangeStartTime = this.tickPositionToTimePositionWithSpeed(value.startTick, 1);
            this._currentState.playbackRangeEndTime = this.tickPositionToTimePositionWithSpeed(value.endTick, 1);
        }
    }

    public isLooping: boolean = false;

    public get currentTime() {
        return this._currentState.currentTime;
    }

    /**
     * Gets the duration of the song in ticks.
     */
    public get endTick() {
        return this._currentState.endTick;
    }

    public get endTime(): number {
        return this._currentState.endTime / this.playbackSpeed;
    }

    /**
     * Gets or sets the playback speed.
     */
    public playbackSpeed: number = 1;

    public seek(timePosition: number): void {
        // map to speed=1
        timePosition *= this.playbackSpeed;

        // ensure playback range
        if (this.playbackRange) {
            if (timePosition < this._currentState.playbackRangeStartTime) {
                timePosition = this._currentState.playbackRangeStartTime;
            } else if (timePosition > this._currentState.playbackRangeEndTime) {
                timePosition = this._currentState.playbackRangeEndTime;
            }
        }

        if (timePosition > this._currentState.currentTime) {
            this.silentProcess(timePosition - this._currentState.currentTime);
        } else if (timePosition < this._currentState.currentTime) {
            // we have to restart the midi to make sure we get the right state: instruments, volume, pan, etc
            this._currentState.currentTime = 0;
            this._currentState.eventIndex = 0;
            let metronomeVolume: number = this._synthesizer.metronomeVolume;
            this._synthesizer.noteOffAll(true);
            this._synthesizer.resetSoft();
            this._synthesizer.setupMetronomeChannel(metronomeVolume);
            this.silentProcess(timePosition);
        }
    }

    private silentProcess(milliseconds: number): void {
        if (milliseconds <= 0) {
            return;
        }

        let start: number = Date.now();
        let finalTime: number = this._currentState.currentTime + milliseconds;

        while (this._currentState.currentTime < finalTime) {
            if (this.fillMidiEventQueueLimited(finalTime - this._currentState.currentTime)) {
                this._synthesizer.synthesizeSilent(SynthConstants.MicroBufferSize);
            }
        }

        this._currentState.currentTime = finalTime;

        let duration: number = Date.now() - start;
        Logger.debug('Sequencer', 'Silent seek finished in ' + duration + 'ms');
    }

    public loadOneTimeMidi(midiFile: MidiFile): void {
        this._oneTimeState = this.createStateFromFile(midiFile);
        this._currentState = this._oneTimeState;
    }

    public loadMidi(midiFile: MidiFile): void {
        this._mainState = this.createStateFromFile(midiFile);
        this._currentState = this._mainState;
    }

    public createStateFromFile(midiFile: MidiFile): MidiSequencerState {
        const state = new MidiSequencerState();

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
        for (let mEvent of midiFile.events) {
            let synthData: SynthEvent = new SynthEvent(state.synthData.length, mEvent);
            state.synthData.push(synthData);

            let deltaTick: number = mEvent.tick - previousTick;
            absTick += deltaTick;
            absTime += deltaTick * (60000.0 / (bpm * midiFile.division));
            synthData.time = absTime;
            previousTick = mEvent.tick;

            if (metronomeLengthInTicks > 0) {
                while (metronomeTick < absTick) {
                    let metronome: SynthEvent = SynthEvent.newMetronomeEvent(state.synthData.length,
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

            if (mEvent.command === MidiEventType.Meta && mEvent.data1 === MetaEventType.Tempo) {
                let meta: MetaNumberEvent = mEvent as MetaNumberEvent;
                bpm = 60000000 / meta.value;
                state.tempoChanges.push(new MidiFileSequencerTempoChange(bpm, absTick, absTime));
                metronomeLengthInMillis = metronomeLengthInTicks * (60000.0 / (bpm * midiFile.division))
            } else if (mEvent.command === MidiEventType.Meta && mEvent.data1 === MetaEventType.TimeSignature) {
                let meta: MetaDataEvent = mEvent as MetaDataEvent;
                let timeSignatureDenominator: number = Math.pow(2, meta.data[1]);
                metronomeCount = meta.data[0];
                metronomeLengthInTicks = (state.division * (4.0 / timeSignatureDenominator)) | 0;
                metronomeLengthInMillis = metronomeLengthInTicks * (60000.0 / (bpm * midiFile.division))
                if (state.firstTimeSignatureDenominator === 0) {
                    state.firstTimeSignatureNumerator = meta.data[0];
                    state.firstTimeSignatureDenominator = timeSignatureDenominator;
                }
            } else if (mEvent.command === MidiEventType.ProgramChange) {
                let channel: number = mEvent.channel;
                if (!state.firstProgramEventPerChannel.has(channel)) {
                    state.firstProgramEventPerChannel.set(channel, synthData);
                }
            }
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
        state.endTime = absTime;
        state.endTick = absTick;

        return state;
    }

    public fillMidiEventQueue(): boolean {
        return this.fillMidiEventQueueLimited(-1);
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

    public tickPositionToTimePosition(tickPosition: number): number {
        return this.tickPositionToTimePositionWithSpeed(tickPosition, this.playbackSpeed);
    }

    public timePositionToTickPosition(timePosition: number): number {
        return this.timePositionToTickPositionWithSpeed(timePosition, this.playbackSpeed);
    }

    private tickPositionToTimePositionWithSpeed(tickPosition: number, playbackSpeed: number): number {
        let timePosition: number = 0.0;
        let bpm: number = 120.0;
        let lastChange: number = 0;

        // find start and bpm of last tempo change before time
        for (const c of this._currentState.tempoChanges) {
            if (tickPosition < c.ticks) {
                break;
            }

            timePosition = c.time;
            bpm = c.bpm;
            lastChange = c.ticks;
        }

        // add the missing millis
        tickPosition -= lastChange;
        timePosition += tickPosition * (60000.0 / (bpm * this._currentState.division));

        return timePosition / playbackSpeed;
    }

    private timePositionToTickPositionWithSpeed(timePosition: number, playbackSpeed: number): number {
        timePosition *= playbackSpeed;

        let ticks: number = 0;
        let bpm: number = 120.0;
        let lastChange: number = 0;

        // find start and bpm of last tempo change before time
        for (const c of this._currentState.tempoChanges) {
            if (timePosition < c.time) {
                break;
            }
            ticks = c.ticks;
            bpm = c.bpm;
            lastChange = c.time;
        }

        // add the missing ticks
        timePosition -= lastChange;
        ticks += (timePosition / (60000.0 / (bpm * this._currentState.division))) | 0;
        // we add 1 for possible rounding errors.(floating point issuses)
        return ticks + 1;
    }

    private get internalEndTime(): number {
        return !this.playbackRange ? this._currentState.endTime : this._currentState.playbackRangeEndTime;
    }

    public get isFinished(): boolean {
        return this._currentState.currentTime >= this.internalEndTime;
    }

    public stop(): void {
        if (!this.playbackRange) {
            this._currentState.currentTime = 0;
            this._currentState.eventIndex = 0;
        } else if (this.playbackRange) {
            this._currentState.currentTime = this.playbackRange.startTick;
            this._currentState.eventIndex = 0;
        }
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

        let metronomeLengthInTicks: number = (state.division * (4.0 / timeSignatureDenominator)) | 0;
        let metronomeLengthInMillis: number = metronomeLengthInTicks * (60000.0 / (bpm * this._mainState.division));
        let metronomeTick: number = 0;
        let metronomeTime: number = 0.0;

        for (let i = 0; i < timeSignatureNumerator; i++) {
            let metronome: SynthEvent = SynthEvent.newMetronomeEvent(
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
        this._countInState = state;
    }
}
