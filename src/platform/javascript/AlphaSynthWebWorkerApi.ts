import { MidiFile } from '@src/midi/MidiFile';
import { IAlphaSynth } from '@src/synth/IAlphaSynth';
import { ISynthOutput } from '@src/synth/ISynthOutput';
import { PlaybackRange } from '@src/synth/PlaybackRange';
import { PlayerState } from '@src/synth/PlayerState';
import { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { SynthHelper } from '@src/synth/SynthHelper';
import { EventEmitter, IEventEmitter, IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';
import { JsonConverter } from '@src/model/JsonConverter';
import { Logger } from '@src/Logger';
import { LogLevel } from '@src/LogLevel';
import { SynthConstants } from '@src/synth/SynthConstants';
import { ProgressEventArgs } from '@src/alphatab';
import { FileLoadError } from '@src/FileLoadError';
import { MidiEventsPlayedEventArgs } from '@src/synth/MidiEventsPlayedEventArgs';
import { MidiEventType } from '@src/midi/MidiEvent';

/**
 * a WebWorker based alphaSynth which uses the given player as output.
 * @target web
 */
export class AlphaSynthWebWorkerApi implements IAlphaSynth {
    private _synth!: Worker;
    private _output: ISynthOutput;
    private _workerIsReadyForPlayback: boolean = false;
    private _workerIsReady: boolean = false;
    private _outputIsReady: boolean = false;
    private _state: PlayerState = PlayerState.Paused;
    private _masterVolume: number = 0;
    private _metronomeVolume: number = 0;
    private _countInVolume: number = 0;
    private _playbackSpeed: number = 0;
    private _tickPosition: number = 0;
    private _timePosition: number = 0;
    private _isLooping: boolean = false;
    private _playbackRange: PlaybackRange | null = null;
    private _midiEventsPlayedFilter: MidiEventType[] = [];

    public get isReady(): boolean {
        return this._workerIsReady && this._outputIsReady;
    }

    public get isReadyForPlayback(): boolean {
        return this._workerIsReadyForPlayback;
    }

    public get state(): PlayerState {
        return this._state;
    }

    public get logLevel(): LogLevel {
        return Logger.logLevel;
    }

    public set logLevel(value: LogLevel) {
        Logger.logLevel = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setLogLevel',
            value: value
        });
    }

    public get masterVolume(): number {
        return this._masterVolume;
    }

    public set masterVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this._masterVolume = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setMasterVolume',
            value: value
        });
    }

    public get metronomeVolume(): number {
        return this._metronomeVolume;
    }

    public set metronomeVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this._metronomeVolume = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setMetronomeVolume',
            value: value
        });
    }
    public get countInVolume(): number {
        return this._countInVolume;
    }

    public set countInVolume(value: number) {
        value = Math.max(value, SynthConstants.MinVolume);
        this._countInVolume = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setCountInVolume',
            value: value
        });
    }

    public get midiEventsPlayedFilter(): MidiEventType[] {
        return this._midiEventsPlayedFilter;
    }

    public set midiEventsPlayedFilter(value: MidiEventType[]) {
        this._midiEventsPlayedFilter = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setMidiEventsPlayedFilter',
            value: value
        })
    }

    public get playbackSpeed(): number {
        return this._playbackSpeed;
    }

    public set playbackSpeed(value: number) {
        value = SynthHelper.clamp(value, SynthConstants.MinPlaybackSpeed, SynthConstants.MaxPlaybackSpeed);
        this._playbackSpeed = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setPlaybackSpeed',
            value: value
        });
    }

    public get tickPosition(): number {
        return this._tickPosition;
    }

    public set tickPosition(value: number) {
        if (value < 0) {
            value = 0;
        }
        this._tickPosition = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setTickPosition',
            value: value
        });
    }

    public get timePosition(): number {
        return this._timePosition;
    }

    public set timePosition(value: number) {
        if (value < 0) {
            value = 0;
        }
        this._timePosition = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setTimePosition',
            value: value
        });
    }

    public get isLooping(): boolean {
        return this._isLooping;
    }

    public set isLooping(value: boolean) {
        this._isLooping = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setIsLooping',
            value: value
        });
    }

    public get playbackRange(): PlaybackRange | null {
        return this._playbackRange;
    }

    public set playbackRange(value: PlaybackRange | null) {
        if (value) {
            if (value.startTick < 0) {
                value.startTick = 0;
            }
            if (value.endTick < 0) {
                value.endTick = 0;
            }
        }
        this._playbackRange = value;
        this._synth.postMessage({
            cmd: 'alphaSynth.setPlaybackRange',
            value: value
        });
    }

    public constructor(player: ISynthOutput, alphaSynthScriptFile: string, logLevel: LogLevel) {
        this._workerIsReadyForPlayback = false;
        this._workerIsReady = false;
        this._outputIsReady = false;
        this._state = PlayerState.Paused;
        this._masterVolume = 0.0;
        this._metronomeVolume = 0.0;
        this._playbackSpeed = 0.0;
        this._tickPosition = 0;
        this._timePosition = 0.0;
        this._isLooping = false;
        this._playbackRange = null;
        this._output = player;
        this._output.ready.on(this.onOutputReady.bind(this));
        this._output.samplesPlayed.on(this.onOutputSamplesPlayed.bind(this));
        this._output.sampleRequest.on(this.onOutputSampleRequest.bind(this));
        this._output.open();
        try {
            let script: string = "importScripts('" + alphaSynthScriptFile + "')";
            let blob: Blob = new Blob([script]);
            this._synth = new Worker(URL.createObjectURL(blob));
        } catch (e) {
            // fallback to direct worker
            try {
                this._synth = new Worker(alphaSynthScriptFile);
            } catch (e2) {
                Logger.error('AlphaSynth', 'Failed to create WebWorker: ' + e2);
                return;
            }
        }
        this._synth.addEventListener('message', this.handleWorkerMessage.bind(this), false);
        this._synth.postMessage({
            cmd: 'alphaSynth.initialize',
            sampleRate: this._output.sampleRate,
            logLevel: logLevel
        });
        this.masterVolume = 1;
        this.playbackSpeed = 1;
        this.metronomeVolume = 0;
    }

    public destroy(): void {
        this._synth.terminate();
    }

    //
    // API communicating with the web worker
    public play(): boolean {
        this._output.activate();
        this._synth.postMessage({
            cmd: 'alphaSynth.play'
        });
        return true;
    }

    public pause(): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.pause'
        });
    }

    public playPause(): void {
        this._output.activate();
        this._synth.postMessage({
            cmd: 'alphaSynth.playPause'
        });
    }

    public stop(): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.stop'
        });
    }

    public playOneTimeMidiFile(midi: MidiFile): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.playOneTimeMidiFile',
            midi: JsonConverter.midiFileToJsObject(midi)
        });
    }

    public loadSoundFont(data: Uint8Array, append: boolean): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.loadSoundFontBytes',
            data: data,
            append: append
        });
    }

    public loadSoundFontFromUrl(url: string, append: boolean, progress: (e: ProgressEventArgs) => void): void {
        Logger.debug('AlphaSynth', `Start loading Soundfont from url ${url}`);
        let request: XMLHttpRequest = new XMLHttpRequest();
        request.open('GET', url, true, null, null);
        request.responseType = 'arraybuffer';
        request.onload = _ => {
            let buffer: Uint8Array = new Uint8Array(request.response);
            this.loadSoundFont(buffer, append);
        };
        request.onerror = e => {
            Logger.error('AlphaSynth', 'Loading failed: ' + (e as any).message);
            (this.soundFontLoadFailed as EventEmitterOfT<Error>).trigger(
                new FileLoadError((e as any).message, request)
            );
        };
        request.onprogress = e => {
            Logger.debug('AlphaSynth', `Soundfont downloading: ${e.loaded}/${e.total} bytes`);
            progress(new ProgressEventArgs(e.loaded, e.total));
        };
        request.send();
    }

    public resetSoundFonts(): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.resetSoundFonts'
        });
    }

    public loadMidiFile(midi: MidiFile): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.loadMidi',
            midi: JsonConverter.midiFileToJsObject(midi)
        });
    }

    public setChannelMute(channel: number, mute: boolean): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.setChannelMute',
            channel: channel,
            mute: mute
        });
    }

    public resetChannelStates(): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.resetChannelStates'
        });
    }

    public setChannelSolo(channel: number, solo: boolean): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.setChannelSolo',
            channel: channel,
            solo: solo
        });
    }

    public setChannelVolume(channel: number, volume: number): void {
        volume = Math.max(volume, SynthConstants.MinVolume);
        this._synth.postMessage({
            cmd: 'alphaSynth.setChannelVolume',
            channel: channel,
            volume: volume
        });
    }

    public handleWorkerMessage(e: MessageEvent): void {
        let data: any = e.data;
        let cmd: string = data.cmd;
        switch (cmd) {
            case 'alphaSynth.ready':
                this._workerIsReady = true;
                this.checkReady();
                break;
            case 'alphaSynth.readyForPlayback':
                this._workerIsReadyForPlayback = true;
                this.checkReadyForPlayback();
                break;
            case 'alphaSynth.positionChanged':
                this._timePosition = data.currentTime;
                this._tickPosition = data.currentTick;
                (this.positionChanged as EventEmitterOfT<PositionChangedEventArgs>).trigger(
                    new PositionChangedEventArgs(data.currentTime, data.endTime, data.currentTick, data.endTick, data.isSeek)
                );
                break;
            case 'alphaSynth.midiEventsPlayed':
                (this.midiEventsPlayed as EventEmitterOfT<MidiEventsPlayedEventArgs>).trigger(
                    new MidiEventsPlayedEventArgs((data.events as unknown[]).map(JsonConverter.jsObjectToMidiEvent))
                );
                break;
            case 'alphaSynth.playerStateChanged':
                this._state = data.state;
                (this.stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(
                    new PlayerStateChangedEventArgs(data.state, data.stopped)
                );
                break;
            case 'alphaSynth.finished':
                (this.finished as EventEmitter).trigger();
                break;
            case 'alphaSynth.soundFontLoaded':
                (this.soundFontLoaded as EventEmitter).trigger();
                break;
            case 'alphaSynth.soundFontLoadFailed':
                (this.soundFontLoadFailed as EventEmitterOfT<Error>).trigger(data.error);
                break;
            case 'alphaSynth.midiLoaded':
                this.checkReadyForPlayback();
                (this.midiLoaded as EventEmitterOfT<PositionChangedEventArgs>).trigger(
                    new PositionChangedEventArgs(data.currentTime, data.endTime, data.currentTick, data.endTick, data.isSeek)
                );
                break;
            case 'alphaSynth.midiLoadFailed':
                this.checkReadyForPlayback();
                (this.midiLoadFailed as EventEmitterOfT<Error>).trigger(data.error);
                break;
            case 'alphaSynth.output.addSamples':
                this._output.addSamples(data.samples);
                break;
            case 'alphaSynth.output.play':
                this._output.play();
                break;
            case 'alphaSynth.output.pause':
                this._output.pause();
                break;
            case 'alphaSynth.output.resetSamples':
                this._output.resetSamples();
                break;
        }
    }

    private checkReady(): void {
        if (this.isReady) {
            (this.ready as EventEmitter).trigger();
        }
    }

    private checkReadyForPlayback(): void {
        if (this.isReadyForPlayback) {
            (this.readyForPlayback as EventEmitter).trigger();
        }
    }

    readonly ready: IEventEmitter = new EventEmitter();
    readonly readyForPlayback: IEventEmitter = new EventEmitter();
    readonly finished: IEventEmitter = new EventEmitter();
    readonly soundFontLoaded: IEventEmitter = new EventEmitter();
    readonly soundFontLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    readonly midiLoaded: IEventEmitterOfT<PositionChangedEventArgs> = new EventEmitterOfT<
        PositionChangedEventArgs
    >();
    readonly midiLoadFailed: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
    readonly stateChanged: IEventEmitterOfT<PlayerStateChangedEventArgs> = new EventEmitterOfT<
        PlayerStateChangedEventArgs
    >();
    readonly positionChanged: IEventEmitterOfT<PositionChangedEventArgs> = new EventEmitterOfT<
        PositionChangedEventArgs
    >(); 
    readonly midiEventsPlayed: IEventEmitterOfT<MidiEventsPlayedEventArgs> = new EventEmitterOfT<
        MidiEventsPlayedEventArgs
    >();

    //
    // output communication ( output -> worker )
    public onOutputSampleRequest(): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.output.sampleRequest'
        });
    }
    public onOutputSamplesPlayed(samples: number): void {
        this._synth.postMessage({
            cmd: 'alphaSynth.output.samplesPlayed',
            samples: samples
        });
    }

    private onOutputReady(): void {
        this._outputIsReady = true;
        this.checkReady();
    }
}
