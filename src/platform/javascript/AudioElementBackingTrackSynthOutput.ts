import { EventEmitter, EventEmitterOfT, type IEventEmitter, type IEventEmitterOfT } from '@src/EventEmitter';
import { Logger } from '@src/Logger';
import type { BackingTrack } from '@src/model/BackingTrack';
import { WebAudioHelper } from '@src/platform/javascript/AlphaSynthWebAudioOutputBase';
import type { IBackingTrackSynthOutput } from '@src/synth/BackingTrackPlayer';
import type { ISynthOutputDevice } from '@src/synth/ISynthOutput';

export class AudioElementBackingTrackSynthOutput implements IBackingTrackSynthOutput {
    // fake rate
    public readonly sampleRate: number = 44100;

    private _audioElement?: HTMLAudioElement;
    private _padding: number = 0;
    private _updateInterval: number = 0;

    public get backingTrackDuration(): number {
        const duration = this._audioElement?.duration ?? 0;
        return Number.isFinite(duration) ? duration * 1000 : 0;
    }

    public get playbackRate(): number {
        return this._audioElement!.playbackRate;
    }

    public set playbackRate(value: number) {
        this._audioElement!.playbackRate = value;
    }

    public seekTo(time: number): void {
        this._audioElement!.currentTime = (time / 1000) - this._padding;
    }

    public loadBackingTrack(backingTrack: BackingTrack) {
        if (this._audioElement?.src) {
            URL.revokeObjectURL(this._audioElement!.src);
        }

        this._padding = backingTrack.padding / 1000;

        const blob = new Blob([backingTrack.rawAudioFile!]);
        this._audioElement!.src = URL.createObjectURL(blob);
    }

    public open(_bufferTimeInMilliseconds: number): void {
        const audioElement = document.createElement('audio');
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);
        audioElement.addEventListener('timeupdate', () => {
            this.updatePosition();
        });
        this._audioElement = audioElement;
        (this.ready as EventEmitter).trigger();
    }

    private updatePosition() {
        const timePos = (this._audioElement!.currentTime + this._padding) * 1000;
        (this.timeUpdate as EventEmitterOfT<number>).trigger(timePos);
    }

    public play(): void {
        this._audioElement!.play();
        this._updateInterval = window.setInterval(() => {
            this.updatePosition();
        }, 50);
    }
    public destroy(): void {
        const audioElement = this._audioElement;
        if (audioElement) {
            document.body.removeChild(audioElement);
        }
    }

    public pause(): void {
        this._audioElement!.pause();
        window.clearInterval(this._updateInterval);
    }

    public addSamples(_samples: Float32Array): void {
        // nobody will call this
    }
    public resetSamples(): void {
        // nobody will call this
    }
    public activate(): void {
        // nobody will call this
    }

    public readonly ready: IEventEmitter = new EventEmitter();
    public readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly timeUpdate: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly sampleRequest: IEventEmitter = new EventEmitter();

    public async enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        return WebAudioHelper.enumerateOutputDevices();
    }
    public async setOutputDevice(device: ISynthOutputDevice | null): Promise<void> {
        if (!(await WebAudioHelper.checkSinkIdSupport())) {
            return;
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/setSinkId
        if (!device) {
            await this._audioElement!.setSinkId('');
        } else {
            await this._audioElement!.setSinkId(device.deviceId);
        }
    }

    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        if (!(await WebAudioHelper.checkSinkIdSupport())) {
            return null;
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/sinkId
        const sinkId = this._audioElement!.sinkId;

        if (typeof sinkId !== 'string' || sinkId === '' || sinkId === 'default') {
            return null;
        }

        // fast path -> cached devices list
        let device = WebAudioHelper.findKnownDevice(sinkId);
        if (device) {
            return device;
        }

        // slow path -> enumerate devices
        const allDevices = await this.enumerateOutputDevices();
        device = allDevices.find(d => d.deviceId === sinkId);
        if (device) {
            return device;
        }

        Logger.warning('WebAudio', 'Could not find output device in device list', sinkId, allDevices);
        return null;
    }
}
