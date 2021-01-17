import { AlphaSynth } from '@src/synth/AlphaSynth';
import { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { JsonConverter } from '@src/model/JsonConverter';
import { AlphaSynthWorkerSynthOutput } from '@src/platform/javascript/AlphaSynthWorkerSynthOutput';
import { IWorkerScope } from '@src/platform/javascript/IWorkerScope';
import { Logger } from '@src/Logger';
import { Environment } from '@src/Environment';
import { MidiEventsPlayedEventArgs } from '@src/synth/MidiEventsPlayedEventArgs';

/**
 * This class implements a HTML5 WebWorker based version of alphaSynth
 * which can be controlled via WebWorker messages.
 * @target web
 */
export class AlphaSynthWebWorker {
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
        this._player.midiEventsPlayed.on(this.onMidiEventsPlayed.bind(this));
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
            case 'alphaSynth.setCountInVolume':
                this._player.countInVolume = data.value;
                break;           
            case 'alphaSynth.setMidiEventsPlayedFilter':
                this._player.midiEventsPlayedFilter = data.value;
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
            case 'alphaSynth.playOneTimeMidiFile':
                this._player.playOneTimeMidiFile(JsonConverter.jsObjectToMidiFile(data.midi));
                break;
            case 'alphaSynth.loadSoundFontBytes':
                this._player.loadSoundFont(data.data, data.append);
                break;
            case 'alphaSynth.resetSoundFonts':
                this._player.resetSoundFonts();
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
            endTick: e.endTick,
            isSeek: e.isSeek
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

    public onMidiLoaded(e: PositionChangedEventArgs): void {
        this._main.postMessage({
            cmd: 'alphaSynth.midiLoaded',
            currentTime: e.currentTime,
            endTime: e.endTime,
            currentTick: e.currentTick,
            endTick: e.endTick,
            isSeek: e.isSeek
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

    public onMidiEventsPlayed(args: MidiEventsPlayedEventArgs): void {
        this._main.postMessage({
            cmd: 'alphaSynth.midiEventsPlayed',
            events: args.events.map(JsonConverter.midiEventToJsObject)
        });
    }
}
