import type { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';

/**
 * Represents a output device on which the synth can send the audio to.
 */
export interface ISynthOutputDevice {
    /**
     * The ID to uniquely identify the device.
     */
    readonly deviceId: string;

    /**
     * A string describing the device.
     */
    readonly label: string;

    /**
     * Gets a value indicating whether the device is the default output device.
     */
    readonly isDefault: boolean;
}

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
    open(bufferTimeInMilliseconds: number): void;

    /**
     * Called when the output should start the playback.
     */
    play(): void;

    /**
     * Requests the output to destroy itself.
     */
    destroy(): void;

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

    /**
     * Loads and lists the available output devices. Will request permissions if needed.
     * @async
     */
    enumerateOutputDevices(): Promise<ISynthOutputDevice[]>;

    /**
     * Changes the output device which should be used for playing the audio.
     * @async
     * @param device The output device to use, or null to switch to the default device.
     */
    setOutputDevice(device: ISynthOutputDevice | null): Promise<void>;

    /**
     * The currently configured output device if changed via {@link setOutputDevice}.
     * @async
     * @returns The custom configured output device which was set via {@link setOutputDevice} or `null`
     * if the default outputDevice is used.
     * The output device might change dynamically if devices are connected/disconnected (e.g. bluetooth headset).
     */
    getOutputDevice(): Promise<ISynthOutputDevice | null>;
}
