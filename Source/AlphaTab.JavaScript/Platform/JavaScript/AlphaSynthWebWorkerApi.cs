using System;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Synthesis;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.Collections;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Model;
using AlphaTab.Util;
using Haxe;
using Haxe.Js.Html;
using Phase;

namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// a WebWorker based alphaSynth which uses the given player as output.
    /// </summary>
    class AlphaSynthWebWorkerApi : IAlphaSynth
    {
        private readonly Worker _synth;
        private readonly ISynthOutput _output;

        private readonly FastDictionary<string, FastList<Delegate>> _events;

        private bool _workerIsReadyForPlayback;
        private bool _workerIsReady;
        private bool _outputIsReady;
        private PlayerState _state;
        private float _masterVolume;
        private float _metronomeVolume;
        private double _playbackSpeed;
        private int _tickPosition;
        private double _timePosition;
        private bool _isLooping;
        private PlaybackRange _playbackRange;

        /// <inheritdoc />
        public bool IsReady
        {
            get { return _workerIsReady && _outputIsReady; }
        }

        /// <inheritdoc />
        public bool IsReadyForPlayback
        {
            get { return _workerIsReadyForPlayback; }
        }

        /// <inheritdoc />
        public PlayerState State
        {
            get { return _state; }
        }

        /// <inheritdoc />
        public LogLevel LogLevel
        {
            get { return Logger.LogLevel; }
            set
            {
                Logger.LogLevel = value;
                _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetLogLevel, value = value });
            }
        }

        /// <inheritdoc />
        public float MasterVolume
        {
            get { return _masterVolume; }
            set
            {
                value = SynthHelper.ClampF(value, SynthConstants.MinVolume, SynthConstants.MaxVolume);
                _masterVolume = value;
                _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetMasterVolume, value = value });
            }
        }

        /// <inheritdoc />
        public float MetronomeVolume
        {
            get { return _metronomeVolume; }
            set
            {
                value = SynthHelper.ClampF(value, SynthConstants.MinVolume, SynthConstants.MaxVolume);
                _metronomeVolume = value;
                _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetMetronomeVolume, value = value });
            }
        }

        /// <inheritdoc />
        public double PlaybackSpeed
        {
            get { return _playbackSpeed; }
            set
            {
                value = SynthHelper.ClampD(value, SynthConstants.MinPlaybackSpeed, SynthConstants.MaxPlaybackSpeed);
                _playbackSpeed = value;
                _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetPlaybackSpeed, value = value });
            }
        }

        /// <inheritdoc />
        public int TickPosition
        {
            get { return _tickPosition; }
            set
            {
                if (value < 0)
                {
                    value = 0;
                }
                _tickPosition = value;
                _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetTickPosition, value = value });
            }
        }

        /// <inheritdoc />
        public double TimePosition
        {
            get { return _timePosition; }
            set
            {
                if (value < 0)
                {
                    value = 0;
                }
                _timePosition = value;
                _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetTimePosition, value = value });
            }
        }

        /// <inheritdoc />
        public bool IsLooping
        {
            get { return _isLooping; }
            set
            {
                _isLooping = value;
                _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetIsLooping, value = value });
            }
        }

        /// <inheritdoc />
        public PlaybackRange PlaybackRange
        {
            get { return _playbackRange; }
            set
            {
                if (value != null)
                {
                    if (value.StartTick < 0)
                    {
                        value.StartTick = 0;
                    }
                    if (value.EndTick < 0)
                    {
                        value.EndTick = 0;
                    }
                }
                _playbackRange = value;
                _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetPlaybackRange, value = value });
            }
        }

        public AlphaSynthWebWorkerApi(ISynthOutput player, string alphaSynthScriptFile, LogLevel logLevel)
        {
            _output = player;
            _output.Ready += OnOutputReady;
            _output.SamplesPlayed += OnOutputSamplesPlayed;
            _output.SampleRequest += OnOutputSampleRequest;
            _output.Finished += OnOutputFinished;

            _events = new FastDictionary<string, FastList<Delegate>>();

            _output.Open();

            try
            {
                _synth = new Worker(alphaSynthScriptFile);
            }
            catch
            {
                // fallback to blob worker 
                try
                {
                    HaxeString script = "importScripts('" + alphaSynthScriptFile + "')";
                    var blob = new Blob(Script.Write<object>("[ script ]"));
                    _synth = new Worker(URL.CreateObjectURL(blob));
                }
                catch (Exception e)
                {
                    Logger.Error("AlphaSynth", "Failed to create WebWorker: " + e);
                    // TODO: fallback to synchronous mode
                }
            }

            _synth.AddEventListener("message", (Action<MessageEvent>)HandleWorkerMessage, false);

            _synth.PostMessage(new
            {
                cmd = AlphaSynthWebWorker.CmdInitialize,
                sampleRate = _output.SampleRate,
                logLevel = logLevel
            });

            MasterVolume = 1;
            PlaybackSpeed = 1;
            MetronomeVolume = 0;
        }

        //
        // API communicating with the web worker

        /// <inheritdoc />
        public void Play()
        {
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdPlay });
        }

        /// <inheritdoc />
        public void Pause()
        {
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdPause });
        }

        /// <inheritdoc />
        public void PlayPause()
        {
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdPlayPause });
        }

        /// <inheritdoc />
        public void Stop()
        {
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdStop });
        }

        /// <inheritdoc />
        public void LoadSoundFont(byte[] data)
        {
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdLoadSoundFontBytes, data = data });
        }

        public void LoadSoundFontFromUrl(string data)
        {
            var url = data.As<string>();
            Logger.Info("AlphaSynth", "Start loading Soundfont from url " + url);
            var request = new XMLHttpRequest();
            request.Open("GET", url, true);
            request.ResponseType = XMLHttpRequestResponseType.ARRAYBUFFER;
            request.OnLoad = (Action<Event>)(e =>
            {
                var buffer = new Uint8Array(request.Response);
                _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdLoadSoundFontBytes, data = buffer.As<byte[]>() });
            });
            request.OnError = (Action<Event>)(e =>
            {
                Logger.Error("AlphaSynth", "Loading failed: " + e.Member<string>("message"));
                TriggerEvent("soundFontLoadFailed");
            });
            request.OnProgress = (Action<Event>)(e =>
            {
                Logger.Debug("AlphaSynth", "Soundfont downloading: " + e.Member<int>("loaded") + "/" + e.Member<int>("total") + " bytes");
                TriggerEvent("soundFontLoad", new object[] {new
                {
                    loaded = e.Member<int>("loaded"),
                    total = e.Member<int>("total")
                }});
            });
            request.Send();
        }

        public void LoadMidiFile(MidiFile midi)
        {
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdLoadMidi, midi = JsonConverter.MidiFileToJsObject(midi) });
        }

        /// <inheritdoc />
        public void SetChannelMute(int channel, bool mute)
        {
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetChannelMute, channel = channel, mute = mute });
        }

        /// <inheritdoc />
        public void ResetChannelStates()
        {
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdResetChannelStates });
        }

        /// <inheritdoc />
        public void SetChannelSolo(int channel, bool solo)
        {
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetChannelSolo, channel = channel, solo = solo });
        }

        /// <inheritdoc />
        public void SetChannelVolume(int channel, double volume)
        {
            volume = SynthHelper.ClampD(volume, SynthConstants.MinVolume, SynthConstants.MaxVolume);
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetChannelVolume, channel = channel, volume = volume });
        }

        /// <inheritdoc />
        public void SetChannelProgram(int channel, byte program)
        {
            program = SynthHelper.ClampB(program, SynthConstants.MinProgram, SynthConstants.MaxProgram);
            _synth.PostMessage(new { cmd = AlphaSynthWebWorker.CmdSetChannelProgram, channel = channel, program = program });
        }

        public virtual void HandleWorkerMessage(MessageEvent e)
        {
            var data = e.Data;
            string cmd = data.cmd;
            switch (cmd)
            {
                case AlphaSynthWebWorker.CmdReady:
                    _workerIsReady = true;
                    CheckReady();
                    break;
                case AlphaSynthWebWorker.CmdReadyForPlayback:
                    _workerIsReadyForPlayback = true;
                    CheckReadyForPlayback();
                    break;
                case AlphaSynthWebWorker.CmdPositionChanged:
                    _timePosition = data.currentTime;
                    _tickPosition = data.currentTick;
                    TriggerEvent("positionChanged", new[]
                    {
                        new PositionChangedEventArgs(data.currentTime, data.endTime, data.currentTick, data.endTick)
                    });
                    break;
                case AlphaSynthWebWorker.CmdPlayerStateChanged:
                    _state = data.state;
                    TriggerEvent("playerStateChanged", new[]
                    {
                        new PlayerStateChangedEventArgs(data.state),
                    });
                    break;
                case AlphaSynthWebWorker.CmdFinished:
                    TriggerEvent("finished");
                    break;
                case AlphaSynthWebWorker.CmdSoundFontLoaded:
                    TriggerEvent("soundFontLoaded");
                    break;
                case AlphaSynthWebWorker.CmdSoundFontLoadFailed:
                    TriggerEvent("soundFontLoadFailed");
                    break;
                case AlphaSynthWebWorker.CmdMidiLoaded:
                    CheckReadyForPlayback();
                    TriggerEvent("midiFileLoaded", new object[] { data.error });
                    break;
                case AlphaSynthWebWorker.CmdMidiLoadFailed:
                    CheckReadyForPlayback();
                    TriggerEvent("midiFileLoadFailed", new object[] { data.error });
                    break;
                case AlphaSynthWebWorker.CmdLog:
                    Logger.Log(data.level, "AlphaSynth", data.message);
                    break;

                // output communication ( output <- worker )
                case AlphaSynthWorkerSynthOutput.CmdOutputSequencerFinished:
                    _output.SequencerFinished();
                    break;
                case AlphaSynthWorkerSynthOutput.CmdOutputAddSamples:
                    _output.AddSamples(data.samples);
                    break;
                case AlphaSynthWorkerSynthOutput.CmdOutputPlay:
                    _output.Play();
                    break;
                case AlphaSynthWorkerSynthOutput.CmdOutputPause:
                    _output.Pause();
                    break;
                case AlphaSynthWorkerSynthOutput.CmdOutputResetSamples:
                    _output.ResetSamples();
                    break;
            }
        }

        private void CheckReady()
        {
            if (IsReady)
            {
                TriggerEvent("ready");
            }
        }


        private void CheckReadyForPlayback()
        {
            if (IsReadyForPlayback)
            {
                TriggerEvent("readyForPlayback");
            }
        }

        /// <summary>
        /// Registers for the specified event.
        /// </summary>
        /// <param name="events">The event to register for</param>
        /// <param name="action">The function to call on the event.</param>
        public void On(string events, Delegate action)
        {
            if (!_events.ContainsKey(events))
            {
                _events[events] = new FastList<Delegate>();
            }
            _events[events].Add(action.As<Delegate>());
        }

        private void TriggerEvent(string name, object[] args = null)
        {
            var events = _events[name];
            if (events != null)
            {
                for (int i = 0; i < events.Count; i++)
                {
                    var action = events[i];
                    Script.Write("untyped __js__(\"{0}.apply(null, args)\", action);");
                }
            }
        }

        //
        // output communication ( output -> worker )


        public void OnOutputSampleRequest()
        {
            _synth.PostMessage(new { cmd = AlphaSynthWorkerSynthOutput.CmdOutputSampleRequest });
        }

        public void OnOutputFinished()
        {
            _synth.PostMessage(new { cmd = AlphaSynthWorkerSynthOutput.CmdOutputFinished });
        }

        public void OnOutputSamplesPlayed(int samples)
        {
            _synth.PostMessage(new { cmd = AlphaSynthWorkerSynthOutput.CmdOutputSamplesPlayed, samples = samples });
        }

        private void OnOutputReady()
        {
            _outputIsReady = true;
            CheckReady();
        }
    }
}
