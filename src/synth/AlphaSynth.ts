import type { MidiFile } from '@src/midi/MidiFile';
import type { BackingTrackSyncPoint, IAlphaSynth } from '@src/synth/IAlphaSynth';
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
import type { Score } from '@src/model/Score';
import type { IAudioSampleSynthesizer } from '@src/synth/IAudioSampleSynthesizer';
// biome-ignore lint/correctness/noUnusedImports: used in tsdoc
import { AudioExportChunk, type IAudioExporter, type AudioExportOptions } from '@src/synth/IAudioExporter';
import type { Preset } from '@src/synth/synthesis/Preset';
import { MidiUtils } from '@src/midi/MidiUtils';

/**
 * This is the base class for synthesizer components which can be used to
 * play a {@link MidiFile} via a {@link ISynthOutput}.
 */
export class AlphaSynthBase implements IAlphaSynth {
    protected sequencer: MidiFileSequencer;
    protected synthesizer: IAudioSampleSynthesizer;
    protected isSoundFontLoaded: boolean = false;
    private _isMidiLoaded: boolean = false;
    private _tickPosition: number = 0;
    private _timePosition: number = 0;
    private _metronomeVolume: number = 0;
    private _countInVolume: number = 0;
    protected _playedEventsQueue: Queue<SynthEvent> = new Queue<SynthEvent>();
    protected _midiEventsPlayedFilter: Set<MidiEventType> = new Set<MidiEventType>();
    private _notPlayedSamples: number = 0;
    private _synthStopping = false;
    private _output: ISynthOutput;
    private _loadedMidiInfo?: PositionChangedEventArgs;
    private _currentPosition: PositionChangedEventArgs = new PositionChangedEventArgs(0, 0, 0, 0, false, 120, 120);

    public get output(): ISynthOutput {
        return this._output;
    }

    public isReady: boolean = false;

    public get isReadyForPlayback(): boolean {
        return this.isReady && this.isSoundFontLoaded && this._isMidiLoaded;
    }

    public state: PlayerState = PlayerState.Paused;

    public get logLevel(): LogLevel {
        return Logger.logLevel;
    }

    public set logLevel(value: LogLevel) {
        Logger.logLevel = value;
    }

    public get masterVolume(): number {
        return this.synthesizer.masterVolume;
    }

    public set masterVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this.updateMasterVolume(value);
    }

    protected updateMasterVolume(value: number) {
        this.synthesizer.masterVolume = value;
    }

    public get metronomeVolume(): number {
        return this._metronomeVolume;
    }

    public set metronomeVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this._metronomeVolume = value;
        this.synthesizer.metronomeVolume = value;
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
        return this.sequencer.playbackSpeed;
    }

    public set playbackSpeed(value: number) {
        value = ModelUtils.clamp(value, SynthConstants.MinPlaybackSpeed, SynthConstants.MaxPlaybackSpeed);
        this.updatePlaybackSpeed(value);
    }

    protected updatePlaybackSpeed(value: number) {
        const oldSpeed: number = this.sequencer.playbackSpeed;
        this.sequencer.playbackSpeed = value;
        this.timePosition = this.timePosition * (oldSpeed / value);
    }

    public get loadedMidiInfo(): PositionChangedEventArgs | undefined {
        return this._loadedMidiInfo;
    }

    public get currentPosition(): PositionChangedEventArgs {
        return this._currentPosition;
    }

    public get tickPosition(): number {
        return this._tickPosition;
    }

    public set tickPosition(value: number) {
        this.timePosition = this.sequencer.mainTickPositionToTimePosition(value);
    }

    public get timePosition(): number {
        return this._timePosition;
    }

    public set timePosition(value: number) {
        Logger.debug('AlphaSynth', `Seeking to position ${value}ms (main)`);

        // tell the sequencer to jump to the given position
        this.sequencer.mainSeek(value);

        // update the internal position
        this.updateTimePosition(value, true);

        // tell the output to reset the already synthesized buffers and request data again
        if (this.sequencer.isPlayingMain) {
            this._notPlayedSamples = 0;
            this.output.resetSamples();
        }
    }

    public get playbackRange(): PlaybackRange | null {
        return this.sequencer.mainPlaybackRange;
    }

    public set playbackRange(value: PlaybackRange | null) {
        this.sequencer.mainPlaybackRange = value;
        if (value) {
            this.tickPosition = value.startTick;
        }
        (this.playbackRangeChanged as EventEmitterOfT<PlaybackRangeChangedEventArgs>).trigger(
            new PlaybackRangeChangedEventArgs(value)
        );
    }

    public get isLooping(): boolean {
        return this.sequencer.isLooping;
    }

    public set isLooping(value: boolean) {
        this.sequencer.isLooping = value;
    }

    public destroy(): void {
        Logger.debug('AlphaSynth', 'Destroying player');
        this.stop();
        this.output.destroy();
    }

    /**
     * Initializes a new instance of the {@link AlphaSynthBase} class.
     * @param output The output to use for playing the generated samples.
     */
    public constructor(output: ISynthOutput, synthesizer: IAudioSampleSynthesizer, bufferTimeInMilliseconds: number) {
        Logger.debug('AlphaSynth', 'Initializing player');
        this.state = PlayerState.Paused;

        this.ready = new EventEmitter(() => this.isReady);
        this.readyForPlayback = new EventEmitter(() => this.isReadyForPlayback);
        this.midiLoaded = new EventEmitterOfT<PositionChangedEventArgs>(() => {
            if (this._loadedMidiInfo) {
                return this._loadedMidiInfo;
            }
            return null;
        });
        this.stateChanged = new EventEmitterOfT<PlayerStateChangedEventArgs>(() => {
            return new PlayerStateChangedEventArgs(this.state, false);
        });
        this.positionChanged = new EventEmitterOfT<PositionChangedEventArgs>(() => {
            return this._currentPosition;
        });
        this.playbackRangeChanged = new EventEmitterOfT<PlaybackRangeChangedEventArgs>(() => {
            if (this.playbackRange) {
                return new PlaybackRangeChangedEventArgs(this.playbackRange);
            }
            return null;
        });

        Logger.debug('AlphaSynth', 'Creating output');
        this._output = output;

        Logger.debug('AlphaSynth', 'Creating synthesizer');
        this.synthesizer = synthesizer;
        this.sequencer = new MidiFileSequencer(this.synthesizer);

        Logger.debug('AlphaSynth', 'Opening output');
        this.output.ready.on(() => {
            this.isReady = true;
            (this.ready as EventEmitter).trigger();
            this.checkReadyForPlayback();
        });
        this.output.sampleRequest.on(() => {
            this.onSampleRequest();
        });
        this.output.samplesPlayed.on(this.onSamplesPlayed.bind(this));
        this.output.open(bufferTimeInMilliseconds);
    }

    protected onSampleRequest() {
        if (
            this.state === PlayerState.Playing &&
            (!this.sequencer.isFinished || this.synthesizer.activeVoiceCount > 0)
        ) {
            let samples: Float32Array = new Float32Array(
                SynthConstants.MicroBufferSize * SynthConstants.MicroBufferCount * SynthConstants.AudioChannels
            );
            let bufferPos: number = 0;

            for (let i = 0; i < SynthConstants.MicroBufferCount; i++) {
                // synthesize buffer
                this.sequencer.fillMidiEventQueue();
                const synthesizedEvents = this.synthesizer.synthesize(
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
                if (this.sequencer.isFinished) {
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
    }

    public play(): boolean {
        if (this.state !== PlayerState.Paused || !this._isMidiLoaded) {
            return false;
        }
        this.output.activate();

        this.playInternal();

        if (this._countInVolume > 0) {
            Logger.debug('AlphaSynth', 'Starting countin');
            this.sequencer.startCountIn();
            this.synthesizer.setupMetronomeChannel(this._countInVolume);
            this.updateTimePosition(0, true);
        }

        this.output.play();
        return true;
    }

    private playInternal() {
        if (this.sequencer.isPlayingOneTimeMidi) {
            Logger.debug('AlphaSynth', 'Cancelling one time midi');
            this.stopOneTimeMidi();
        }

        Logger.debug('AlphaSynth', 'Starting playback');
        this.synthesizer.setupMetronomeChannel(this.metronomeVolume);
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
        this.synthesizer.noteOffAll(false);
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
        this.sequencer.stop();
        this.synthesizer.noteOffAll(true);
        this.tickPosition = this.sequencer.mainPlaybackRange ? this.sequencer.mainPlaybackRange.startTick : 0;
        (this.stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(
            new PlayerStateChangedEventArgs(this.state, true)
        );
    }

    public playOneTimeMidiFile(midi: MidiFile): void {
        if (this.sequencer.isPlayingOneTimeMidi) {
            this.stopOneTimeMidi();
        } else {
            // pause current playback.
            this.pause();
        }

        this.sequencer.loadOneTimeMidi(midi);
        this.synthesizer.noteOffAll(true);

        // update the internal position
        this.updateTimePosition(0, true);

        // tell the output to reset the already synthesized buffers and request data again
        this._notPlayedSamples = 0;
        this.output.resetSamples();

        this.output.play();
    }

    public resetSoundFonts(): void {
        this.stop();
        this.synthesizer.resetPresets();
        this._loadedSoundFonts = [];
        this.isSoundFontLoaded = false;
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

            this.isSoundFontLoaded = true;
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
            this.synthesizer.setupMetronomeChannel(this.metronomeVolume);
            const programs = this.sequencer.instrumentPrograms;
            const percussionKeys = this.sequencer.percussionKeys;
            let append = false;
            for (const soundFont of this._loadedSoundFonts) {
                this.synthesizer.loadPresets(soundFont, programs, percussionKeys, append);
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
            this.sequencer.loadMidi(midi);
            this._isMidiLoaded = true;
            this._loadedMidiInfo = new PositionChangedEventArgs(
                0,
                this.sequencer.currentEndTime,
                0,
                this.sequencer.currentEndTick,
                false,
                this.sequencer.currentTempo,
                this.sequencer.modifiedTempo
            );
            (this.midiLoaded as EventEmitterOfT<PositionChangedEventArgs>).trigger(this._loadedMidiInfo);
            Logger.debug('AlphaSynth', 'Midi successfully loaded');
            this.checkReadyForPlayback();
            this.tickPosition = 0;
        } catch (e) {
            Logger.error('AlphaSynth', `Could not load midi from model ${e}`);
            (this.midiLoadFailed as EventEmitterOfT<Error>).trigger(e as Error);
        }
    }

    public applyTranspositionPitches(transpositionPitches: Map<number, number>): void {
        this.synthesizer.applyTranspositionPitches(transpositionPitches);
    }

    public setChannelTranspositionPitch(channel: number, semitones: number): void {
        this.synthesizer.setChannelTranspositionPitch(channel, semitones);
    }

    public setChannelMute(channel: number, mute: boolean): void {
        this.synthesizer.channelSetMute(channel, mute);
    }

    public resetChannelStates(): void {
        this.synthesizer.resetChannelStates();
    }

    public setChannelSolo(channel: number, solo: boolean): void {
        this.synthesizer.channelSetSolo(channel, solo);
    }

    public setChannelVolume(channel: number, volume: number): void {
        volume = Math.max(volume, SynthConstants.MinVolume);
        this.synthesizer.channelSetMixVolume(channel, volume);
    }

    private onSamplesPlayed(sampleCount: number): void {
        if (sampleCount === 0) {
            return;
        }
        const playedMillis: number = (sampleCount / this.synthesizer.outSampleRate) * 1000;
        this._notPlayedSamples -= sampleCount * SynthConstants.AudioChannels;
        this.updateTimePosition(this._timePosition + playedMillis, false);
        this.checkForFinish();
    }

    protected checkForFinish() {
        let startTick = 0;
        let endTick = 0;

        if (this.playbackRange && this.sequencer.isPlayingMain) {
            startTick = this.playbackRange.startTick;
            endTick = this.playbackRange.endTick;
        } else {
            endTick = this.sequencer.currentEndTick;
        }

        if (this._tickPosition >= endTick) {
            // fully done with playback of remaining samples?
            if (this._notPlayedSamples <= 0) {
                this._notPlayedSamples = 0;
                if (this.sequencer.isPlayingCountIn) {
                    Logger.debug('AlphaSynth', 'Finished playback (count-in)');
                    this.sequencer.resetCountIn();
                    this.timePosition = this.sequencer.currentTime;
                    this.playInternal();
                    this.output.resetSamples();
                } else if (this.sequencer.isPlayingOneTimeMidi) {
                    Logger.debug('AlphaSynth', 'Finished playback (one time)');
                    this.output.resetSamples();
                    this.state = PlayerState.Paused;
                    this.stopOneTimeMidi();
                } else if (this.isLooping) {
                    Logger.debug('AlphaSynth', 'Finished playback (main looping)');
                    (this.finished as EventEmitter).trigger();
                    this.tickPosition = startTick;
                    this._synthStopping = false;
                } else if (this.synthesizer.activeVoiceCount > 0) {
                    // smooth stop
                    if (!this._synthStopping) {
                        Logger.debug('AlphaSynth', 'Signaling synth to stop all voices (all samples played)');
                        this.synthesizer.noteOffAll(true);
                        this._synthStopping = true;
                    }
                } else {
                    this._synthStopping = false;
                    Logger.debug('AlphaSynth', 'Finished playback (main)');
                    (this.finished as EventEmitter).trigger();
                    this.stop();
                }
            } else {
                // the output still has to play some samples, signal the synth to stop
                // to eventually bring the voices down to 0 and stop playing
                if (!this._synthStopping) {
                    Logger.debug('AlphaSynth', 'Signaling synth to stop all voices (not all samples played)');
                    this.synthesizer.noteOffAll(true);
                    this._synthStopping = true;
                }
            }
        }
    }

    private stopOneTimeMidi() {
        this.output.pause();
        this.synthesizer.noteOffAll(true);
        this.sequencer.resetOneTimeMidi();
        this.timePosition = this.sequencer.currentTime;
    }

    private createPositionChangedEventArgs(isSeek: boolean) {
        // on fade outs we can have some milliseconds longer, ensure we don't report this
        let currentTime: number = this._timePosition;
        let currentTick: number = this.sequencer.currentTimePositionToTickPosition(currentTime);
        const endTime: number = this.sequencer.currentEndTime;
        const endTick: number = this.sequencer.currentEndTick;

        if (currentTime > endTime) {
            currentTime = endTime;
            currentTick = endTick;
        }

        return new PositionChangedEventArgs(
            currentTime,
            endTime,
            currentTick,
            endTick,
            isSeek,
            this.sequencer.currentTempo,
            this.sequencer.modifiedTempo
        );
    }

    protected updateTimePosition(timePosition: number, isSeek: boolean): void {
        // update the real positions
        this._timePosition = timePosition;
        const args = this.createPositionChangedEventArgs(isSeek);

        this._tickPosition = args.currentTick;

        const mode = this.sequencer.isPlayingMain ? 'main' : this.sequencer.isPlayingCountIn ? 'count-in' : 'one-time';

        Logger.debug(
            'AlphaSynth',
            `Position changed: (time: ${args.currentTime}/${args.endTime}, tick: ${args.currentTick}/${args.endTick}, Active Voices: ${this.synthesizer.activeVoiceCount} (${mode}), Tempo original: ${this.sequencer.currentTempo}, Tempo modified: ${this.sequencer.modifiedTempo})`
        );

        if (this.sequencer.isPlayingMain) {
            this._currentPosition = args;
            (this.positionChanged as EventEmitterOfT<PositionChangedEventArgs>).trigger(args);
        }

        // build events which were actually played
        if (isSeek) {
            this._playedEventsQueue.clear();
        } else {
            const playedEvents: MidiEvent[] = [];
            while (!this._playedEventsQueue.isEmpty && this._playedEventsQueue.peek()!.time < args.currentTime) {
                const synthEvent = this._playedEventsQueue.dequeue()!;
                playedEvents.push(synthEvent.event);
            }
            if (playedEvents.length > 0) {
                playedEvents.reverse();
                (this.midiEventsPlayed as EventEmitterOfT<MidiEventsPlayedEventArgs>).trigger(
                    new MidiEventsPlayedEventArgs(playedEvents)
                );
            }
        }
    }

    /**
     * @lateinit
     */
    public readonly ready: IEventEmitter;
    public readonly readyForPlayback: IEventEmitter = new EventEmitter();
    public readonly finished: IEventEmitter = new EventEmitter();
    public readonly soundFontLoaded: IEventEmitter = new EventEmitter();
    public readonly soundFontLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    /**
     * @lateinit
     */
    public readonly midiLoaded: IEventEmitterOfT<PositionChangedEventArgs>;
    public readonly midiLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    /**
     * @lateinit
     */
    public readonly stateChanged: IEventEmitterOfT<PlayerStateChangedEventArgs>;
    /**
     * @lateinit
     */
    public readonly positionChanged: IEventEmitterOfT<PositionChangedEventArgs>;
    public readonly midiEventsPlayed: IEventEmitterOfT<MidiEventsPlayedEventArgs> =
        new EventEmitterOfT<MidiEventsPlayedEventArgs>();
    /**
     * @lateinit
     */
    public readonly playbackRangeChanged: IEventEmitterOfT<PlaybackRangeChangedEventArgs>;

    /**
     * @internal
     */
    public hasSamplesForProgram(program: number): boolean {
        return this.synthesizer.hasSamplesForProgram(program);
    }

    /**
     * @internal
     */
    public hasSamplesForPercussion(key: number): boolean {
        return this.synthesizer.hasSamplesForPercussion(key);
    }

    public loadBackingTrack(_score: Score): void {
        // ignore
    }

    public updateSyncPoints(_syncPoints: BackingTrackSyncPoint[]): void {
        // ignore
    }
}

/**
 * This is the main synthesizer component which can be used to
 * play a {@link MidiFile} via a {@link ISynthOutput}.
 */
export class AlphaSynth extends AlphaSynthBase {
    /**
     * Initializes a new instance of the {@link AlphaSynth} class.
     * @param output The output to use for playing the generated samples.
     */
    public constructor(output: ISynthOutput, bufferTimeInMilliseconds: number) {
        super(output, new TinySoundFont(output.sampleRate), bufferTimeInMilliseconds);
    }

    /**
     * Creates a new audio exporter, initialized with the given data.
     * @param options The export options to use.
     * The track volume and transposition pitches must lists must be filled with midi channels.
     * @param midi The midi file to use.
     * @param syncPoints The sync points to use
     * @param transpositionPitches The initial transposition pitches to apply.
     * @param transpositionPitches The initial transposition pitches to apply.
     */
    public exportAudio(
        options: AudioExportOptions,
        midi: MidiFile,
        syncPoints: BackingTrackSyncPoint[],
        mainTranspositionPitches: Map<number, number>
    ): IAlphaSynthAudioExporter {
        const exporter = new AlphaSynthAudioExporter(options);

        exporter.loadMidiFile(midi);
        if (options.useSyncPoints) {
            exporter.updateSyncPoints(syncPoints);
        }
        exporter.applyTranspositionPitches(mainTranspositionPitches);

        for (const [channel, semitones] of options.trackTranspositionPitches) {
            exporter.setChannelTranspositionPitch(channel, semitones);
        }

        for (const [channel, volume] of options.trackVolume) {
            exporter.channelSetMixVolume(channel, volume);
        }

        if (options.soundFonts) {
            for (const f of options.soundFonts!) {
                exporter.loadSoundFont(f);
            }
        } else {
            exporter.loadPresets((this.synthesizer as TinySoundFont).presets);
        }

        if (options.playbackRange) {
            exporter.limitExport(options.playbackRange);
        }

        exporter.setup();

        return exporter;
    }
}

/**
 * An audio exporter allowing streaming synthesis of audio samples with a fixed configuration.
 * This is the internal synchronous version of the public {@link IAudioExporter}.
 */
export interface IAlphaSynthAudioExporter {
    /**
     * Renders the next chunk of audio and provides it as result.
     *
     * @param milliseconds The rough number of milliseconds that should be synthesized and exported as chunk.
     * @returns The requested chunk holding the samples and time information.
     * If the song completed playback `undefined` is returned indicating the end.
     * The provided audio might not be exactly the requested number of milliseconds as the synthesizer internally
     * uses a fixed block size of 64 samples for synthesizing audio. Depending on the sample rate
     * slightly longer audio is contained in the result.
     *
     * When the song ends, the chunk might contain less than the requested duration.
     */
    render(milliseconds: number): AudioExportChunk | undefined;
}

/**
 * A audio exporter allowing streaming synthesis of audio samples with a fixed configuration.
 */
export class AlphaSynthAudioExporter implements IAlphaSynthAudioExporter {
    private _synth: TinySoundFont;
    private _sequencer: MidiFileSequencer;

    constructor(options: AudioExportOptions) {
        this._synth = new TinySoundFont(options.sampleRate);
        this._sequencer = new MidiFileSequencer(this._synth);

        this._synth.masterVolume = Math.max(options.masterVolume, SynthConstants.MinVolume);
        this._synth.metronomeVolume = Math.max(options.metronomeVolume, SynthConstants.MinVolume);
    }

    /**
     * Loads the specified sound font.
     * @param data The soundfont data.
     */
    public loadSoundFont(data: Uint8Array) {
        const input: ByteBuffer = ByteBuffer.fromBuffer(data);
        const soundFont: Hydra = new Hydra();
        soundFont.load(input);

        const programs = this._sequencer.instrumentPrograms;
        const percussionKeys = this._sequencer.percussionKeys;

        this._synth.loadPresets(soundFont, programs, percussionKeys, true);
    }

    /**
     * Loads the specified presets.
     * @param presets The presets to use.
     */
    public loadPresets(presets: Preset[] | null) {
        this._synth.presets = presets;
    }

    /**
     * Limits the time range for which the export is done.
     * @param range The time range
     */
    public limitExport(range: PlaybackRange) {
        this._sequencer.mainPlaybackRange = range;
        this._sequencer.mainSeek(this._sequencer.mainTickPositionToTimePosition(range.startTick));
    }

    /**
     * Sets the transposition pitch of a given channel. This pitch is additionally applied beside the
     * ones applied already via {@link applyTranspositionPitches}.
     * @param channel The channel number
     * @param semitones The number of semitones to apply as pitch offset.
     */
    public setChannelTranspositionPitch(channel: number, semitones: number): void {
        this._synth.setChannelTranspositionPitch(channel, semitones);
    }

    /**
     * Applies the given transposition pitches used for general pitch changes that should be applied to the song.
     * Used for general transpositions applied to the file.
     * @param transpositionPitches A map defining for a given list of midi channels the number of semitones that should be adjusted.
     */
    public applyTranspositionPitches(mainTranspositionPitches: Map<number, number>) {
        this._synth.applyTranspositionPitches(mainTranspositionPitches);
    }

    /**
     * Loads the given midi file for synthesis.
     * @param midi The midi file.
     */
    public loadMidiFile(midi: MidiFile) {
        this._sequencer.loadMidi(midi);
    }

    /**
     * Updates the sync points used for time synchronization with a backing track.
     * @param syncPoints  The sync points.
     */
    public updateSyncPoints(syncPoints: BackingTrackSyncPoint[]) {
        this._sequencer.mainUpdateSyncPoints(syncPoints);
    }

    /**
     * Sets the current and initial volume of the given channel.
     * @param channel The channel number.
     * @param volume The volume of of the channel (0.0-1.0)
     */
    public channelSetMixVolume(channel: number, volume: number): void {
        volume = Math.max(volume, SynthConstants.MinVolume);
        this._synth.channelSetMixVolume(channel, volume);
    }

    private _generatedAudioCurrentTime: number = 0;
    private _generatedAudioEndTime: number = 0;

    public setup() {
        this._synth.setupMetronomeChannel(this._synth.metronomeVolume);

        const syncPoints = this._sequencer.currentSyncPoints;
        const alphaTabEndTime = this._sequencer.currentEndTime;

        if (syncPoints.length === 0) {
            this._generatedAudioEndTime = alphaTabEndTime;
        } else {
            const lastSyncPoint = syncPoints[syncPoints.length - 1];
            let endTime = lastSyncPoint.syncTime;
            const remainingTicks = this._sequencer.currentEndTick - lastSyncPoint.synthTick;
            if (remainingTicks > 0) {
                endTime += MidiUtils.ticksToMillis(remainingTicks, lastSyncPoint.syncBpm);
            }
            this._generatedAudioEndTime = endTime;
        }
    }

    public render(milliseconds: number): AudioExportChunk | undefined {
        if (this._sequencer.isFinished) {
            return undefined;
        }

        const oneMicroBufferMillis = (SynthConstants.MicroBufferSize * 1000) / this._synth.outSampleRate;
        const microBufferCount = Math.ceil(milliseconds / oneMicroBufferMillis);

        let samples: Float32Array = new Float32Array(
            SynthConstants.MicroBufferSize * microBufferCount * SynthConstants.AudioChannels
        );

        const syncPoints = this._sequencer.currentSyncPoints;

        let bufferPos: number = 0;
        let subBufferTime = this._generatedAudioCurrentTime;
        let alphaTabGeneratedMillis = 0;
        for (let i = 0; i < microBufferCount; i++) {
            // if we're applying sync points, we calculate the needed tempo and set the playback speed
            if (syncPoints.length > 0) {
                this._sequencer.currentUpdateSyncPoints(subBufferTime);
                this._sequencer.currentUpdateCurrentTempo(this._sequencer.currentTime);
                const newSpeed = this._sequencer.syncPointTempo / this._sequencer.currentTempo;
                if (this._sequencer.playbackSpeed !== newSpeed) {
                    this._sequencer.playbackSpeed = newSpeed;
                }
            }

            this._sequencer.fillMidiEventQueue();
            this._synth.synthesize(samples, bufferPos, SynthConstants.MicroBufferSize);

            bufferPos += SynthConstants.MicroBufferSize * SynthConstants.AudioChannels;
            subBufferTime += oneMicroBufferMillis;
            alphaTabGeneratedMillis += oneMicroBufferMillis * this._sequencer.playbackSpeed;

            if (this._sequencer.isFinished) {
                break;
            }
        }

        if (bufferPos < samples.length) {
            samples = samples.subarray(0, bufferPos);
        }

        const chunk = new AudioExportChunk();

        chunk.currentTime = this._generatedAudioCurrentTime;
        chunk.endTime = this._generatedAudioEndTime;

        chunk.currentTick = this._sequencer.currentTimePositionToTickPosition(this._sequencer.currentTime);
        chunk.endTick = this._sequencer.currentEndTick;

        this._generatedAudioCurrentTime += milliseconds;

        chunk.samples = samples;

        if (this._sequencer.isFinished) {
            this._synth.noteOffAll(true);
        }

        return chunk;
    }
}
