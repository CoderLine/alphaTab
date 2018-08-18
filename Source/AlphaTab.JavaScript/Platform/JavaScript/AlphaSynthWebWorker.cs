using System;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Synthesis;
using AlphaTab.Haxe;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Model;
using AlphaTab.Util;
using Phase;

namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// This class implements a HTML5 WebWorker based version of alphaSynth
    /// which can be controlled via WebWorker messages.
    /// </summary>
    class AlphaSynthWebWorker
    {
        #region Commands

        public const string CmdPrefix = "alphaSynth.";

        // Main -> Worker
        public const string CmdInitialize = CmdPrefix + "initialize";

        public const string CmdSetLogLevel = CmdPrefix + "setLogLevel";
        public const string CmdSetMasterVolume = CmdPrefix + "setMasterVolume";
        public const string CmdSetMetronomeVolume = CmdPrefix + "setMetronomeVolume";
        public const string CmdSetPlaybackSpeed = CmdPrefix + "setPlaybackSpeed";
        public const string CmdSetTickPosition = CmdPrefix + "setTickPosition";
        public const string CmdSetTimePosition = CmdPrefix + "setTimePosition";
        public const string CmdSetPlaybackRange = CmdPrefix + "setPlaybackRange";
        public const string CmdSetIsLooping = CmdPrefix + "setIsLooping";

        public const string CmdPlay = CmdPrefix + "play";
        public const string CmdPause = CmdPrefix + "pause";
        public const string CmdPlayPause = CmdPrefix + "playPause";
        public const string CmdStop = CmdPrefix + "stop";
        public const string CmdLoadSoundFontBytes = CmdPrefix + "loadSoundFontBytes";
        public const string CmdLoadMidi = CmdPrefix + "loadMidi";
        public const string CmdSetChannelMute = CmdPrefix + "setChannelMute";
        public const string CmdSetChannelSolo = CmdPrefix + "setChannelSolo";
        public const string CmdSetChannelVolume = CmdPrefix + "setChannelVolume";
        public const string CmdSetChannelProgram = CmdPrefix + "setChannelProgram";
        public const string CmdResetChannelStates = CmdPrefix + "resetChannelStates";

        // Worker -> Main
        public const string CmdReady = CmdPrefix + "ready";
        public const string CmdReadyForPlayback = CmdPrefix + "readyForPlayback";
        public const string CmdPositionChanged = CmdPrefix + "positionChanged";
        public const string CmdPlayerStateChanged = CmdPrefix + "playerStateChanged";
        public const string CmdFinished = CmdPrefix + "finished";
        public const string CmdSoundFontLoaded = CmdPrefix + "soundFontLoaded";
        public const string CmdSoundFontLoadFailed = CmdPrefix + "soundFontLoadFailed";
        public const string CmdMidiLoaded = CmdPrefix + "midiLoaded";
        public const string CmdMidiLoadFailed = CmdPrefix + "midiLoadFailed";
        public const string CmdLog = CmdPrefix + "log";

        #endregion

        private readonly Audio.Synth.AlphaSynth _player;
        private readonly DedicatedWorkerGlobalScope _main;

        public AlphaSynthWebWorker(DedicatedWorkerGlobalScope main, string id)
        {
            _main = main;
            _main.AddEventListener("message", (Action<MessageEvent>)HandleMessage);

            _player = new Audio.Synth.AlphaSynth(new AlphaSynthWorkerSynthOutput());
            _player.PositionChanged += OnPositionChanged;
            _player.PlayerStateChanged += OnPlayerStateChanged;
            _player.Finished += OnFinished;
            _player.SoundFontLoaded += OnSoundFontLoaded;
            _player.SoundFontLoadFailed += OnSoundFontLoadFailed;
            _player.SoundFontLoadFailed += OnSoundFontLoadFailed;
            _player.MidiLoaded += OnMidiLoaded;
            _player.MidiLoadFailed += OnMidiLoadFailed;
            _player.ReadyForPlayback += OnReadyForPlayback;

            _main.PostMessage(new { cmd = CmdReady });
        }

        public static void Init()
        {
            DedicatedWorkerGlobalScope main = Lib.Global;
            main.AddEventListener("message", (Action<MessageEvent>)(e =>
            {
                var data = e.Data;
                string cmd = data.cmd;
                switch (cmd)
                {
                    case CmdInitialize:
                        AlphaSynthWorkerSynthOutput.PreferredSampleRate = data.sampleRate;
                        Logger.LogLevel = data.logLevel;
                        new AlphaSynthWebWorker(main, data.id);
                        break;
                }
            }));
        }

        public void HandleMessage(MessageEvent e)
        {
            var data = e.Data;
            string cmd = data.cmd;
            switch (cmd)
            {
                case CmdSetLogLevel:
                    Logger.LogLevel = data.value;
                    break;
                case CmdSetMasterVolume:
                    _player.MasterVolume = data.value;
                    break;
                case CmdSetMetronomeVolume:
                    _player.MetronomeVolume = data.value;
                    break;
                case CmdSetPlaybackSpeed:
                    _player.PlaybackSpeed = data.value;
                    break;
                case CmdSetTickPosition:
                    _player.TickPosition = data.value;
                    break;
                case CmdSetTimePosition:
                    _player.TimePosition = data.value;
                    break;
                case CmdSetPlaybackRange:
                    _player.PlaybackRange = data.value;
                    break;
                case CmdSetIsLooping:
                    _player.IsLooping = data.value;
                    break;
                case CmdPlay:
                    _player.Play();
                    break;
                case CmdPause:
                    _player.Pause();
                    break;
                case CmdPlayPause:
                    _player.PlayPause();
                    break;
                case CmdStop:
                    _player.Stop();
                    break;
                case CmdLoadSoundFontBytes:
                    _player.LoadSoundFont(data.data);
                    break;
                case CmdLoadMidi:
                    _player.LoadMidi(JsonConverter.JsObjectToMidiFile(data.midi));
                    break;
                case CmdSetChannelMute:
                    _player.SetChannelMute(data.channel, data.mute);
                    break;
                case CmdSetChannelSolo:
                    _player.SetChannelSolo(data.channel, data.solo);
                    break;
                case CmdSetChannelVolume:
                    _player.SetChannelVolume(data.channel, data.volume);
                    break;
                case CmdSetChannelProgram:
                    _player.SetChannelProgram(data.channel, data.program);
                    break;
                case CmdResetChannelStates:
                    _player.ResetChannelStates();
                    break;
            }
        }


        public void OnPositionChanged(PositionChangedEventArgs e)
        {
            _main.PostMessage(new
            {
                cmd = CmdPositionChanged,
                currentTime = e.CurrentTime,
                endTime = e.EndTime,
                currentTick = e.CurrentTick,
                endTick = e.EndTick
            });
        }

        public void OnPlayerStateChanged(PlayerStateChangedEventArgs e)
        {
            _main.PostMessage(new
            {
                cmd = CmdPlayerStateChanged,
                state = e.State
            });
        }

        public void OnFinished(bool isLooping)
        {
            _main.PostMessage(new
            {
                cmd = CmdFinished,
                isLooping = isLooping
            });
        }

        public void OnSoundFontLoaded()
        {
            _main.PostMessage(new
            {
                cmd = CmdSoundFontLoaded
            });
        }

        public void OnSoundFontLoadFailed(Exception e)
        {
            _main.PostMessage(new
            {
                cmd = CmdSoundFontLoadFailed,
                error = SerializeException(e)
            });
        }

        private object SerializeException(Exception e)
        {
            dynamic error = Json.Parse(Json.Stringify(e));
            dynamic e2 = e;
            if (e2.message)
            {
                error.message = e2.message;
            }
            if (e2.stack)
            {
                error.stack = e2.stack;
            }
            if (e2.constructor && e2.constructor.name)
            {
                error.type = e2.constructor.name;
            }

            return error;
        }

        public void OnMidiLoaded()
        {
            _main.PostMessage(new
            {
                cmd = CmdMidiLoaded
            });
        }

        public void OnMidiLoadFailed(Exception e)
        {
            _main.PostMessage(new
            {
                cmd = CmdMidiLoaded,
                error = SerializeException(e)
            });
        }

        public void OnReadyForPlayback()
        {
            _main.PostMessage(new
            {
                cmd = CmdReadyForPlayback
            });
        }

        public void SendLog(LogLevel level, string s)
        {
            _main.PostMessage(new
            {
                cmd = CmdLog,
                level = level,
                message = s
            });
        }
    }
}
