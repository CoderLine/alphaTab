import { AlphaSynth } from '@src/synth/AlphaSynth';
import { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { JsonConverter } from '@src/model/JsonConverter';
import { AlphaSynthWorkerSynthOutput } from '@src/platform/javascript/AlphaSynthWorkerSynthOutput';
import { IWorkerScope } from '@src/platform/javascript/IWorkerScope';
import { Logger } from '@src/Logger';
import { Environment } from '@src/Environment';

/**
 * This class implements a HTML5 WebWorker based version of alphaSynth
 * which can be controlled via WebWorker messages.
 * @target web
 */
export class AlphaSynthWebWorker {
    public static readonly CmdPrefix: string = 'alphaSynth.';
    public static readonly CmdInitialize: string = AlphaSynthWebWorker.CmdPrefix + 'initialize';
    public static readonly CmdSetLogLevel: string = AlphaSynthWebWorker.CmdPrefix + 'setLogLevel';
    public static readonly CmdSetMasterVolume: string = AlphaSynthWebWorker.CmdPrefix + 'setMasterVolume';
    public static readonly CmdSetMetronomeVolume: string = AlphaSynthWebWorker.CmdPrefix + 'setMetronomeVolume';
    public static readonly CmdSetPlaybackSpeed: string = AlphaSynthWebWorker.CmdPrefix + 'setPlaybackSpeed';
    public static readonly CmdSetTickPosition: string = AlphaSynthWebWorker.CmdPrefix + 'setTickPosition';
    public static readonly CmdSetTimePosition: string = AlphaSynthWebWorker.CmdPrefix + 'setTimePosition';
    public static readonly CmdSetPlaybackRange: string = AlphaSynthWebWorker.CmdPrefix + 'setPlaybackRange';
    public static readonly CmdSetIsLooping: string = AlphaSynthWebWorker.CmdPrefix + 'setIsLooping';
    public static readonly CmdPlay: string = AlphaSynthWebWorker.CmdPrefix + 'play';
    public static readonly CmdPause: string = AlphaSynthWebWorker.CmdPrefix + 'pause';
    public static readonly CmdPlayPause: string = AlphaSynthWebWorker.CmdPrefix + 'playPause';
    public static readonly CmdStop: string = AlphaSynthWebWorker.CmdPrefix + 'stop';
    public static readonly CmdLoadSoundFontBytes: string = AlphaSynthWebWorker.CmdPrefix + 'loadSoundFontBytes';
    public static readonly CmdLoadMidi: string = AlphaSynthWebWorker.CmdPrefix + 'loadMidi';
    public static readonly CmdSetChannelMute: string = AlphaSynthWebWorker.CmdPrefix + 'setChannelMute';
    public static readonly CmdSetChannelSolo: string = AlphaSynthWebWorker.CmdPrefix + 'setChannelSolo';
    public static readonly CmdSetChannelVolume: string = AlphaSynthWebWorker.CmdPrefix + 'setChannelVolume';
    public static readonly CmdSetChannelProgram: string = AlphaSynthWebWorker.CmdPrefix + 'setChannelProgram';
    public static readonly CmdResetChannelStates: string = AlphaSynthWebWorker.CmdPrefix + 'resetChannelStates';
    public static readonly CmdReady: string = AlphaSynthWebWorker.CmdPrefix + 'ready';
    public static readonly CmdReadyForPlayback: string = AlphaSynthWebWorker.CmdPrefix + 'readyForPlayback';
    public static readonly CmdPositionChanged: string = AlphaSynthWebWorker.CmdPrefix + 'positionChanged';
    public static readonly CmdPlayerStateChanged: string = AlphaSynthWebWorker.CmdPrefix + 'playerStateChanged';
    public static readonly CmdFinished: string = AlphaSynthWebWorker.CmdPrefix + 'finished';
    public static readonly CmdSoundFontLoaded: string = AlphaSynthWebWorker.CmdPrefix + 'soundFontLoaded';
    public static readonly CmdSoundFontLoadFailed: string = AlphaSynthWebWorker.CmdPrefix + 'soundFontLoadFailed';
    public static readonly CmdMidiLoaded: string = AlphaSynthWebWorker.CmdPrefix + 'midiLoaded';
    public static readonly CmdMidiLoadFailed: string = AlphaSynthWebWorker.CmdPrefix + 'midiLoadFailed';
    public static readonly CmdLog: string = AlphaSynthWebWorker.CmdPrefix + 'log';

    private _player: AlphaSynth;
    private _main: IWorkerScope;

    public constructor(main: IWorkerScope) {
        this._main = main;
        this._main.addEventListener('message', this.handleMessage.bind(this));

        this._player = new AlphaSynth(new AlphaSynthWorkerSynthOutput());
        this._player.positionChanged.on(this.onPositionChanged.bind(this));
        this._player.stateChanged.on(this.onPlayerStateChanged.bind(this));
        this._player.finished.on(this.onFinished.bind(this));
        this._player.soundFontLoaded.on(this.onSoundFontLoaded.bind(this));
        this._player.soundFontLoadFailed.on(this.onSoundFontLoadFailed.bind(this));
        this._player.soundFontLoadFailed.on(this.onSoundFontLoadFailed.bind(this));
        this._player.midiLoaded.on(this.onMidiLoaded.bind(this));
        this._player.midiLoadFailed.on(this.onMidiLoadFailed.bind(this));
        this._player.readyForPlayback.on(this.onReadyForPlayback.bind(this));
        this._main.postMessage({
            cmd: 'alphaSynth.ready'
        });
    }

    public static init(): void {
        let main: IWorkerScope = Environment.globalThis as IWorkerScope;
        main.addEventListener('message', e => {
            let data: any = e.data;
            let cmd: string = data.cmd;
            switch (cmd) {
                case 'alphaSynth.initialize':
                    AlphaSynthWorkerSynthOutput.preferredSampleRate = data.sampleRate;
                    Logger.logLevel = data.logLevel;
                    Environment.globalThis.alphaSynthWebWorker = new AlphaSynthWebWorker(main);
                    break;
            }
        });
    }

    public handleMessage(e: MessageEvent): void {
        let data: any = e.data;
        let cmd: string = data.cmd;
        switch (cmd) {
            case 'alphaSynth.setLogLevel':
                Logger.logLevel = data.value;
                break;
            case 'alphaSynth.setMasterVolume':
                this._player.masterVolume = data.value;
                break;
            case 'alphaSynth.setMetronomeVolume':
                this._player.metronomeVolume = data.value;
                break;
            case 'alphaSynth.setPlaybackSpeed':
                this._player.playbackSpeed = data.value;
                break;
            case 'alphaSynth.setTickPosition':
                this._player.tickPosition = data.value;
                break;
            case 'alphaSynth.setTimePosition':
                this._player.timePosition = data.value;
                break;
            case 'alphaSynth.setPlaybackRange':
                this._player.playbackRange = data.value;
                break;
            case 'alphaSynth.setIsLooping':
                this._player.isLooping = data.value;
                break;
            case 'alphaSynth.play':
                this._player.play();
                break;
            case 'alphaSynth.pause':
                this._player.pause();
                break;
            case 'alphaSynth.playPause':
                this._player.playPause();
                break;
            case 'alphaSynth.stop':
                this._player.stop();
                break;
            case 'alphaSynth.loadSoundFontBytes':
                this._player.loadSoundFont(data.data);
                break;
            case 'alphaSynth.loadMidi':
                this._player.loadMidiFile(JsonConverter.jsObjectToMidiFile(data.midi));
                break;
            case 'alphaSynth.setChannelMute':
                this._player.setChannelMute(data.channel, data.mute);
                break;
            case 'alphaSynth.setChannelSolo':
                this._player.setChannelSolo(data.channel, data.solo);
                break;
            case 'alphaSynth.setChannelVolume':
                this._player.setChannelVolume(data.channel, data.volume);
                break;
            case 'alphaSynth.setChannelProgram':
                this._player.setChannelProgram(data.channel, data.program);
                break;
            case 'alphaSynth.resetChannelStates':
                this._player.resetChannelStates();
                break;
        }
    }

    public onPositionChanged(e: PositionChangedEventArgs): void {
        this._main.postMessage({
            cmd: 'alphaSynth.positionChanged',
            currentTime: e.currentTime,
            endTime: e.endTime,
            currentTick: e.currentTick,
            endTick: e.endTick
        });
    }

    public onPlayerStateChanged(e: PlayerStateChangedEventArgs): void {
        this._main.postMessage({
            cmd: 'alphaSynth.playerStateChanged',
            state: e.state,
            stopped: e.stopped
        });
    }

    public onFinished(): void {
        this._main.postMessage({
            cmd: 'alphaSynth.finished'
        });
    }

    public onSoundFontLoaded(): void {
        this._main.postMessage({
            cmd: 'alphaSynth.soundFontLoaded'
        });
    }

    public onSoundFontLoadFailed(e: any): void {
        this._main.postMessage({
            cmd: 'alphaSynth.soundFontLoadFailed',
            error: this.serializeException(e)
        });
    }

    private serializeException(e: any): unknown {
        let error: any = JSON.parse(JSON.stringify(e));
        if (e.message) {
            error.message = e.message;
        }
        if (e.stack) {
            error.stack = e.stack;
        }
        if (e.constructor && e.constructor.name) {
            error.type = e.constructor.name;
        }
        return error;
    }

    public onMidiLoaded(): void {
        this._main.postMessage({
            cmd: 'alphaSynth.midiLoaded'
        });
    }

    public onMidiLoadFailed(e: any): void {
        this._main.postMessage({
            cmd: 'alphaSynth.midiLoaded',
            error: this.serializeException(e)
        });
    }

    public onReadyForPlayback(): void {
        this._main.postMessage({
            cmd: 'alphaSynth.readyForPlayback'
        });
    }
}
