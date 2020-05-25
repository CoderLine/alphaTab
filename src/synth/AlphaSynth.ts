import { MidiFile } from '@src/midi/MidiFile';
import { IAlphaSynth } from '@src/synth/IAlphaSynth';
import { ISynthOutput } from '@src/synth/ISynthOutput';
import { MidiFileSequencer } from '@src/synth/MidiFileSequencer';
import { PlaybackRange } from '@src/synth/PlaybackRange';
import { PlayerState } from '@src/synth/PlayerState';
import { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { Hydra } from '@src/synth/soundfont/Hydra';
import { TinySoundFont } from '@src/synth/synthesis/TinySoundFont';
import { SynthHelper } from '@src/synth/SynthHelper';
import { EventEmitter, IEventEmitter, IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Logger } from '@src/Logger';
import { LogLevel } from '@src/LogLevel';
import { SynthConstants } from '@src/synth/SynthConstants';

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

    /**
     * Gets the {@link ISynthOutput} used for playing the generated samples.
     */
    public readonly output: ISynthOutput;

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
        return this._synthesizer.globalGainDb;
    }

    public set masterVolume(value: number) {
        value = SynthHelper.clamp(value, SynthConstants.MinVolume, SynthConstants.MaxVolume);
        this._synthesizer.globalGainDb = value;
    }

    public get metronomeVolume(): number {
        return this._metronomeVolume;
    }

    public set metronomeVolume(value: number) {
        value = SynthHelper.clamp(value, SynthConstants.MinVolume, SynthConstants.MaxVolume);
        this._metronomeVolume = value;
        this._synthesizer.metronomeVolume = value;
    }

    public get playbackSpeed(): number {
        return this._sequencer.playbackSpeed;
    }

    public set playbackSpeed(value: number) {
        value = SynthHelper.clamp(value, SynthConstants.MinPlaybackSpeed, SynthConstants.MaxPlaybackSpeed);
        let oldSpeed: number = this._sequencer.playbackSpeed;
        this._sequencer.playbackSpeed = value;
        this.updateTimePosition(this._timePosition * (oldSpeed / value));
    }

    public get tickPosition(): number {
        return this._tickPosition;
    }

    public set tickPosition(value: number) {
        this.timePosition = this._sequencer.tickPositionToTimePosition(value);
    }

    public get timePosition(): number {
        return this._timePosition;
    }

    public set timePosition(value: number) {
        Logger.debug('AlphaSynth', `Seeking to position ${value}ms`);

        // tell the sequencer to jump to the given position
        this._sequencer.seek(value);

        // update the internal position
        this.updateTimePosition(value);

        // tell the output to reset the already synthesized buffers and request data again
        this.output.resetSamples();
    }

    public get playbackRange(): PlaybackRange | null {
        return this._sequencer.playbackRange;
    }

    public set playbackRange(value: PlaybackRange | null) {
        this._sequencer.playbackRange = value;
        if (value) {
            this.tickPosition = value.startTick;
        }
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
    }

    /**
     * Initializes a new instance of the {@link AlphaSynth} class.
     * @param output The output to use for playing the generated samples.
     */
    public constructor(output: ISynthOutput) {
        Logger.debug('AlphaSynth', 'Initializing player');
        this.state = PlayerState.Paused;

        Logger.debug('AlphaSynth', 'Creating output');
        this.output = output;
        this.output.ready.on(() => {
            this.isReady = true;
            (this.ready as EventEmitter).trigger();
            this.checkReadyForPlayback();
        });
        this.output.finished.on(() => {
            // stop everything
            this.stop();
            Logger.debug('AlphaSynth', 'Finished playback');
            (this.finished as EventEmitter).trigger();
            if (this._sequencer.isLooping) {
                this.play();
            }
        });
        this.output.sampleRequest.on(() => {
            // synthesize buffer
            this._sequencer.fillMidiEventQueue();
            let samples: Float32Array = this._synthesizer.synthesize();
            // send it to output
            this.output.addSamples(samples);
            // tell sequencer to check whether its work is done
            this._sequencer.checkForStop();
        });
        this.output.samplesPlayed.on(this.onSamplesPlayed.bind(this));

        Logger.debug('AlphaSynth', 'Creating synthesizer');
        this._synthesizer = new TinySoundFont(this.output.sampleRate);
        this._sequencer = new MidiFileSequencer(this._synthesizer);
        this._sequencer.finished.on(this.output.sequencerFinished.bind(this.output));

        Logger.debug('AlphaSynth', 'Opening output');
        this.output.open();
    }

    public play(): boolean {
        if (this.state === PlayerState.Playing || !this.isReadyForPlayback) {
            return false;
        }
        this.output.activate();
        this._synthesizer.setupMetronomeChannel(this.metronomeVolume);
        Logger.debug('AlphaSynth', 'Starting playback');
        this.state = PlayerState.Playing;
        (this.stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(
            new PlayerStateChangedEventArgs(this.state, false)
        );
        this.output.play();
        return true;
    }

    public pause(): void {
        if (this.state === PlayerState.Paused || !this.isReadyForPlayback) {
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
        if (this.state === PlayerState.Playing || !this.isReadyForPlayback) {
            this.pause();
        } else {
            this.play();
        }
    }

    public stop(): void {
        if (!this.isReadyForPlayback) {
            return;
        }
        Logger.debug('AlphaSynth', 'Stopping playback');
        this.state = PlayerState.Paused;
        this.output.pause();
        this._sequencer.stop();
        this._synthesizer.noteOffAll(true);
        this.tickPosition = this._sequencer.playbackRange ? this._sequencer.playbackRange.startTick : 0;
        (this.stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(
            new PlayerStateChangedEventArgs(this.state, true)
        );
    }

    public loadSoundFont(data: Uint8Array): void {
        this.pause();

        let input: ByteBuffer = ByteBuffer.fromBuffer(data);
        try {
            Logger.debug('AlphaSynth', 'Loading soundfont from bytes');
            let soundFont: Hydra = new Hydra();
            soundFont.load(input);
            this._synthesizer.loadPresets(soundFont);
            this._isSoundFontLoaded = true;
            (this.soundFontLoaded as EventEmitter).trigger();

            Logger.debug('AlphaSynth', 'soundFont successfully loaded');
            this.checkReadyForPlayback();
        } catch (e) {
            Logger.error('AlphaSynth', 'Could not load soundfont from bytes ' + e);
            (this.soundFontLoadFailed as EventEmitterOfT<Error>).trigger(e);
        }
    }

    private checkReadyForPlayback(): void {
        if (this.isReadyForPlayback) {
            this._synthesizer.setupMetronomeChannel(this.metronomeVolume);
            (this.readyForPlayback as EventEmitter).trigger();
        }
    }

    /**
     * Loads the given midi file for playback.
     * @param midiFile The midi file to load
     */
    public loadMidiFile(midiFile: MidiFile): void {
        this.stop();

        try {
            Logger.debug('AlphaSynth', 'Loading midi from model');
            this._sequencer.loadMidi(midiFile);
            this._isMidiLoaded = true;
            (this.midiLoaded as EventEmitter).trigger();

            Logger.debug('AlphaSynth', 'Midi successfully loaded');
            this.checkReadyForPlayback();
            this.tickPosition = 0;
        } catch (e) {
            Logger.error('AlphaSynth', 'Could not load midi from model ' + e);
            (this.midiLoadFailed as EventEmitterOfT<Error>).trigger(e);
        }
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
        volume = SynthHelper.clamp(volume, SynthConstants.MinVolume, SynthConstants.MaxVolume);
        this._synthesizer.channelSetMixVolume(channel, volume);
    }

    public setChannelProgram(channel: number, program: number): void {
        program = SynthHelper.clamp(program, SynthConstants.MinProgram, SynthConstants.MaxProgram);
        this._sequencer.setChannelProgram(channel, program);
        this._synthesizer.channelSetPresetNumber(channel, program, false);
    }

    private onSamplesPlayed(sampleCount: number): void {
        let playedMillis: number = (sampleCount / this._synthesizer.outSampleRate) * 1000;
        this.updateTimePosition(this._timePosition + playedMillis);
    }

    private updateTimePosition(timePosition: number): void {
        // update the real positions
        const currentTime: number = (this._timePosition = timePosition);
        const currentTick: number = (this._tickPosition = this._sequencer.timePositionToTickPosition(currentTime));
        const endTime: number = this._sequencer.endTime;
        const endTick: number = this._sequencer.endTick;
        Logger.debug(
            'AlphaSynth',
            `Position changed: (time: ${currentTime}/${endTime}, tick: ${currentTick}/${endTime}, Active Voices: ${this._synthesizer.activeVoiceCount}`
        );
        (this.positionChanged as EventEmitterOfT<PositionChangedEventArgs>).trigger(
            new PositionChangedEventArgs(currentTime, endTime, currentTick, endTick)
        );
    }

    readonly ready: IEventEmitter = new EventEmitter();
    readonly readyForPlayback: IEventEmitter = new EventEmitter();
    readonly finished: IEventEmitter = new EventEmitter();
    readonly soundFontLoaded: IEventEmitter = new EventEmitter();
    readonly soundFontLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    readonly midiLoaded: IEventEmitter = new EventEmitter();
    readonly midiLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    readonly stateChanged: IEventEmitterOfT<PlayerStateChangedEventArgs> = new EventEmitterOfT<
        PlayerStateChangedEventArgs
    >();
    readonly positionChanged: IEventEmitterOfT<PositionChangedEventArgs> = new EventEmitterOfT<
        PositionChangedEventArgs
    >();
}
