import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { Environment } from '@src/Environment';
import { EventEmitter, EventEmitterOfT, type IEventEmitter, type IEventEmitterOfT } from '@src/EventEmitter';
import { Logger } from '@src/Logger';
import type { ISynthOutput, ISynthOutputDevice } from '@src/synth/ISynthOutput';

declare const webkitAudioContext: any;

/**
 * @target web
 */
export class AlphaSynthWebAudioSynthOutputDevice implements ISynthOutputDevice {
    public device: MediaDeviceInfo;

    public constructor(device: MediaDeviceInfo) {
        this.device = device;
    }
    public get deviceId(): string {
        return this.device.deviceId;
    }
    public get label(): string {
        return this.device.label;
    }
    public isDefault: boolean = false;
}

/**
 * Some shared web audio stuff.
 * @target web
 */
export class WebAudioHelper {
    private static _knownDevices: ISynthOutputDevice[] = [];

    public static findKnownDevice(sinkId: string) {
        return WebAudioHelper._knownDevices.find(d => d.deviceId === sinkId);
    }

    public static createAudioContext(): AudioContext {
        if ('AudioContext' in Environment.globalThis) {
            return new AudioContext();
        }
        if ('webkitAudioContext' in Environment.globalThis) {
            return new webkitAudioContext();
        }
        throw new AlphaTabError(AlphaTabErrorType.General, 'AudioContext not found');
    }

    public static async checkSinkIdSupport() {
        // https://caniuse.com/mdn-api_audiocontext_sinkid
        const context = WebAudioHelper.createAudioContext();
        if (!('setSinkId' in context)) {
            Logger.warning('WebAudio', 'Browser does not support changing the output device');
            return false;
        }
        return true;
    }

    public static async enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        try {
            if (!(await WebAudioHelper.checkSinkIdSupport())) {
                return [];
            }

            // Request permissions
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (e) {
                // sometimes we get an error but can still enumerate, e.g. if microphone access is denied,
                // we can still load the output devices in some cases.
                Logger.warning('WebAudio', 'Output device permission rejected', e);
            }

            // load devices
            const devices = await navigator.mediaDevices.enumerateDevices();

            // default device candidates
            let defaultDeviceGroupId = '';
            let defaultDeviceId = '';

            const realDevices = new Map<string, AlphaSynthWebAudioSynthOutputDevice>();
            for (const device of devices) {
                if (device.kind === 'audiooutput') {
                    realDevices.set(device.groupId, new AlphaSynthWebAudioSynthOutputDevice(device));

                    // chromium has the default device as deviceID: 'default'
                    // the standard defines empty-string as default
                    if (device.deviceId === 'default' || device.deviceId === '') {
                        defaultDeviceGroupId = device.groupId;
                        defaultDeviceId = device.deviceId;
                    }
                }
            }

            const final = Array.from(realDevices.values());

            // flag default device
            let defaultDevice = final.find(d => d.deviceId === defaultDeviceId);
            if (!defaultDevice) {
                defaultDevice = final.find(d => d.device.groupId === defaultDeviceGroupId);
            }
            if (!defaultDevice && final.length > 0) {
                defaultDevice = final[0];
            }

            if (defaultDevice) {
                defaultDevice.isDefault = true;
            }

            WebAudioHelper._knownDevices = final;

            return final;
        } catch (e) {
            Logger.error('WebAudio', 'Failed to enumerate output devices', e);
            return [];
        }
    }
}

/**
 * @target web
 */
export abstract class AlphaSynthWebAudioOutputBase implements ISynthOutput {
    protected static readonly BufferSize: number = 4096;
    protected static readonly PreferredSampleRate: number = 44100;

    protected _context: AudioContext | null = null;
    protected _buffer: AudioBuffer | null = null;
    protected _source: AudioBufferSourceNode | null = null;

    private _resumeHandler?: () => void;

    public get sampleRate(): number {
        return this._context ? this._context.sampleRate : AlphaSynthWebAudioOutputBase.PreferredSampleRate;
    }

    public activate(resumedCallback?: () => void): void {
        if (!this._context) {
            this._context = WebAudioHelper.createAudioContext();
        }

        if (this._context.state === 'suspended' || (this._context.state as string) === 'interrupted') {
            Logger.debug('WebAudio', 'Audio Context is suspended, trying resume');
            this._context.resume().then(
                () => {
                    Logger.debug(
                        'WebAudio',
                        `Audio Context resume success: state=${this._context?.state}, sampleRate:${this._context?.sampleRate}`
                    );
                    if (resumedCallback) {
                        resumedCallback();
                    }
                },
                reason => {
                    Logger.warning(
                        'WebAudio',
                        `Audio Context resume failed: state=${this._context?.state}, sampleRate:${this._context?.sampleRate}, reason=${reason}`
                    );
                }
            );
        }
    }

    private patchIosSampleRate(): void {
        const ua: string = navigator.userAgent;
        if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) {
            const context: AudioContext = WebAudioHelper.createAudioContext();
            const buffer: AudioBuffer = context.createBuffer(1, 1, AlphaSynthWebAudioOutputBase.PreferredSampleRate);
            const dummy: AudioBufferSourceNode = context.createBufferSource();
            dummy.buffer = buffer;
            dummy.connect(context.destination);
            dummy.start(0);
            dummy.disconnect(0);
            // tslint:disable-next-line: no-floating-promises
            context.close();
        }
    }

    public open(bufferTimeInMilliseconds: number): void {
        this.patchIosSampleRate();
        this._context = WebAudioHelper.createAudioContext();
        const ctx: any = this._context;
        if (ctx.state === 'suspended') {
            this.registerResumeHandler();
        }
    }

    private registerResumeHandler() {
        this._resumeHandler = (() => {
            this.activate(() => {
                this.unregisterResumeHandler();
            });
        }).bind(this);
        document.body.addEventListener('touchend', this._resumeHandler, false);
        document.body.addEventListener('click', this._resumeHandler, false);
    }

    private unregisterResumeHandler() {
        const resumeHandler = this._resumeHandler;
        if (resumeHandler) {
            document.body.removeEventListener('touchend', resumeHandler, false);
            document.body.removeEventListener('click', resumeHandler, false);
        }
    }

    public play(): void {
        const ctx = this._context!;
        this.activate();
        // create an empty buffer source (silence)
        this._buffer = ctx.createBuffer(2, AlphaSynthWebAudioOutputBase.BufferSize, ctx.sampleRate);
        this._source = ctx.createBufferSource();
        this._source.buffer = this._buffer;
        this._source.loop = true;
    }

    public pause(): void {
        if (this._source) {
            this._source.stop(0);
            this._source.disconnect();
        }
        this._source = null;
    }

    public destroy(): void {
        this.pause();
        this._context?.close();
        this._context = null;
        this.unregisterResumeHandler();
    }

    public abstract addSamples(f: Float32Array): void;
    public abstract resetSamples(): void;

    public readonly ready: IEventEmitter = new EventEmitter();
    public readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly sampleRequest: IEventEmitter = new EventEmitter();

    protected onSamplesPlayed(numberOfSamples: number) {
        (this.samplesPlayed as EventEmitterOfT<number>).trigger(numberOfSamples);
    }

    protected onSampleRequest() {
        (this.sampleRequest as EventEmitter).trigger();
    }

    protected onReady() {
        (this.ready as EventEmitter).trigger();
    }

    public enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        return WebAudioHelper.enumerateOutputDevices();
    }

    public async setOutputDevice(device: ISynthOutputDevice | null): Promise<void> {
        if (!(await WebAudioHelper.checkSinkIdSupport())) {
            return;
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/setSinkId
        if (!device) {
            await (this._context as any).setSinkId('');
        } else {
            await (this._context as any).setSinkId(device.deviceId);
        }
    }

    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        if (!(await WebAudioHelper.checkSinkIdSupport())) {
            return null;
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/sinkId
        const sinkId = (this._context as any).sinkId;

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
