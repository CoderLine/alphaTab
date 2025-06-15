import { EventEmitter, EventEmitterOfT, type IEventEmitter, type IEventEmitterOfT } from '@src/EventEmitter';
import { Logger } from '@src/Logger';
import type { BackingTrack } from '@src/model/BackingTrack';
import { WebAudioHelper } from '@src/platform/javascript/AlphaSynthWebAudioOutputBase';
import type { IBackingTrackSynthOutput } from '@src/synth/BackingTrackPlayer';
import type { ISynthOutputDevice } from '@src/synth/ISynthOutput';

/**
 * A {@link IBackingTrackSynthOutput} which uses a HTMLAudioElement as playback mechanism.
 * Allows the access to the element for further custom usage.
 * @target web
 */
export interface IAudioElementBackingTrackSynthOutput extends IBackingTrackSynthOutput {
    /**
     * The audio element used for playing the backing track.
     * @remarks
     * Direct interaction with the element might not result in correct alphaTab behavior.
     */
    readonly audioElement: HTMLAudioElement;
}

/**
 * @target web
 */
export class AudioElementBackingTrackSynthOutput implements IAudioElementBackingTrackSynthOutput {
    // fake rate
    public readonly sampleRate: number = 44100;

    public audioElement!: HTMLAudioElement;
    private _updateInterval: number = 0;

    public get backingTrackDuration(): number {
        const duration = this.audioElement.duration ?? 0;
        return Number.isFinite(duration) ? duration * 1000 : 0;
    }

    public get playbackRate(): number {
        return this.audioElement.playbackRate;
    }

    public set playbackRate(value: number) {
        this.audioElement.playbackRate = value;
    }

    public get masterVolume(): number {
        return this.audioElement.volume;
    }

    public set masterVolume(value: number) {
        this.audioElement.volume = value;
    }

    public seekTo(time: number): void {
        this.audioElement.currentTime = time / 1000;
    }

    public loadBackingTrack(backingTrack: BackingTrack) {
        if (this.audioElement?.src) {
            URL.revokeObjectURL(this.audioElement.src);
        }

        const blob = new Blob([backingTrack.rawAudioFile!]);
        // https://html.spec.whatwg.org/multipage/media.html#loading-the-media-resource
        // Step 8. resets the playbackRate, we need to remember and restore it. 
        const playbackRate = this.audioElement.playbackRate;
        this.audioElement.src = URL.createObjectURL(blob);
        this.audioElement.playbackRate = playbackRate;
    }

    public open(_bufferTimeInMilliseconds: number): void {
        const audioElement = document.createElement('audio');
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);
        audioElement.addEventListener('seeked', () => {
            this.updatePosition();
        });
        audioElement.addEventListener('timeupdate', () => {
            this.updatePosition();
        });
        this.audioElement = audioElement;
        (this.ready as EventEmitter).trigger();
    }

    private updatePosition() {
        const timePos = this.audioElement.currentTime * 1000;
        (this.timeUpdate as EventEmitterOfT<number>).trigger(timePos);
    }

    public play(): void {
        this.audioElement.play();
        this._updateInterval = window.setInterval(() => {
            this.updatePosition();
        }, 50);
    }
    public destroy(): void {
        const audioElement = this.audioElement;
        if (audioElement) {
            document.body.removeChild(audioElement);
        }
    }

    public pause(): void {
        this.audioElement.pause();
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
            await this.audioElement.setSinkId('');
        } else {
            await this.audioElement.setSinkId(device.deviceId);
        }
    }

    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        if (!(await WebAudioHelper.checkSinkIdSupport())) {
            return null;
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/sinkId
        const sinkId = this.audioElement.sinkId;

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
