import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { Environment } from '@src/Environment';
import { EventEmitter, EventEmitterOfT, IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import { Logger } from '@src/Logger';
import { ISynthOutput } from '@src/synth/ISynthOutput';

declare var webkitAudioContext: any;

/**
 * @target web
 */
export abstract class AlphaSynthWebAudioOutputBase implements ISynthOutput {
    protected static readonly BufferSize: number = 4096;
    protected static readonly PreferredSampleRate: number = 44100;

    protected _context: AudioContext | null = null;
    protected _buffer: AudioBuffer | null = null;
    protected _source: AudioBufferSourceNode | null = null;

    public get sampleRate(): number {
        return this._context ? this._context.sampleRate : AlphaSynthWebAudioOutputBase.PreferredSampleRate;
    }

    private patchIosSampleRate(): void {
        let ua: string = navigator.userAgent;
        if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) {
            let context: AudioContext = this.createAudioContext();
            let buffer: AudioBuffer = context.createBuffer(1, 1, AlphaSynthWebAudioOutputBase.PreferredSampleRate);
            let dummy: AudioBufferSourceNode = context.createBufferSource();
            dummy.buffer = buffer;
            dummy.connect(context.destination);
            dummy.start(0);
            dummy.disconnect(0);
            // tslint:disable-next-line: no-floating-promises
            context.close();
        }
    }

    private createAudioContext(): AudioContext {
        let audioContext: AudioContext | null = null;
        if ('AudioContext' in Environment.globalThis) {
            audioContext = new AudioContext();
        } else if ('webkitAudioContext' in Environment.globalThis) {
            audioContext = new webkitAudioContext();
        }

        if (!audioContext) {
            throw new AlphaTabError(AlphaTabErrorType.General, 'AudioContext not found');
        }

        return audioContext;
    }

    public open(bufferTimeInMilliseconds: number): void {
        this.patchIosSampleRate();
        this._context = this.createAudioContext();
        this.setupAudioContextUnlocking();
    }

    public play(): void {
        let ctx = this._context!;
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
        this.removeUserInputListeners();
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

    // Credit for handling the unlocking/resume operations properly (especially on Buggy WebKit/iOS versions)
    // goes to https://github.com/playcanvas/engine Copyright (c) 2011-2022 PlayCanvas Ltd. (MIT)

    private static readonly UserInputEvents: string[] = [
        'click',
        'contextmenu',
        'auxclick',
        'dblclick',
        'mousedown',
        'mouseup',
        'pointerup',
        'touchend',
        'keydown',
        'keyup'
    ];
    private _unlocking: boolean = false;
    private _unlocked: boolean = false;

    private _resumeContextCallback?: () => void;

    private setupAudioContextUnlocking() {
        const audioContext = this._context;
        if (!audioContext) {
            return;
        }

        this._unlocked = audioContext.state === 'running';
        if (!this._unlocked) {
            this.addContextUnlockListeners();
        }

        audioContext.onstatechange = () => {
            if (this._unlocked && audioContext!.state !== 'running') {
                audioContext!
                    .resume()
                    .then(
                        () => {
                            Logger.debug('WebAudio', 'Resumed the AudioContext after suspension');
                        },
                        e => {
                            Logger.error(
                                'WebAudio',
                                `Attempted to resume the AudioContext on onstatechange, but it was rejected`,
                                e
                            );
                        }
                    )
                    .catch(e => {
                        Logger.error(
                            'WebAudio',
                            `Attempted to resume the AudioContext on onstatechange, but threw an exception`,
                            e
                        );
                    });
            }
        };
    }

    private addContextUnlockListeners() {
        this._unlocking = false;

        if (!this._resumeContextCallback) {
            this._resumeContextCallback = () => {
                const context = this._context;
                if (!context || this._unlocked || this._unlocking) {
                    return;
                }
                this._unlocking = true;

                if ((context.state as string) === 'interrupted') {
                    context
                        .resume()
                        .then(
                            () => {
                                Logger.debug('WebAudio', 'The AudioContext was resumed');
                            },
                            e => {
                                Logger.debug(
                                    'WebAudio',
                                    `Attempted to resume the AudioContext on SoundManager.resume(), but it was rejected`,
                                    e
                                );
                            }
                        )
                        .catch(e => {
                            Logger.debug(
                                'WebAudio',
                                `Attempted to resume the AudioContext on SoundManager.resume(), but threw an exception`,
                                e
                            );
                        });
                }

                const buffer = context.createBuffer(1, 1, context.sampleRate);
                const source = context.createBufferSource();
                source.buffer = buffer;
                source.connect(context.destination);
                source.start(0);

                source.onended = () => {
                    source.disconnect(0);
                    this._unlocked = true;
                    this._unlocking = false;
                    this.removeUserInputListeners();
                };
            };
        }

        // attach to all user input events
        AlphaSynthWebAudioOutputBase.UserInputEvents.forEach(eventName => {
            window.addEventListener(eventName, this._resumeContextCallback!, false);
        });
    }

    private removeUserInputListeners() {
        if (!this._resumeContextCallback) {
            return;
        }

        AlphaSynthWebAudioOutputBase.UserInputEvents.forEach(eventName => {
            window.removeEventListener(eventName, this._resumeContextCallback!, false);
        });
        this._resumeContextCallback = undefined;
    }
}
