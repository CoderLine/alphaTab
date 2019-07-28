using System;
using AlphaTab.Audio.Synth.Bank;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Synthesis;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.IO;
using AlphaTab.Util;

namespace AlphaTab.Audio.Synth
{
    /// <summary>
    /// This is the main synthesizer component which can be used to
    /// play a <see cref="MidiFile"/> via a <see cref="ISynthOutput"/>.
    /// </summary>
    public class AlphaSynth : IAlphaSynth
    {
        private readonly MidiFileSequencer _sequencer;
        private readonly Synthesizer _synthesizer;

        private bool _isSoundFontLoaded;
        private bool _isMidiLoaded;
        private int _tickPosition;
        private double _timePosition;

        /// <summary>
        /// Gets the <see cref="ISynthOutput"/> used for playing the generated samples. 
        /// </summary>
        public ISynthOutput Output { get; }

        /// <inheritdoc />
        public bool IsReady { get; private set; }

        /// <inheritdoc />
        public bool IsReadyForPlayback => IsReady && _isSoundFontLoaded && _isMidiLoaded;

        /// <inheritdoc />
        public PlayerState State { get; private set; }

        /// <inheritdoc />
        public LogLevel LogLevel
        {
            get => Logger.LogLevel;
            set => Logger.LogLevel = value;
        }

        /// <inheritdoc />
        public float MasterVolume
        {
            get => _synthesizer.MasterVolume;
            set
            {
                value = SynthHelper.ClampF(value, SynthConstants.MinVolume, SynthConstants.MaxVolume);
                _synthesizer.MasterVolume = value;
            }
        }

        /// <inheritdoc />
        public float MetronomeVolume
        {
            get => _synthesizer.MetronomeVolume;
            set
            {
                value = SynthHelper.ClampF(value, SynthConstants.MinVolume, SynthConstants.MaxVolume);
                _synthesizer.MetronomeVolume = value;
            }
        }

        /// <inheritdoc />
        public double PlaybackSpeed
        {
            get => _sequencer.PlaybackSpeed;
            set
            {
                value = SynthHelper.ClampD(value, SynthConstants.MinPlaybackSpeed, SynthConstants.MaxPlaybackSpeed);
                var oldSpeed = _sequencer.PlaybackSpeed;
                _sequencer.PlaybackSpeed = value;
                UpdateTimePosition(_timePosition * (oldSpeed / value));
            }
        }

        /// <inheritdoc />
        public int TickPosition
        {
            get => _tickPosition;
            set
            {
                TimePosition = _sequencer.TickPositionToTimePosition(value);
            }
        }

        /// <inheritdoc />
        public double TimePosition
        {
            get => _timePosition;
            set
            {
                Logger.Debug("AlphaSynth", "Seeking to position " + value + "ms");

                // tell the sequencer to jump to the given position
                _sequencer.Seek(value);

                // update the internal position 
                UpdateTimePosition(value);

                // tell the output to reset the already synthesized buffers and request data again 
                Output.ResetSamples();
            }
        }

        /// <inheritdoc />
        public PlaybackRange PlaybackRange
        {
            get => _sequencer.PlaybackRange;
            set
            {
                _sequencer.PlaybackRange = value;
                if (value != null)
                {
                    TickPosition = value.StartTick;
                }
            }
        }

        /// <inheritdoc />
        public bool IsLooping
        {
            get => _sequencer.IsLooping;
            set => _sequencer.IsLooping = value;
        }

        /// <inheritdoc />
        public void Destroy()
        {
            Logger.Debug("AlphaSynth", "Destroying player");
            Stop();
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="AlphaSynth"/> class.
        /// </summary>
        /// <param name="output">The output to use for playing the generated samples.</param>
        public AlphaSynth(ISynthOutput output)
        {
            Logger.Debug("AlphaSynth", "Initializing player");
            State = PlayerState.Paused;

            Logger.Debug("AlphaSynth", "Creating output");
            Output = output;
            Output.Ready += () =>
            {
                IsReady = true;
                OnReady();
                CheckReadyForPlayback();
            };
            Output.Finished += () =>
            {
                // stop everything
                Stop();
                Logger.Debug("AlphaSynth", "Finished playback");
                OnFinished(new PlaybackFinishedEventArgs(_sequencer.IsLooping));
                if (_sequencer.IsLooping)
                {
                    Play();
                }
            };
            Output.SampleRequest += () =>
            {
                // synthesize buffer
                _sequencer.FillMidiEventQueue();
                _synthesizer.Synthesize();
                // send it to output
                Output.AddSamples(_synthesizer.SampleBuffer);
                // tell sequencer to check whether its work is done
                _sequencer.CheckForStop();
            };
            Output.SamplesPlayed += OnSamplesPlayed;

            Logger.Debug("AlphaSynth", "Creating synthesizer");
            _synthesizer = new Synthesizer(Output.SampleRate, SynthConstants.AudioChannels, 441, 3, 100);

            _sequencer = new MidiFileSequencer(_synthesizer);
            _sequencer.Finished += Output.SequencerFinished;

            Logger.Debug("AlphaSynth", "Opening output");
            Output.Open();
        }

        /// <inheritdoc />
        public void Play()
        {
            if (State == PlayerState.Playing || !IsReadyForPlayback) return;
            Output.Activate();

            Logger.Debug("AlphaSynth", "Starting playback");
            State = PlayerState.Playing;
            OnStateChanged(new PlayerStateChangedEventArgs(State, false));
            Output.Play();
        }

        /// <inheritdoc />
        public void Pause()
        {
            if (State == PlayerState.Paused || !IsReadyForPlayback) return;

            Logger.Debug("AlphaSynth", "Pausing playback");
            State = PlayerState.Paused;
            OnStateChanged(new PlayerStateChangedEventArgs(State, false));
            Output.Pause();
            _synthesizer.NoteOffAll(false);
        }

        /// <inheritdoc />
        public void PlayPause()
        {
            if (State == PlayerState.Playing || !IsReadyForPlayback)
            {
                Pause();
            }
            else
            {
                Play();
            }
        }

        /// <inheritdoc />
        public void Stop()
        {
            if (State == PlayerState.Paused || !IsReadyForPlayback) return;

            Logger.Debug("AlphaSynth", "Stopping playback");
            State = PlayerState.Paused;
            Output.Pause();
            _synthesizer.NoteOffAll(true);
            TickPosition = _sequencer.PlaybackRange != null ? _sequencer.PlaybackRange.StartTick : 0;
            OnStateChanged(new PlayerStateChangedEventArgs(State, true));
        }

        /// <inheritdoc />
        public void LoadSoundFont(byte[] data)
        {
            Pause();

            var input = ByteBuffer.FromBuffer(data);
            try
            {
                Logger.Info("AlphaSynth", "Loading soundfont from bytes");
                var bank = new PatchBank();
                bank.LoadSf2(input);
                _synthesizer.LoadBank(bank);

                _isSoundFontLoaded = true;
                OnSoundFontLoaded();

                Logger.Info("AlphaSynth", "soundFont successfully loaded");
                CheckReadyForPlayback();
            }
            catch (Exception e)
            {
                Logger.Error("AlphaSynth", "Could not load soundfont from bytes " + e);
                OnSoundFontLoadFailed(e);
            }
        }

        private void CheckReadyForPlayback()
        {
            if (IsReadyForPlayback)
            {
                OnReadyForPlayback();
            }
        }

        /// <summary>
        /// Loads the given midi file for playback. 
        /// </summary>
        /// <param name="midiFile">The midi file to load</param>
        // ReSharper disable once UnusedMember.Global
        public void LoadMidiFile(MidiFile midiFile)
        {
            Stop();

            try
            {
                Logger.Info("AlphaSynth", "Loading midi from model");

                _sequencer.LoadMidi(midiFile);
                _isMidiLoaded = true;
                OnMidiLoaded();
                Logger.Info("AlphaSynth", "Midi successfully loaded");
                CheckReadyForPlayback();

                TickPosition = 0;
            }
            catch (Exception e)
            {
                Logger.Error("AlphaSynth", "Could not load midi from model " + e);
                OnMidiLoadFailed(e);
            }
        }

        /// <inheritdoc />
        public void SetChannelMute(int channel, bool mute)
        {
            _synthesizer.SetChannelMute(channel, mute);
        }

        /// <inheritdoc />
        public void ResetChannelStates()
        {
            _synthesizer.ResetChannelStates();
        }

        /// <inheritdoc />
        public void SetChannelSolo(int channel, bool solo)
        {
            _synthesizer.SetChannelSolo(channel, solo);
        }

        /// <inheritdoc />
        public void SetChannelVolume(int channel, double volume)
        {
            volume = SynthHelper.ClampD(volume, SynthConstants.MinVolume, SynthConstants.MaxVolume);
            _synthesizer.SetChannelVolume(channel, volume);
        }

        /// <inheritdoc />
        public void SetChannelProgram(int channel, byte program)
        {
            program = SynthHelper.ClampB(program, SynthConstants.MinProgram, SynthConstants.MaxProgram);
            _sequencer.SetChannelProgram(channel, program);
            _synthesizer.SetChannelProgram(channel, program);
        }

        private void OnSamplesPlayed(int sampleCount)
        {
            var playedMillis = (sampleCount / (double)_synthesizer.SampleRate) * 1000;
            UpdateTimePosition(_timePosition + playedMillis);
        }

        private void UpdateTimePosition(double timePosition)
        {
            // update the real positions
            var currentTime = _timePosition = timePosition;
            var currentTick = _tickPosition = _sequencer.TimePositionToTickPosition(currentTime);

            var endTime = _sequencer.EndTime;
            var endTick = _sequencer.EndTick;

            Logger.Debug("AlphaSynth", "Position changed: (time: " + currentTime + "/" + endTime + ", tick: " + currentTick + "/" + endTime + ", Active Voices: " + _synthesizer.ActiveVoices + ", Free Voices: " + _synthesizer.FreeVoices + ")");
            OnPositionChanged(new PositionChangedEventArgs(currentTime, endTime, currentTick, endTick));
        }

        #region Events

        /// <inheritdoc />
        public event Action Ready;
        private void OnReady()
        {
            var handler = Ready;
            if (handler != null) handler();
        }

        /// <summary>
        /// Occurs when the playback of the whole midi file finished.
        /// </summary>
        public event Action<PlaybackFinishedEventArgs> Finished;
        private void OnFinished(PlaybackFinishedEventArgs e)
        {
            var handler = Finished;
            if (handler != null) handler(e);
        }

        /// <summary>
        /// Occurs when the playback state changes. 
        /// </summary>
        public event Action<PlayerStateChangedEventArgs> StateChanged;
        private void OnStateChanged(PlayerStateChangedEventArgs e)
        {
            var handler = StateChanged;
            if (handler != null) handler(e);
        }

        /// <summary>
        /// Occurs when the soundfont was successfully loaded. 
        /// </summary>
        public event Action SoundFontLoaded;
        private void OnSoundFontLoaded()
        {
            var handler = SoundFontLoaded;
            if (handler != null) handler();
        }

        /// <summary>
        /// Occurs when AlphaSynth is ready to start the playback.
        /// This is the case once the <see cref="ISynthOutput"/> is ready, a SoundFont was loaded and also a MidiFle is loaded. 
        /// </summary>
        public event Action ReadyForPlayback;
        private void OnReadyForPlayback()
        {
            var handler = ReadyForPlayback;
            if (handler != null) handler();
        }

        /// <summary>
        /// Occurs when the soundfont failed to be loaded. 
        /// </summary>
        public event Action<Exception> SoundFontLoadFailed;
        private void OnSoundFontLoadFailed(Exception e)
        {
            var handler = SoundFontLoadFailed;
            if (handler != null) handler(e);
        }

        /// <summary>
        /// Occurs when the midi file was successfully loaded. 
        /// </summary>
        public event Action MidiLoaded;
        private void OnMidiLoaded()
        {
            var handler = MidiLoaded;
            if (handler != null) handler();
        }

        /// <summary>
        /// Occurs when the midi failed to be loaded. 
        /// </summary>
        public event Action<Exception> MidiLoadFailed;
        private void OnMidiLoadFailed(Exception e)
        {
            var handler = MidiLoadFailed;
            if (handler != null) handler(e);
        }

        /// <summary>
        /// Occurs whenever the current time of the played audio changes. 
        /// </summary>
        public event Action<PositionChangedEventArgs> PositionChanged;
        private void OnPositionChanged(PositionChangedEventArgs e)
        {
            var handler = PositionChanged;
            if (handler != null) handler(e);
        }

        #endregion
    }

    #region EventArgs

    /// <summary>
    /// Represents the progress of any data being loaded. 
    /// </summary>
    public class ProgressEventArgs
    {
        /// <summary>
        /// Gets the currently loaded bytes. 
        /// </summary>
        public int Loaded { get; }
        /// <summary>
        /// Gets the total number of bytes to load. 
        /// </summary>
        public int Total { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="ProgressEventArgs"/> class.
        /// </summary>
        /// <param name="loaded"></param>
        /// <param name="total"></param>
        public ProgressEventArgs(int loaded, int total)
        {
            Loaded = loaded;
            Total = total;
        }
    }

    /// <summary>
    /// Represents the info when the playback of a whole song finished. 
    /// </summary>
    public class PlaybackFinishedEventArgs
    {
        /// <summary>
        /// Gets a value indicating whether looping is active, and the playback will start automatically again at the beginning. 
        /// </summary>
        public bool IsLooping { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="PlaybackFinishedEventArgs"/> class.
        /// </summary>
        /// <param name="isLooping"></param>
        public PlaybackFinishedEventArgs(bool isLooping)
        {
            IsLooping = isLooping;
        }
    }

    /// <summary>
    /// Represents the info when the player state changes. 
    /// </summary>
    public class PlayerStateChangedEventArgs
    {
        /// <summary>
        /// The new state of the player.
        /// </summary>
        public PlayerState State { get; }

        /// <summary>
        /// Gets a value indicating whether the playback was stopped or only paused. 
        /// </summary>
        /// <returns>true if the playback was stopped, false if the playback was started or paused</returns>
        public bool Stopped { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="PlayerStateChangedEventArgs"/> class.
        /// </summary>
        /// <param name="state">The state.</param>
        public PlayerStateChangedEventArgs(PlayerState state, bool stopped)
        {
            State = state;
            Stopped = stopped;
        }

    }

    /// <summary>
    /// Represents the info when the time in the synthesizer changes. 
    /// </summary>
    public class PositionChangedEventArgs
    {
        /// <summary>
        /// Gets the current time in milliseconds. 
        /// </summary>
        public double CurrentTime { get; }
        /// <summary>
        /// Gets the length of the played song in milliseconds. 
        /// </summary>
        public double EndTime { get; }

        /// <summary>
        /// Gets the current time in midi ticks. 
        /// </summary>
        public int CurrentTick { get; }
        /// <summary>
        /// Gets the length of the played song in midi ticks. 
        /// </summary>
        public int EndTick { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="PositionChangedEventArgs"/> class.
        /// </summary>
        /// <param name="currentTime">The current time.</param>
        /// <param name="endTime">The end time.</param>
        /// <param name="currentTick">The current tick.</param>
        /// <param name="endTick">The end tick.</param>
        public PositionChangedEventArgs(double currentTime, double endTime, int currentTick, int endTick)
        {
            CurrentTime = currentTime;
            EndTime = endTime;
            CurrentTick = currentTick;
            EndTick = endTick;
        }
    }

    #endregion
}