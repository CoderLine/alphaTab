import { MidiFile } from '@src/audio/midi/MidiFile';
import { PlaybackRange } from '@src/audio/synth/PlaybackRange';
import { PlayerState } from '@src/audio/synth/PlayerState';
import { PlayerStateChangedEventArgs } from '@src/audio/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/audio/synth/PositionChangedEventArgs';
import { IEventEmitter } from '@src/EventEmitter';
import { LogLevel } from '@src/util/Logger';

/**
 * The public API interface for interacting with the synthesizer.
 */
export interface IAlphaSynth {
    /**
     * Gets or sets whether the synthesizer is ready for interaction. (output and worker are initialized)
     */
    readonly isReady: boolean;

    /**
     * Gets or sets whether the synthesizer is ready for playback. (output, worker are initialized, soundfont and midi are loaded)
     */
    readonly isReadyForPlayback: boolean;

    /**
     * Gets the current player state.
     */
    readonly state: PlayerState;

    /**
     * Gets or sets the loging level.
     */
    logLevel: LogLevel;

    /**
     * Gets or sets the current master volume as percentage. (range: 0.0-3.0, default 1.0)
     */
    masterVolume: number;

    /**
     * Gets or sets the metronome volume. (range: 0.0-3.0, default 0.0)
     */
    metronomeVolume: number;

    /**
     * Gets or sets the current playback speed as percentage. (range: 0.125-8.0, default: 1.0)
     */
    playbackSpeed: number;

    /**
     * Gets or sets the position within the song in midi ticks.
     */
    tickPosition: number;

    /**
     * Gets or sets the position within the song in milliseconds.
     */
    timePosition: number;

    /**
     * Gets or sets the range of the song that should be played. Set this to null
     * to play the whole song.
     */
    playbackRange: PlaybackRange | null;

    /**
     * Gets or sets whether the playback should automatically restart after it finished.
     */
    isLooping: boolean;

    /**
     * Destroys the synthesizer and all related components
     */
    destroy(): void;

    /**
     * Starts the playback if possible
     * @returns true if the playback was started, otherwise false. Reasons for not starting can be that the player is not ready or already playing.
     */
    play(): boolean;

    /**
     * Pauses the playback if was running
     */
    pause(): void;

    /**
     * Starts the playback if possible, pauses the playback if was running
     */
    playPause(): void;

    /**
     * Stopps the playback
     */
    stop(): void;

    /**
     * Loads a soundfont from the given data
     * @param data a byte array to load the data from
     */
    loadSoundFont(data: Uint8Array): void;

    /**
     * Loads the given midi file structure.
     * @param midi
     */
    loadMidiFile(midi: MidiFile): void;

    /**
     * Gets the mute state of a channel.
     * @param channel The channel number
     * @param mute true if the channel should be muted, otherwise false.
     */
    setChannelMute(channel: number, mute: boolean): void;

    /**
     * Resets the mute/solo state of all channels
     */
    resetChannelStates(): void;

    /**
     * Gets the solo state of a channel.
     * @param channel The channel number
     * @param solo true if the channel should be played solo, otherwise false.
     */
    setChannelSolo(channel: number, solo: boolean): void;

    /**
     * Gets or sets the current and initial volume of the given channel.
     * @param channel The channel number.
     * @param volume The volume of of the channel (0.0-1.0)
     */
    setChannelVolume(channel: number, volume: number): void;

    /**
     * Gets or sets the current and initial program of the given channel.
     * @param channel The channel number.
     * @param program The midi program.
     */
    setChannelProgram(channel: number, program: number): void;

    /**
     * This event is fired when the player is ready to be interacted with.
     */
    readonly ready: IEventEmitter<() => void>;

    /**
     * This event is fired when all required data for playback is loaded and ready.
     */
    readonly readyForPlayback: IEventEmitter<() => void>;

    /**
     * This event is fired when the playback of the whole song finished.
     */
    readonly finished: IEventEmitter<() => void>;

    /**
     * This event is fired when the SoundFont needed for playback was loaded.
     */
    readonly soundFontLoaded: IEventEmitter<() => void>;

    /**
     * This event is fired when the loading of the SoundFont failed.
     */
    readonly soundFontLoadFailed: IEventEmitter<(error: any) => void>;

    /**
     * This event is fired when the Midi file needed for playback was loaded.
     */
    readonly midiLoaded: IEventEmitter<() => void>;

    /**
     * This event is fired when the loading of the Midi file failed.
     */
    readonly midiLoadFailed: IEventEmitter<(error: any) => void>;

    /**
     * This event is fired when the playback state changed.
     */
    readonly stateChanged: IEventEmitter<(e: PlayerStateChangedEventArgs) => void>;

    /**
     * This event is fired when the current playback position of/ the song changed.
     */
    readonly positionChanged: IEventEmitter<(e: PositionChangedEventArgs) => void>;
}
