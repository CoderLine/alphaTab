using System;
using System.Collections.Generic;
using AlphaTab.Core.EcmaScript;
using AlphaTab.Midi;
using AlphaTab.Synth;

namespace AlphaTab.Platform.CSharp
{
    internal abstract class AlphaSynthWorkerApiBase : IAlphaSynth
    {
        private readonly ISynthOutput _output;
        private LogLevel _logLevel;

        protected AlphaSynth Player;

        protected AlphaSynthWorkerApiBase(ISynthOutput output, LogLevel logLevel)
        {
            _output = output;
            _logLevel = logLevel;
            Player = null!;
        }

        public abstract void Destroy();
        protected abstract void DispatchOnUiThread(Action action);
        protected abstract void DispatchOnWorkerThread(Action action);

        protected void Initialize()
        {
            Player = new AlphaSynth(_output);
            Player.PositionChanged.On(OnPositionChanged);
            Player.StateChanged.On(OnStateChanged);
            Player.Finished.On(OnFinished);
            Player.SoundFontLoaded.On(OnSoundFontLoaded);
            Player.SoundFontLoadFailed.On(OnSoundFontLoadFailed);
            Player.MidiLoaded.On(OnMidiLoaded);
            Player.MidiLoadFailed.On(OnMidiLoadFailed);
            Player.ReadyForPlayback.On(OnReadyForPlayback);
            Player.MidiEventsPlayed.On(OnMidiEventsPlayed);

            DispatchOnUiThread(OnReady);
        }

        public bool IsReady => Player.IsReady;
        public bool IsReadyForPlayback => Player.IsReadyForPlayback;

        public PlayerState State => Player == null ? PlayerState.Paused : Player.State;

        public LogLevel LogLevel
        {
            get => _logLevel;
            set
            {
                _logLevel = value;
                DispatchOnWorkerThread(() => { Player.LogLevel = value; });
            }
        }

        public double MasterVolume
        {
            get => Player.MasterVolume;
            set => DispatchOnWorkerThread(() => { Player.MasterVolume = value; });
        }

        public double CountInVolume
        {
            get => Player.CountInVolume;
            set => DispatchOnWorkerThread(() => { Player.CountInVolume = value; });
        }

        public IList<MidiEventType> MidiEventsPlayedFilter
        {
            get => Player.MidiEventsPlayedFilter;
            set => DispatchOnWorkerThread(() => { Player.MidiEventsPlayedFilter = value; });
        }

        public double MetronomeVolume
        {
            get => Player.MetronomeVolume;
            set => DispatchOnWorkerThread(() => { Player.MetronomeVolume = value; });
        }

        public double PlaybackSpeed
        {
            get => Player.PlaybackSpeed;
            set => DispatchOnWorkerThread(() => { Player.PlaybackSpeed = value; });
        }

        public double TickPosition
        {
            get => Player.TickPosition;
            set => DispatchOnWorkerThread(() => { Player.TickPosition = value; });
        }

        public double TimePosition
        {
            get => Player.TimePosition;
            set => DispatchOnWorkerThread(() => { Player.TimePosition = value; });
        }

        public PlaybackRange? PlaybackRange
        {
            get => Player.PlaybackRange;
            set => DispatchOnWorkerThread(() => { Player.PlaybackRange = value; });
        }

        public bool IsLooping
        {
            get => Player.IsLooping;
            set => DispatchOnWorkerThread(() => { Player.IsLooping = value; });
        }

        public bool Play()
        {
            if (State == PlayerState.Playing || !IsReadyForPlayback)
            {
                return false;
            }

            DispatchOnWorkerThread(() => { Player.Play(); });
            return true;
        }

        public void Pause()
        {
            DispatchOnWorkerThread(() => { Player.Pause(); });
        }

        public void PlayOneTimeMidiFile(MidiFile midiFile)
        {
            DispatchOnWorkerThread(() => { Player.PlayOneTimeMidiFile(midiFile); });
        }

        public void PlayPause()
        {
            DispatchOnWorkerThread(() => { Player.PlayPause(); });
        }

        public void Stop()
        {
            DispatchOnWorkerThread(() => { Player.Stop(); });
        }

        public void ResetSoundFonts()
        {
            DispatchOnWorkerThread(() => { Player.ResetSoundFonts(); });
        }

        public void LoadSoundFont(Uint8Array data, bool append)
        {
            DispatchOnWorkerThread(() => { Player.LoadSoundFont(data, append); });
        }

        public void LoadMidiFile(MidiFile midi)
        {
            DispatchOnWorkerThread(() => { Player.LoadMidiFile(midi); });
        }

        public void SetChannelMute(double channel, bool mute)
        {
            DispatchOnWorkerThread(() => { Player.SetChannelMute(channel, mute); });
        }

        public void ResetChannelStates()
        {
            DispatchOnWorkerThread(() => { Player.ResetChannelStates(); });
        }

        public void SetChannelSolo(double channel, bool solo)
        {
            DispatchOnWorkerThread(() => { Player.SetChannelSolo(channel, solo); });
        }

        public void SetChannelVolume(double channel, double volume)
        {
            DispatchOnWorkerThread(() => { Player.SetChannelVolume(channel, volume); });
        }

        public IEventEmitter Ready { get; } = new EventEmitter();
        public IEventEmitter ReadyForPlayback { get; } = new EventEmitter();
        public IEventEmitter Finished { get; } = new EventEmitter();
        public IEventEmitter SoundFontLoaded { get; } = new EventEmitter();
        public IEventEmitterOfT<Error> SoundFontLoadFailed { get; } =new EventEmitterOfT<Error>();
        public IEventEmitterOfT<MidiFile> MidiLoad { get; } = new EventEmitterOfT<MidiFile>();
        public IEventEmitterOfT<PositionChangedEventArgs> MidiLoaded { get; } = new EventEmitterOfT<PositionChangedEventArgs>();
        public IEventEmitterOfT<Error> MidiLoadFailed { get; } = new EventEmitterOfT<Error>();
        public IEventEmitterOfT<PlayerStateChangedEventArgs> StateChanged { get; } = new EventEmitterOfT<PlayerStateChangedEventArgs>();
        public IEventEmitterOfT<PositionChangedEventArgs> PositionChanged { get; } = new EventEmitterOfT<PositionChangedEventArgs>();
        public IEventEmitterOfT<MidiEventsPlayedEventArgs> MidiEventsPlayed { get; } = new EventEmitterOfT<MidiEventsPlayedEventArgs>();

        protected virtual void OnReady()
        {
            DispatchOnUiThread(() => ((EventEmitter)Ready).Trigger());
        }

        protected virtual void OnReadyForPlayback()
        {
            DispatchOnUiThread(() => ((EventEmitter)ReadyForPlayback).Trigger());
        }

        protected virtual void OnFinished()
        {
            DispatchOnUiThread(() => ((EventEmitter)Finished).Trigger());
        }

        protected virtual void OnSoundFontLoaded()
        {
            DispatchOnUiThread(() => ((EventEmitter)SoundFontLoaded).Trigger());
        }

        protected virtual void OnSoundFontLoadFailed(Error e)
        {
            DispatchOnUiThread(() => ((EventEmitterOfT<Error>)SoundFontLoadFailed).Trigger(e));
        }

        protected virtual void OnMidiLoaded(PositionChangedEventArgs args)
        {
            DispatchOnUiThread(() => ((EventEmitterOfT<PositionChangedEventArgs>)MidiLoaded).Trigger(args));
        }

        protected virtual void OnMidiLoadFailed(Error e)
        {
            DispatchOnUiThread(() => ((EventEmitterOfT<Error>)MidiLoadFailed).Trigger(e));
        }

        protected virtual void OnMidiEventsPlayed(MidiEventsPlayedEventArgs e)
        {
            DispatchOnUiThread(() => ((EventEmitterOfT<MidiEventsPlayedEventArgs>)MidiEventsPlayed).Trigger(e));
        }

        protected virtual void OnStateChanged(PlayerStateChangedEventArgs obj)
        {
            DispatchOnUiThread(() => ((EventEmitterOfT<PlayerStateChangedEventArgs>)StateChanged).Trigger(obj));
        }

        protected virtual void OnPositionChanged(PositionChangedEventArgs obj)
        {
            DispatchOnUiThread(() => ((EventEmitterOfT<PositionChangedEventArgs>)PositionChanged).Trigger(obj));
        }
    }
}
