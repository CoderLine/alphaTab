import { AlphaSynth, type IAlphaSynthAudioExporter } from '@src/synth/AlphaSynth';
import type { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import type { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { JsonConverter } from '@src/model/JsonConverter';
import { AlphaSynthWorkerSynthOutput } from '@src/platform/javascript/AlphaSynthWorkerSynthOutput';
import type { IWorkerScope } from '@src/platform/javascript/IWorkerScope';
import { Logger } from '@src/Logger';
import { Environment } from '@src/Environment';
import type { MidiEventsPlayedEventArgs } from '@src/synth/MidiEventsPlayedEventArgs';
import type { PlaybackRangeChangedEventArgs } from '@src/synth/PlaybackRangeChangedEventArgs';

/**
 * This class implements a HTML5 WebWorker based version of alphaSynth
 * which can be controlled via WebWorker messages.
 * @target web
 */
export class AlphaSynthWebWorker {
    private _player: AlphaSynth;
    private _main: IWorkerScope;
    private _exporter: Map<number, IAlphaSynthAudioExporter> = new Map<number, IAlphaSynthAudioExporter>();

    public constructor(main: IWorkerScope, bufferTimeInMilliseconds: number) {
        this._main = main;
        this._main.addEventListener('message', this.handleMessage.bind(this));

        this._player = new AlphaSynth(new AlphaSynthWorkerSynthOutput(), bufferTimeInMilliseconds);
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
        this._player.playbackRangeChanged.on(this.onPlaybackRangeChanged.bind(this));
        this._main.postMessage({
            cmd: 'alphaSynth.ready'
        });
    }

    public static init(): void {
        const main: IWorkerScope = Environment.globalThis as IWorkerScope;
        main.addEventListener('message', e => {
            const data: any = e.data;
            const cmd: string = data.cmd;
            switch (cmd) {
                case 'alphaSynth.initialize':
                    AlphaSynthWorkerSynthOutput.preferredSampleRate = data.sampleRate;
                    Logger.logLevel = data.logLevel;
                    Environment.globalThis.alphaSynthWebWorker = new AlphaSynthWebWorker(
                        main,
                        data.bufferTimeInMilliseconds
                    );
                    break;
            }
        });
    }

    public handleMessage(e: MessageEvent): void {
        const data: any = e.data;
        const cmd: string = data.cmd;
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
            case 'alphaSynth.setChannelTranspositionPitch':
                this._player.setChannelTranspositionPitch(data.channel, data.semitones);
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
            case 'alphaSynth.destroy':
                this._player.destroy();
                this._main.postMessage({
                    cmd: 'alphaSynth.destroyed'
                });
                break;
            case 'alphaSynth.applyTranspositionPitches':
                this._player.applyTranspositionPitches(new Map<number, number>(JSON.parse(data.transpositionPitches)));
                break;
        }

        if (cmd.startsWith('alphaSynth.exporter')) {
            this.handleExporterMessage(e);
        }
    }
    private handleExporterMessage(e: MessageEvent) {
        const data: any = e.data;
        const cmd: string = data.cmd;
        try {
            switch (cmd) {
                case 'alphaSynth.exporter.initialize':
                    const exporter = this._player.exportAudio(
                        data.options,
                        JsonConverter.jsObjectToMidiFile(data.midi),
                        data.syncPoints,
                        data.transpositionPitches
                    );
                    this._exporter.set(data.exporterId, exporter);

                    this._main.postMessage({
                        cmd: 'alphaSynth.exporter.initialized',
                        exporterId: data.exporterId
                    });
                    break;

                case 'alphaSynth.exporter.render':
                    if (this._exporter.has(data.exporterId)) {
                        const exporter = this._exporter.get(data.exporterId)!;
                        const chunk = exporter.render(data.milliseconds);
                        this._main.postMessage({
                            cmd: 'alphaSynth.exporter.rendered',
                            exporterId: data.exporterId,
                            chunk
                        });
                    } else {
                        this._main.postMessage({
                            cmd: 'alphaSynth.exporter.error',
                            exporterId: data.exporterId,
                            error: new Error('Unknown exporter ID')
                        });
                    }
                    break;

                case 'alphaSynth.exporter.destroy':
                    this._exporter.delete(data.exporterId);
                    break;
            }
        } catch (e) {
            this._main.postMessage({
                cmd: 'alphaSynth.exporter.error',
                exporterId: data.exporterId,
                error: e
            });
        }
    }

    public onPositionChanged(e: PositionChangedEventArgs): void {
        this._main.postMessage({
            cmd: 'alphaSynth.positionChanged',
            currentTime: e.currentTime,
            endTime: e.endTime,
            currentTick: e.currentTick,
            endTick: e.endTick,
            isSeek: e.isSeek,
            originalTempo: e.originalTempo,
            modifiedTempo: e.modifiedTempo
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
            error: this.serializeException(Environment.prepareForPostMessage(e))
        });
    }

    private serializeException(e: any): unknown {
        const error: any = JSON.parse(JSON.stringify(e));
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
            isSeek: e.isSeek,
            originalTempo: e.originalTempo,
            modifiedTempo: e.modifiedTempo
        });
    }

    public onMidiLoadFailed(e: any): void {
        this._main.postMessage({
            cmd: 'alphaSynth.midiLoaded',
            error: this.serializeException(Environment.prepareForPostMessage(e))
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

    public onPlaybackRangeChanged(args: PlaybackRangeChangedEventArgs): void {
        this._main.postMessage({
            cmd: 'alphaSynth.playbackRangeChanged',
            playbackRange: args.playbackRange
        });
    }
}
