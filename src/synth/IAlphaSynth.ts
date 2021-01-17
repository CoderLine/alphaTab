import { MidiFile } from '@src/midi/MidiFile';
import { PlaybackRange } from '@src/synth/PlaybackRange';
import { PlayerState } from '@src/synth/PlayerState';
import { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import { LogLevel } from '@src/LogLevel';
import { MidiEventsPlayedEventArgs } from './MidiEventsPlayedEventArgs';
import { MidiEventType } from '@src/midi/MidiEvent';

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
     * Gets or sets volume of the metronome during count-in. (range: 0.0-3.0, default 0.0 - no count in)
     */
    countInVolume: number;

    /**
     * Gets or sets the midi events which will trigger the `midiEventsPlayed` event.
     * To subscribe to Metronome events use the `SystemExclusiveEvent2` event type and check against `event.isMetronome` 
     */
    midiEventsPlayedFilter: MidiEventType[];

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
     * Stops any ongoing playback and plays the given midi file instead. 
     * @param midi The midi file to play
     */
    playOneTimeMidiFile(midi: MidiFile): void;

    /**
     * Loads a soundfont from the given data
     * @param data a byte array to load the data from
     * @param append Whether to fully replace or append the data from the given soundfont.
     */
    loadSoundFont(data: Uint8Array, append: boolean): void;

    /**
     * Resets all loaded soundfonts as if they were not loaded.
     */
    resetSoundFonts(): void;

    /**
     * Loads the given midi file structure.
     * @param midi
     */
    loadMidiFile(midi: MidiFile): void;

    /**
     * Sets the mute state of a channel.
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
     * This event is fired when the player is ready to be interacted with.
     */
    readonly ready: IEventEmitter;

    /**
     * This event is fired when all required data for playback is loaded and ready.
     */
    readonly readyForPlayback: IEventEmitter;

    /**
     * This event is fired when the playback of the whole song finished.
     */
    readonly finished: IEventEmitter;

    /**
     * This event is fired when the SoundFont needed for playback was loaded.
     */
    readonly soundFontLoaded: IEventEmitter;

    /**
     * This event is fired when the loading of the SoundFont failed.
     */
    readonly soundFontLoadFailed: IEventEmitterOfT<Error>;

    /**
     * This event is fired when the Midi file needed for playback was loaded.
     */
    readonly midiLoaded: IEventEmitterOfT<PositionChangedEventArgs>;

    /**
     * This event is fired when the loading of the Midi file failed.
     */
    readonly midiLoadFailed: IEventEmitterOfT<Error>

    /**
     * This event is fired when the playback state changed.
     */
    readonly stateChanged: IEventEmitterOfT<PlayerStateChangedEventArgs>;

    /**
     * This event is fired when the current playback position of/ the song changed.
     */
    readonly positionChanged: IEventEmitterOfT<PositionChangedEventArgs>;

    /**
     * The event is fired when certain midi events were sent to the audio output device for playback.
     */
    readonly midiEventsPlayed: IEventEmitterOfT<MidiEventsPlayedEventArgs>;
}
