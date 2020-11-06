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
    public synthData: SynthEvent[] = [];
    public division: number = 0;
    public eventIndex: number = 0;
    public currentTime: number = 0;
    public playbackRange: PlaybackRange | null = null;
    public playbackRangeStartTime: number = 0;
    public playbackRangeEndTime: number = 0;
    public endTick:number = 0;
    public endTime:number = 0;
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

        // move back some ticks to ensure the on-time events are played
        timePosition -= 25;
        if (timePosition < 0) {
            timePosition = 0;
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

<<<<<<< HEAD
        while (this._currentState.currentTime < finalTime) {
            if (this.fillMidiEventQueueLimited(finalTime - this._currentState.currentTime)) {
                this._synthesizer.synthesizeSilent();
=======
        while (this._currentTime < finalTime) {
            if (this.fillMidiEventQueueLimited(finalTime - this._currentTime)) {
                this._synthesizer.synthesizeSilent(SynthConstants.MicroBufferSize);
>>>>>>> develop
            }
        }

        let duration: number = Date.now() - start;
        Logger.debug('Sequencer', 'Silent seek finished in ' + duration + 'ms');
    }

    public loadOneTimeMidi(midiFile: MidiFile): void {
        this._oneTimeState = this.createStateFromFile(midiFile);
        this._currentState = this._oneTimeState;
    }

    public loadMidi(midiFile: MidiFile): void {
        this._mainState = this.createStateFromFile(midiFile);
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

        let metronomeLength: number = 0;
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

            if (metronomeLength > 0) {
                while (metronomeTick < absTick) {
                    let metronome: SynthEvent = SynthEvent.newMetronomeEvent(state.synthData.length);
                    state.synthData.push(metronome);
                    metronome.time = metronomeTime;
                    metronomeTick += metronomeLength;
                    metronomeTime += metronomeLength * (60000.0 / (bpm * midiFile.division));
                }
            }

            if (mEvent.command === MidiEventType.Meta && mEvent.data1 === MetaEventType.Tempo) {
                let meta: MetaNumberEvent = mEvent as MetaNumberEvent;
                bpm = 60000000 / meta.value;
                state.tempoChanges.push(new MidiFileSequencerTempoChange(bpm, absTick, absTime));
            } else if (mEvent.command === MidiEventType.Meta && mEvent.data1 === MetaEventType.TimeSignature) {
                let meta: MetaDataEvent = mEvent as MetaDataEvent;
                let timeSignatureDenominator: number = Math.pow(2, meta.data[1]);
                metronomeLength = (state.division * (4.0 / timeSignatureDenominator)) | 0;
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
<<<<<<< HEAD
        for (let i: number = 0; i < TinySoundFont.MicroBufferCount; i++) {
            this._currentState.currentTime += millisecondsPerBuffer;
            while (
                this._currentState.eventIndex < this._currentState.synthData.length &&
                this._currentState.synthData[this._currentState.eventIndex].time < this._currentState.currentTime &&
                this._currentState.currentTime < endTime
            ) {
                this._synthesizer.dispatchEvent(i, this._currentState.synthData[this._currentState.eventIndex]);
                this._currentState.eventIndex++;
                anyEventsDispatched = true;
            }
            if (this._currentState.currentTime >= endTime) {
                break;
            }
=======
        this._currentTime += millisecondsPerBuffer;
        while (
            this._eventIndex < this._synthData.length &&
            this._synthData[this._eventIndex].time < this._currentTime &&
            this._currentTime < endTime
        ) {
            this._synthesizer.dispatchEvent(this._synthData[this._eventIndex]);
            this._eventIndex++;
            anyEventsDispatched = true;
>>>>>>> develop
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
}
