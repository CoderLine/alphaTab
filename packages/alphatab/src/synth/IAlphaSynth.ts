import type { MidiFile } from '@src/midi/MidiFile';
import type { PlaybackRange } from '@src/synth/PlaybackRange';
import type { PlayerState } from '@src/synth/PlayerState';
import type { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import type { PlaybackRangeChangedEventArgs } from '@src/synth/PlaybackRangeChangedEventArgs';
import type { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import type { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import type { LogLevel } from '@src/LogLevel';
import type { MidiEventsPlayedEventArgs } from '@src/synth/MidiEventsPlayedEventArgs';
import type { MidiEventType } from '@src/midi/MidiEvent';
import type { ISynthOutput } from '@src/synth/ISynthOutput';
import type { Score } from '@src/model/Score';

/**
 * Rerpresents a point to sync the alphaTab time axis with an external backing track.
 */
export class BackingTrackSyncPoint {
    /**
     * The index of the masterbar to which this sync point belongs to.
     * @remarks
     * This property is purely informative for external use like in editors.
     * It has no impact to the synchronization itself.
     */
    public masterBarIndex: number = 0;

    /**
     * The occurence of the masterbar to which this sync point belongs to. The occurence
     * is 0-based and increases with every repeated play of a masterbar (e.g. on repeats or jumps).
     * @remarks
     * This property is purely informative for external use like in editors.
     * It has no impact to the synchronization itself.
     */
    public masterBarOccurence: number = 0;

    /**
     * The BPM the synthesizer has at the exact tick position of this sync point.
     */
    public synthBpm: number = 0;

    /**
     * The millisecond time position of the synthesizer when this sync point is reached.
     */
    public synthTime: number = 0;

    /**
     * The midi tick position of the synthesizer when this sync point is reached.
     */
    public synthTick: number = 0;

    /**
     * The millisecond time in the external media marking the synchronization point.
     */
    public syncTime: number = 0;
    /**
     * The BPM the song will have virtually after this sync point to align the external media time axis
     * with the one from the synthesizer.
     */
    public syncBpm: number = 0;

    /**
     * Updates the synchronization BPM that will apply after this sync point.
     * @param nextSyncPointSynthTime The synthesizer time of the next sync point after this one.
     * @param nextSyncPointSyncTime The synchronization time of the next sync point after this one.
     */
    public updateSyncBpm(nextSyncPointSynthTime: number, nextSyncPointSyncTime: number) {
        const synthDuration = nextSyncPointSynthTime - this.synthTime;
        const syncedDuration = nextSyncPointSyncTime - this.syncTime;
        const modifiedTempo = (synthDuration / syncedDuration) * this.synthBpm;
        this.syncBpm = modifiedTempo;
    }
}

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
     * The information about the main song loaded (does not account for "one time midis" or "count in").
     */
    readonly loadedMidiInfo?: PositionChangedEventArgs;

    /**
     * The latest time information of the played song.
     */
    readonly currentPosition: PositionChangedEventArgs;

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
     * @since 1.1.0
     */
    countInVolume: number;

    /**
     * Gets or sets the midi events which will trigger the `midiEventsPlayed` event.
     */
    midiEventsPlayedFilter: MidiEventType[];

    /**
     * Gets the output used by alphaSynth.
     */
    readonly output: ISynthOutput;

    /**
     * Destroys the synthesizer and all related components
     * @since 0.9.6
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
     * Loads the synchronization information from the given score (used for backing tracks and external media).
     * @param score
     */
    loadBackingTrack(score: Score): void;

    /**
     * Updates the points used to synchronize the backing track with the synthesized audio for correct cursor placement.
     * @param syncPoints
     */
    updateSyncPoints(syncPoints: BackingTrackSyncPoint[]): void;

    /**
     * Applies the given transposition pitches to be used during playback.
     * @param transpositionPitches a map defining the transposition pitches for midi channel.
     */
    applyTranspositionPitches(transpositionPitches: Map<number, number>): void;

    /**
     * Sets the transposition pitch of a given channel. This pitch is additionally applied beside the
     * ones applied already via {@link applyTranspositionPitches}.
     * @param channel The channel number
     * @param semitones The number of semitones to apply as pitch offset.
     */
    setChannelTranspositionPitch(channel: number, semitones: number): void;

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
     * @eventProperty
     */
    readonly finished: IEventEmitter;

    /**
     * This event is fired when the SoundFont needed for playback was loaded.
     * @eventProperty
     */
    readonly soundFontLoaded: IEventEmitter;

    /**
     * This event is fired when the loading of the SoundFont failed.
     * @eventProperty
     */
    readonly soundFontLoadFailed: IEventEmitterOfT<Error>;

    /**
     * This event is fired when the Midi file needed for playback was loaded.
     * @eventProperty
     */
    readonly midiLoaded: IEventEmitterOfT<PositionChangedEventArgs>;

    /**
     * This event is fired when the loading of the Midi file failed.
     * @eventProperty
     */
    readonly midiLoadFailed: IEventEmitterOfT<Error>;

    /**
     * This event is fired when the playback state changed.
     * @eventProperty
     */
    readonly stateChanged: IEventEmitterOfT<PlayerStateChangedEventArgs>;

    /**
     * This event is fired when the current playback position of/ the song changed.
     * @eventProperty
     */
    readonly positionChanged: IEventEmitterOfT<PositionChangedEventArgs>;

    /**
     * The event is fired when certain midi events were sent to the audio output device for playback.
     * @eventProperty
     */
    readonly midiEventsPlayed: IEventEmitterOfT<MidiEventsPlayedEventArgs>;

    /**
     * The event is fired when the playback range within the player was updated.
     * @eventProperty
     */
    readonly playbackRangeChanged: IEventEmitterOfT<PlaybackRangeChangedEventArgs>;
}
