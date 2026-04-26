import { Environment } from '@coderline/alphatab/Environment';
import { Logger } from '@coderline/alphatab/Logger';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { AlphaSynthWorkerSynthOutput } from '@coderline/alphatab/platform/worker/AlphaSynthWorkerSynthOutput';
import type {
    IAlphaSynthWorkerMessage,
    IAlphaTabWorkerGlobalScope
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { AlphaSynth, type IAlphaSynthAudioExporter } from '@coderline/alphatab/synth/AlphaSynth';
import type { MidiEventsPlayedEventArgs } from '@coderline/alphatab/synth/MidiEventsPlayedEventArgs';
import type { PlaybackRangeChangedEventArgs } from '@coderline/alphatab/synth/PlaybackRangeChangedEventArgs';
import type { PlayerStateChangedEventArgs } from '@coderline/alphatab/synth/PlayerStateChangedEventArgs';
import type { PositionChangedEventArgs } from '@coderline/alphatab/synth/PositionChangedEventArgs';

/**
 * This class implements a HTML5 WebWorker based version of alphaSynth
 * which can be controlled via WebWorker messages.
 * @internal
 * @partial
 */
export class AlphaSynthWebWorker {
    private _player!: AlphaSynth;
    private _main: IAlphaTabWorkerGlobalScope<IAlphaSynthWorkerMessage>;
    private _exporter: Map<number, IAlphaSynthAudioExporter> = new Map<number, IAlphaSynthAudioExporter>();

    public constructor(main: IAlphaTabWorkerGlobalScope<IAlphaSynthWorkerMessage>) {
        this._main = main;
        main.addEventListener('message', e => this.handleMessage(e));
    }

    public static init(): void {
        new AlphaSynthWebWorker(Environment.getGlobalWorkerScope<IAlphaSynthWorkerMessage>());
    }

    public handleMessage(e: MessageEvent<IAlphaSynthWorkerMessage>): void {
        const data = e.data;
        switch (data.cmd) {
            case 'alphaSynth.initialize':
                AlphaSynthWorkerSynthOutput.preferredSampleRate = data.sampleRate;
                Logger.logLevel = data.logLevel;
                this._player = new AlphaSynth(
                    new AlphaSynthWorkerSynthOutput(this._main),
                    data.bufferTimeInMilliseconds
                );
                this._player.positionChanged.on(e => this.onPositionChanged(e));
                this._player.stateChanged.on(e => this.onPlayerStateChanged(e));
                this._player.finished.on(() => this.onFinished());
                this._player.soundFontLoaded.on(() => this.onSoundFontLoaded());
                this._player.soundFontLoadFailed.on(e => this.onSoundFontLoadFailed(e));
                this._player.midiLoaded.on(e => this.onMidiLoaded(e));
                this._player.midiLoadFailed.on(e => this.onMidiLoadFailed(e));
                this._player.readyForPlayback.on(() => this.onReadyForPlayback());
                this._player.midiEventsPlayed.on(e => this.onMidiEventsPlayed(e));
                this._player.playbackRangeChanged.on(e => this.onPlaybackRangeChanged(e));
                this._main.postMessage({
                    cmd: 'alphaSynth.ready'
                });

                break;
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
                this._player.applyTranspositionPitches(data.transpositionPitches);
                break;
        }

        if (data.cmd.startsWith('alphaSynth.exporter')) {
            this._handleExporterMessage(e);
        }
    }
    private _handleExporterMessage(ev: MessageEvent<IAlphaSynthWorkerMessage>) {
        const data = ev.data;
        const cmd = data.cmd;
        let exporter:IAlphaSynthAudioExporter|undefined = undefined;
        let exporterId = 0;
        try {
            switch (cmd) {
                case 'alphaSynth.exporter.initialize':
                    exporterId = data.exporterId;
                    exporter = this._player.exportAudio(
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
                    exporterId = data.exporterId;
                    if (this._exporter.has(data.exporterId)) {
                        exporter = this._exporter.get(data.exporterId)!;
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
                    exporterId = data.exporterId;
                    this._exporter.delete(data.exporterId);
                    break;
            }
        } catch (e) {
            this._main.postMessage({
                cmd: 'alphaSynth.exporter.error',
                exporterId: exporterId,
                error: e as Error
            });
        }
    }

    public onPositionChanged(e: PositionChangedEventArgs): void {
        this._main.postMessage({
            cmd: 'alphaSynth.positionChanged',
            args: e
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
            error: e
        });
    }

    public onMidiLoaded(e: PositionChangedEventArgs): void {
        this._main.postMessage({
            cmd: 'alphaSynth.midiLoaded',
            args: e
        });
    }

    public onMidiLoadFailed(e: any): void {
        this._main.postMessage({
            cmd: 'alphaSynth.midiLoadFailed',
            error: e
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
