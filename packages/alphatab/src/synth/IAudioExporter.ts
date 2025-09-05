import type { MidiFile } from '@src/midi/MidiFile';
import type { BackingTrackSyncPoint } from '@src/synth/IAlphaSynth';
import type { PlaybackRange } from '@src/synth/PlaybackRange';

/**
 * The options controlling how to export the audio.
 */
export class AudioExportOptions {
    /**
     * The soundfonts to load and use for generating the audio.
     * If not provided, the already loaded soundfonts of the synthesizer will be used.
     * If no existing synthesizer is initialized, the generated audio might not contain any hearable audio.
     */
    public soundFonts?: Uint8Array[];

    /**
     * The output sample rate.
     * @default `44100`
     */
    public sampleRate: number = 44100;

    /**
     * Whether to respect sync point information during export.
     * @default `true`
     * @remarks
     * If the song contains sync point information for synchronization with an external media,
     * this option allows controlling whether the synthesized audio is aligned with these points.
     *
     * This is useful when mixing the exported audio together with external media, keeping the same timing.
     *
     * Disable this option if you want the original/exact timing as per music sheet in the exported audio.
     */
    public useSyncPoints: boolean = false;

    /**
     * The current master volume as percentage. (range: 0.0-3.0, default 1.0)
     */
    public masterVolume: number = 1;

    /**
     * The metronome volume. (range: 0.0-3.0, default 0.0)
     */
    public metronomeVolume: number = 0;

    /**
     * The range of the song that should be exported. Set this to null
     * to play the whole song.
     */
    public playbackRange?: PlaybackRange;

    /**
     * The volume for individual tracks as percentage (range: 0.0-3.0).
     * @remarks
     * The key is the track index, and the value is the relative volume.
     * The configured volume (as per data model) still applies, this is an additional volume control.
     * If no custom value is set, 100% is used.
     * No values from the currently active synthesizer are applied.
     *
     * The meaning of the key changes when used with AlphaSynth directly, in this case the key is the midi channel .
     */
    public trackVolume: Map<number, number> = new Map<number, number>();

    /**
     * The additional semitone pitch transpose to apply for individual tracks.
     * @remarks
     * The key is the track index, and the value is the number of semitones to apply.
     * No values from the currently active synthesizer are applied.
     *
     * The meaning of the key changes when used with AlphaSynth directly, in this case the key is the midi channel .
     */
    public trackTranspositionPitches: Map<number, number> = new Map<number, number>();
}

/**
 * Represents a single chunk of audio produced.
 */
export class AudioExportChunk {
    /**
     * The generated samples for the requested chunk.
     */
    public samples!: Float32Array;

    /**
     * The current time position within the song in milliseconds.
     */
    public currentTime: number = 0;

    /**
     * The total length of the song in milliseconds.
     */
    public endTime: number = 0;

    /**
     * The current time position within the song in midi ticks.
     */
    public currentTick: number = 0;

    /**
     * The total length of the song in midi ticks.
     */
    public endTick: number = 0;
}

/**
 * A exporter which can be used to obtain the synthesized audio for custom processing.
 */
export interface IAudioExporter extends Disposable {
    /**
     * Renders the next chunk of audio and provides it as result.
     *
     * @param milliseconds The rough number of milliseconds that should be synthesized and exported as chunk.
     * @returns The requested chunk holding the samples and time information.
     * If the song completed playback `undefined` is returned indicating the end.
     * The provided audio might not be exactly the requested number of milliseconds as the synthesizer internally
     * uses a fixed block size of 64 samples for synthesizing audio. Depending on the sample rate
     * slightly longer audio is contained in the result.
     *
     * When the song ends, the chunk might contain less than the requested duration.
     */
    render(milliseconds: number): Promise<AudioExportChunk | undefined>;

    /*
     * Destroys the exporter and shuts down all related processing components.
     */
    destroy(): void;
}

/**
 * This is the internal worker interface implemented by IAudioExporters and consists
 * of the internal APIs needed to spawn new exporters. Its mainly used to simplify
 * the public API visible when using exporters.
 */
export interface IAudioExporterWorker extends IAudioExporter {
    /**
     * Initializes the worker.
     * @param options The options to use
     * @param midi The midi file to load
     * @param syncPoints The sync points of the song (if any)
     * @param transpositionPitches The initial transposition pitches for the midi file.
     */
    initialize(
        options: AudioExportOptions,
        midi: MidiFile,
        syncPoints: BackingTrackSyncPoint[],
        transpositionPitches: Map<number, number>
    ): Promise<void>;
}
