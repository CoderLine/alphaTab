import type { MidiFile } from '@src/midi/MidiFile';
import type { IAlphaSynth } from '@src/synth/IAlphaSynth';
import type { ISynthOutput } from '@src/synth/ISynthOutput';
import { MidiFileSequencer } from '@src/synth/MidiFileSequencer';
import type { PlaybackRange } from '@src/synth/PlaybackRange';
import { PlayerState } from '@src/synth/PlayerState';
import { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { Hydra } from '@src/synth/soundfont/Hydra';
import { TinySoundFont } from '@src/synth/synthesis/TinySoundFont';
import { EventEmitter, type IEventEmitter, type IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Logger } from '@src/Logger';
import type { LogLevel } from '@src/LogLevel';
import { SynthConstants } from '@src/synth/SynthConstants';
import type { SynthEvent } from '@src/synth/synthesis/SynthEvent';
import { Queue } from '@src/synth/ds/Queue';
import { MidiEventsPlayedEventArgs } from '@src/synth/MidiEventsPlayedEventArgs';
import type { MidiEvent, MidiEventType } from '@src/midi/MidiEvent';
import { PlaybackRangeChangedEventArgs } from '@src/synth/PlaybackRangeChangedEventArgs';
import { ModelUtils } from '@src/model/ModelUtils';

/**
 * This is the main synthesizer component which can be used to
 * play a {@link MidiFile} via a {@link ISynthOutput}.
 */
export class AlphaSynth implements IAlphaSynth {
    private _sequencer: MidiFileSequencer;
    private _synthesizer: TinySoundFont;
    private _isSoundFontLoaded: boolean = false;
    private _isMidiLoaded: boolean = false;
    private _tickPosition: number = 0;
    private _timePosition: number = 0;
    private _metronomeVolume: number = 0;
    private _countInVolume: number = 0;
    private _playedEventsQueue: Queue<SynthEvent> = new Queue<SynthEvent>();
    private _midiEventsPlayedFilter: Set<MidiEventType> = new Set<MidiEventType>();
    private _notPlayedSamples: number = 0;
    private _synthStopping = false;
    private _output: ISynthOutput;

    public get output(): ISynthOutput {
        return this._output;
    }

    public isReady: boolean = false;

    public get isReadyForPlayback(): boolean {
        return this.isReady && this._isSoundFontLoaded && this._isMidiLoaded;
    }

    public state: PlayerState = PlayerState.Paused;

    public get logLevel(): LogLevel {
        return Logger.logLevel;
    }

    public set logLevel(value: LogLevel) {
        Logger.logLevel = value;
    }

    public get masterVolume(): number {
        return this._synthesizer.masterVolume;
    }

    public set masterVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this._synthesizer.masterVolume = value;
    }

    public get metronomeVolume(): number {
        return this._metronomeVolume;
    }

    public set metronomeVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this._metronomeVolume = value;
        this._synthesizer.metronomeVolume = value;
    }

    public get countInVolume(): number {
        return this._countInVolume;
    }

    public set countInVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this._countInVolume = value;
    }

    public get midiEventsPlayedFilter(): MidiEventType[] {
        return Array.from(this._midiEventsPlayedFilter);
    }

    public set midiEventsPlayedFilter(value: MidiEventType[]) {
        this._midiEventsPlayedFilter = new Set<MidiEventType>(value);
    }

    public get playbackSpeed(): number {
        return this._sequencer.playbackSpeed;
    }

    public set playbackSpeed(value: number) {
        value = ModelUtils.clamp(value, SynthConstants.MinPlaybackSpeed, SynthConstants.MaxPlaybackSpeed);
        const oldSpeed: number = this._sequencer.playbackSpeed;
        this._sequencer.playbackSpeed = value;
        this.timePosition = this.timePosition * (oldSpeed / value);
    }

    public get tickPosition(): number {
        return this._tickPosition;
    }

    public set tickPosition(value: number) {
        this.timePosition = this._sequencer.mainTickPositionToTimePosition(value);
    }

    public get timePosition(): number {
        return this._timePosition;
    }

    public set timePosition(value: number) {
        Logger.debug('AlphaSynth', `Seeking to position ${value}ms (main)`);

        // tell the sequencer to jump to the given position
        this._sequencer.mainSeek(value);

        // update the internal position
        this.updateTimePosition(value, true);

        // tell the output to reset the already synthesized buffers and request data again
        if (this._sequencer.isPlayingMain) {
            this._notPlayedSamples = 0;
            this.output.resetSamples();
        }
    }

    public get playbackRange(): PlaybackRange | null {
        return this._sequencer.mainPlaybackRange;
    }

    public set playbackRange(value: PlaybackRange | null) {
        this._sequencer.mainPlaybackRange = value;
        if (value) {
            this.tickPosition = value.startTick;
        }
        (this.playbackRangeChanged as EventEmitterOfT<PlaybackRangeChangedEventArgs>).trigger(
            new PlaybackRangeChangedEventArgs(value)
        );
    }

    public get isLooping(): boolean {
        return this._sequencer.isLooping;
    }

    public set isLooping(value: boolean) {
        this._sequencer.isLooping = value;
    }

    public destroy(): void {
        Logger.debug('AlphaSynth', 'Destroying player');
        this.stop();
        this.output.destroy();
    }

    /**
     * Initializes a new instance of the {@link AlphaSynth} class.
     * @param output The output to use for playing the generated samples.
     */
    public constructor(output: ISynthOutput, bufferTimeInMilliseconds: number) {
        Logger.debug('AlphaSynth', 'Initializing player');
        this.state = PlayerState.Paused;

        Logger.debug('AlphaSynth', 'Creating output');
        this._output = output;

        Logger.debug('AlphaSynth', 'Creating synthesizer');
        this._synthesizer = new TinySoundFont(this.output.sampleRate);
        this._sequencer = new MidiFileSequencer(this._synthesizer);

        Logger.debug('AlphaSynth', 'Opening output');
        this.output.ready.on(() => {
            this.isReady = true;
            (this.ready as EventEmitter).trigger();
            this.checkReadyForPlayback();
        });
        this.output.sampleRequest.on(() => {
            if (
                this.state === PlayerState.Playing &&
                (!this._sequencer.isFinished || this._synthesizer.activeVoiceCount > 0)
            ) {
                let samples: Float32Array = new Float32Array(
                    SynthConstants.MicroBufferSize * SynthConstants.MicroBufferCount * SynthConstants.AudioChannels
                );
                let bufferPos: number = 0;

                for (let i = 0; i < SynthConstants.MicroBufferCount; i++) {
                    // synthesize buffer
                    this._sequencer.fillMidiEventQueue();
                    const synthesizedEvents = this._synthesizer.synthesize(
                        samples,
                        bufferPos,
                        SynthConstants.MicroBufferSize
                    );
                    bufferPos += SynthConstants.MicroBufferSize * SynthConstants.AudioChannels;
                    // push all processed events into the queue
                    // for informing users about played events
                    for (const e of synthesizedEvents) {
                        if (this._midiEventsPlayedFilter.has(e.event.type)) {
                            this._playedEventsQueue.enqueue(e);
                        }
                    }
                    // tell sequencer to check whether its work is done
                    if (this._sequencer.isFinished) {
                        break;
                    }
                }

                // send it to output
                if (bufferPos < samples.length) {
                    samples = samples.subarray(0, bufferPos);
                }
                this._notPlayedSamples += samples.length;
                this.output.addSamples(samples);
            } else {
                // Tell output that there is no data left for it.
                const samples: Float32Array = new Float32Array(0);
                this.output.addSamples(samples);
            }
        });
        this.output.samplesPlayed.on(this.onSamplesPlayed.bind(this));
        this.output.open(bufferTimeInMilliseconds);
    }

    public play(): boolean {
        if (this.state !== PlayerState.Paused || !this._isMidiLoaded) {
            return false;
        }
        this.output.activate();

        this.playInternal();

        if (this._countInVolume > 0) {
            Logger.debug('AlphaSynth', 'Starting countin');
            this._sequencer.startCountIn();
            this._synthesizer.setupMetronomeChannel(this._countInVolume);
            this.updateTimePosition(0, true);
        }

        this.output.play();
        return true;
    }

    private playInternal() {
        if (this._sequencer.isPlayingOneTimeMidi) {
            Logger.debug('AlphaSynth', 'Cancelling one time midi');
            this.stopOneTimeMidi();
        }

        Logger.debug('AlphaSynth', 'Starting playback');
        this._synthesizer.setupMetronomeChannel(this.metronomeVolume);
        this._synthStopping = false;
        this.state = PlayerState.Playing;
        (this.stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(
            new PlayerStateChangedEventArgs(this.state, false)
        );
    }

    public pause(): void {
        if (this.state === PlayerState.Paused || !this._isMidiLoaded) {
            return;
        }
        Logger.debug('AlphaSynth', 'Pausing playback');
        this.state = PlayerState.Paused;
        (this.stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(
            new PlayerStateChangedEventArgs(this.state, false)
        );
        this.output.pause();
        this._synthesizer.noteOffAll(false);
    }

    public playPause(): void {
        if (this.state !== PlayerState.Paused || !this._isMidiLoaded) {
            this.pause();
        } else {
            this.play();
        }
    }

    public stop(): void {
        if (!this._isMidiLoaded) {
            return;
        }
        Logger.debug('AlphaSynth', 'Stopping playback');
        this.state = PlayerState.Paused;
        this.output.pause();
        this._notPlayedSamples = 0;
        this._sequencer.stop();
        this._synthesizer.noteOffAll(true);
        this.tickPosition = this._sequencer.mainPlaybackRange ? this._sequencer.mainPlaybackRange.startTick : 0;
        (this.stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(
            new PlayerStateChangedEventArgs(this.state, true)
        );
    }

    public playOneTimeMidiFile(midi: MidiFile): void {
        if (this._sequencer.isPlayingOneTimeMidi) {
            this.stopOneTimeMidi();
        } else {
            // pause current playback.
            this.pause();
        }

        this._sequencer.loadOneTimeMidi(midi);
        this._synthesizer.noteOffAll(true);

        // update the internal position
        this.updateTimePosition(0, true);

        // tell the output to reset the already synthesized buffers and request data again
        this._notPlayedSamples = 0;
        this.output.resetSamples();

        this.output.play();
    }

    public resetSoundFonts(): void {
        this.stop();
        this._synthesizer.resetPresets();
        this._loadedSoundFonts = [];
        this._isSoundFontLoaded = false;
        (this.soundFontLoaded as EventEmitter).trigger();
    }

    private _loadedSoundFonts: Hydra[] = [];

    public loadSoundFont(data: Uint8Array, append: boolean): void {
        this.pause();

        const input: ByteBuffer = ByteBuffer.fromBuffer(data);
        try {
            Logger.debug('AlphaSynth', 'Loading soundfont from bytes');
            const soundFont: Hydra = new Hydra();
            soundFont.load(input);
            if (!append) {
                this._loadedSoundFonts = [];
            }
            this._loadedSoundFonts.push(soundFont);

            this._isSoundFontLoaded = true;
            (this.soundFontLoaded as EventEmitter).trigger();

            Logger.debug('AlphaSynth', 'soundFont successfully loaded');
            this.checkReadyForPlayback();
        } catch (e) {
            Logger.error('AlphaSynth', `Could not load soundfont from bytes ${e}`);
            (this.soundFontLoadFailed as EventEmitterOfT<Error>).trigger(e as Error);
        }
    }

    private checkReadyForPlayback(): void {
        if (this.isReadyForPlayback) {
            this._synthesizer.setupMetronomeChannel(this.metronomeVolume);
            const programs = this._sequencer.instrumentPrograms;
            const percussionKeys = this._sequencer.percussionKeys;
            let append = false;
            for (const soundFont of this._loadedSoundFonts) {
                this._synthesizer.loadPresets(soundFont, programs, percussionKeys, append);
                append = true;
            }
            (this.readyForPlayback as EventEmitter).trigger();
        }
    }

    /**
     * Loads the given midi file for playback.
     * @param midi The midi file to load
     */
    public loadMidiFile(midi: MidiFile): void {
        this.stop();

        try {
            Logger.debug('AlphaSynth', 'Loading midi from model');
            this._sequencer.loadMidi(midi);
            this._isMidiLoaded = true;
            (this.midiLoaded as EventEmitterOfT<PositionChangedEventArgs>).trigger(
                new PositionChangedEventArgs(
                    0,
                    this._sequencer.currentEndTime,
                    0,
                    this._sequencer.currentEndTick,
                    false
                )
            );
            Logger.debug('AlphaSynth', 'Midi successfully loaded');
            this.checkReadyForPlayback();
            this.tickPosition = 0;
        } catch (e) {
            Logger.error('AlphaSynth', `Could not load midi from model ${e}`);
            (this.midiLoadFailed as EventEmitterOfT<Error>).trigger(e as Error);
        }
    }

    public applyTranspositionPitches(transpositionPitches: Map<number, number>): void {
        this._synthesizer.applyTranspositionPitches(transpositionPitches);
    }

    public setChannelTranspositionPitch(channel: number, semitones: number): void {
        this._synthesizer.setChannelTranspositionPitch(channel, semitones);
    }

    public setChannelMute(channel: number, mute: boolean): void {
        this._synthesizer.channelSetMute(channel, mute);
    }

    public resetChannelStates(): void {
        this._synthesizer.resetChannelStates();
    }

    public setChannelSolo(channel: number, solo: boolean): void {
        this._synthesizer.channelSetSolo(channel, solo);
    }

    public setChannelVolume(channel: number, volume: number): void {
        volume = Math.max(volume, SynthConstants.MinVolume);
        this._synthesizer.channelSetMixVolume(channel, volume);
    }

    private onSamplesPlayed(sampleCount: number): void {
        if (sampleCount === 0) {
            return;
        }
        const playedMillis: number = (sampleCount / this._synthesizer.outSampleRate) * 1000;
        this._notPlayedSamples -= sampleCount * SynthConstants.AudioChannels;
        this.updateTimePosition(this._timePosition + playedMillis, false);
        this.checkForFinish();
    }

    private checkForFinish() {
        let startTick = 0;
        let endTick = 0;

        if (this.playbackRange && this._sequencer.isPlayingMain) {
            startTick = this.playbackRange.startTick;
            endTick = this.playbackRange.endTick;
        } else {
            endTick = this._sequencer.currentEndTick;
        }

        if (this._tickPosition >= endTick && this._notPlayedSamples <= 0) {
            this._notPlayedSamples = 0;
            if (this._sequencer.isPlayingCountIn) {
                Logger.debug('AlphaSynth', 'Finished playback (count-in)');
                this._sequencer.resetCountIn();
                this.timePosition = this._sequencer.currentTime;
                this.playInternal();
                this.output.resetSamples();
            } else if (this._sequencer.isPlayingOneTimeMidi) {
                Logger.debug('AlphaSynth', 'Finished playback (one time)');
                this.output.resetSamples();
                this.state = PlayerState.Paused;
                this.stopOneTimeMidi();
            } else if (this.isLooping) {
                Logger.debug('AlphaSynth', 'Finished playback (main looping)');
                (this.finished as EventEmitter).trigger();
                this.tickPosition = startTick;
                this._synthStopping = false;
            } else if (this._synthesizer.activeVoiceCount > 0) {
                // smooth stop
                if (!this._synthStopping) {
                    this._synthesizer.noteOffAll(true);
                    this._synthStopping = true;
                }
            } else {
                this._synthStopping = false;
                Logger.debug('AlphaSynth', 'Finished playback (main)');
                (this.finished as EventEmitter).trigger();
                this.stop();
            }
        }
    }

    private stopOneTimeMidi() {
        this.output.pause();
        this._synthesizer.noteOffAll(true);
        this._sequencer.resetOneTimeMidi();
        this.timePosition = this._sequencer.currentTime;
    }

    private updateTimePosition(timePosition: number, isSeek: boolean): void {
        // update the real positions
        let currentTime: number = timePosition;
        this._timePosition = currentTime;
        let currentTick: number = this._sequencer.currentTimePositionToTickPosition(currentTime);
        this._tickPosition = currentTick;

        const endTime: number = this._sequencer.currentEndTime;
        const endTick: number = this._sequencer.currentEndTick;

        // on fade outs we can have some milliseconds longer, ensure we don't report this
        if (currentTime > endTime) {
            currentTime = endTime;
            currentTick = endTick;
        }

        const mode = this._sequencer.isPlayingMain
            ? 'main'
            : this._sequencer.isPlayingCountIn
              ? 'count-in'
              : 'one-time';

        Logger.debug(
            'AlphaSynth',
            `Position changed: (time: ${currentTime}/${endTime}, tick: ${currentTick}/${endTick}, Active Voices: ${this._synthesizer.activeVoiceCount} (${mode})`
        );

        if (this._sequencer.isPlayingMain) {
            (this.positionChanged as EventEmitterOfT<PositionChangedEventArgs>).trigger(
                new PositionChangedEventArgs(currentTime, endTime, currentTick, endTick, isSeek)
            );
        }

        // build events which were actually played
        if (isSeek) {
            this._playedEventsQueue.clear();
        } else {
            const playedEvents = new Queue<MidiEvent>();
            while (!this._playedEventsQueue.isEmpty && this._playedEventsQueue.peek().time < currentTime) {
                const synthEvent = this._playedEventsQueue.dequeue();
                playedEvents.enqueue(synthEvent.event);
            }
            if (!playedEvents.isEmpty) {
                (this.midiEventsPlayed as EventEmitterOfT<MidiEventsPlayedEventArgs>).trigger(
                    new MidiEventsPlayedEventArgs(playedEvents.toArray())
                );
            }
        }
    }

    readonly ready: IEventEmitter = new EventEmitter();
    readonly readyForPlayback: IEventEmitter = new EventEmitter();
    readonly finished: IEventEmitter = new EventEmitter();
    readonly soundFontLoaded: IEventEmitter = new EventEmitter();
    readonly soundFontLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    readonly midiLoaded: IEventEmitterOfT<PositionChangedEventArgs> = new EventEmitterOfT<PositionChangedEventArgs>();
    readonly midiLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    readonly stateChanged: IEventEmitterOfT<PlayerStateChangedEventArgs> =
        new EventEmitterOfT<PlayerStateChangedEventArgs>();
    readonly positionChanged: IEventEmitterOfT<PositionChangedEventArgs> =
        new EventEmitterOfT<PositionChangedEventArgs>();
    readonly midiEventsPlayed: IEventEmitterOfT<MidiEventsPlayedEventArgs> =
        new EventEmitterOfT<MidiEventsPlayedEventArgs>();
    readonly playbackRangeChanged: IEventEmitterOfT<PlaybackRangeChangedEventArgs> =
        new EventEmitterOfT<PlaybackRangeChangedEventArgs>();

    /**
     * @internal
     */
    public hasSamplesForProgram(program: number): boolean {
        return this._synthesizer.hasSamplesForProgram(program);
    }

    /**
     * @internal
     */
    public hasSamplesForPercussion(key: number): boolean {
        return this._synthesizer.hasSamplesForPercussion(key);
    }
}
