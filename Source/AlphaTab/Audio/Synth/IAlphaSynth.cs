using System;
using AlphaTab.Audio.Synth.Midi;

namespace AlphaTab.Audio.Synth
{
    /// <summary>
    /// The public API interface for interacting with the synthesizer.
    /// </summary>
    public interface IAlphaSynth
    {
        /// <summary>
        /// Gets or sets whether the synthesizer is ready for interaction. (output and worker are initialized)
        /// </summary>
        bool IsReady
        {
            get;
        }

        /// <summary>
        /// Gets or sets whether the synthesizer is ready for playback. (output, worker are initialized, soundfont and midi are loaded)
        /// </summary>p
        bool IsReadyForPlayback
        {
            get;
        }

        /// <summary>
        /// Gets the current player state.
        /// </summary>
        PlayerState State
        {
            get;
        }

        /// <summary>
        /// Gets or sets the loging level.
        /// </summary>
        AlphaTab.Util.LogLevel LogLevel
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the current master volume as percentage. (range: 0.0-3.0, default 1.0)
        /// </summary>
        float MasterVolume
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the metronome volume. (range: 0.0-3.0, default 0.0)
        /// </summary>
        float MetronomeVolume
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the current playback speed as percentage. (range: 0.125-8.0, default: 1.0)
        /// </summary>
        double PlaybackSpeed
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the position within the song in midi ticks.
        /// </summary>
        int TickPosition
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the position within the song in milliseconds.
        /// </summary>
        double TimePosition
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the range of the song that should be played. Set this to null
        /// to play the whole song.
        /// </summary>
        PlaybackRange PlaybackRange
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets whether the playback should automatically restart after it finished.
        /// </summary>
        bool IsLooping
        {
            get;
            set;
        }

        /// <summary>
        /// Destroys the synthesizer and all related components
        /// </summary>
        void Destroy();

        /// <summary>
        /// Starts the playback if possible
        /// </summary>
        /// <returns>true if the playback was started, otherwise false. Reasons for not starting can be that the player is not ready or already playing.</returns>
        bool Play();

        /// <summary>
        /// Pauses the playback if was running
        /// </summary>
        void Pause();

        /// <summary>
        /// Starts the playback if possible, pauses the playback if was running
        /// </summary>
        void PlayPause();

        /// <summary>
        /// Stopps the playback
        /// </summary>
        void Stop();

        /// <summary>
        ///Loads a soundfont from the given data
        /// </summary>
        /// <param name="data">a byte array to load the data from </param>
        void LoadSoundFont(byte[] data);

        /// <summary>
        /// Loads the given midi file structure.
        /// </summary>
        /// <param name="midi"></param>
        void LoadMidiFile(MidiFile midi);

        /// <summary>
        /// Gets the mute state of a channel.
        /// </summary>
        /// <param name="channel">The channel number</param>
        /// <param name="mute">true if the channel should be muted, otherwise false.</param>
        void SetChannelMute(int channel, bool mute);

        /// <summary>
        /// Resets the mute/solo state of all channels
        /// </summary>
        void ResetChannelStates();

        /// <summary>
        /// Gets the solo state of a channel.
        /// </summary>
        /// <param name="channel">The channel number</param>
        /// <param name="solo">true if the channel should be played solo, otherwise false.</param>
        void SetChannelSolo(int channel, bool solo);


        /// <summary>
        /// Gets or sets the current and initial volume of the given channel.
        /// </summary>
        /// <param name="channel">The channel number.</param>
        /// <param name="volume">The volume of of the channel (0.0-1.0)</param>
        void SetChannelVolume(int channel, float volume);

        /// <summary>
        /// Gets or sets the current and initial program of the given channel.
        /// </summary>
        /// <param name="channel">The channel number.</param>
        /// <param name="program">The midi program.</param>
        void SetChannelProgram(int channel, byte program);

        /// <summary>
        /// This event is fired when the player is ready to be interacted with.
        /// </summary>
        event Action Ready;

        /// <summary>
        /// This event is fired when all required data for playback is loaded and ready.
        /// </summary>
        event Action ReadyForPlayback;

        /// <summary>
        /// This event is fired when the playback of the whole song finished.
        /// </summary>
        event Action<PlaybackFinishedEventArgs> Finished;

        /// <summary>
        /// This event is fired when the SoundFont needed for playback was loaded.
        /// </summary>
        event Action SoundFontLoaded;

        /// <summary>
        /// This event is fired when the loading of the SoundFont failed.
        /// </summary>
        event Action<Exception> SoundFontLoadFailed;

        /// <summary>
        /// This event is fired when the Midi file needed for playback was loaded.
        /// </summary>
        event Action MidiLoaded;

        /// <summary>
        /// This event is fired when the loading of the Midi file failed.
        /// </summary>
        event Action<Exception> MidiLoadFailed;

        /// <summary>
        /// This event is fired when the playback state changed.
        /// </summary>
        event Action<PlayerStateChangedEventArgs> StateChanged;

        /// <summary>
        /// This event is fired when the current playback position of the song changed.
        /// </summary>
        event Action<PositionChangedEventArgs> PositionChanged;
    }
}
