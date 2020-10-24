import { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';

/**
 * This is the base interface for output devices which can
 * request and playback audio samples.
 * @csharp_public
 */
export interface ISynthOutput {
    /**
     * Gets the sample rate required by the output.
     */
    readonly sampleRate: number;

    /**
     * Called when the output should be opened.
     */
    open(): void;

    /**
     * Called when the output should start the playback.
     */
    play(): void;

    /**
     * Called when the output should stop the playback.
     */
    pause(): void;

    /**
     * Called when samples have been synthesized and should be added to the playback buffer.
     * @param samples
     */
    addSamples(samples: Float32Array): void;

    /**
     * Called when the samples in the output buffer should be reset. This is neeed for instance when seeking to another position.
     */
    resetSamples(): void;

    /**
     * Activates the output component.
     */
    activate(): void;

    /**
     * Fired when the output has been successfully opened and is ready to play samples.
     */
    readonly ready: IEventEmitter;

    /**
     * Fired when a certain number of samples have been played.
     */
    readonly samplesPlayed: IEventEmitterOfT<number>;

    /**
     * Fired when the output needs more samples to be played.
     */
    readonly sampleRequest: IEventEmitter;
}
