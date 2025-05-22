using System;
using System.Collections.Generic;
using AlphaTab.Collections;
using AlphaTab.Midi;
using AlphaTab.Model;
using AlphaTab.Synth;

namespace AlphaTab.Platform.CSharp;

internal abstract class AlphaSynthWorkerApiBase : IAlphaSynth
{
    private LogLevel _logLevel;
    private readonly double _bufferTimeInMilliseconds;

    private AlphaSynth _player;

    protected AlphaSynthWorkerApiBase(ISynthOutput output, LogLevel logLevel, double bufferTimeInMilliseconds)
    {
        Output = output;
        _logLevel = logLevel;
        _bufferTimeInMilliseconds = bufferTimeInMilliseconds;
        _player = null!;
    }

    public ISynthOutput Output { get; }

    public abstract void Destroy();
    protected abstract void DispatchOnUiThread(Action action);
    protected abstract void DispatchOnWorkerThread(Action action);

    protected void Initialize()
    {
        _player = new AlphaSynth(Output, _bufferTimeInMilliseconds);
        _player.PositionChanged.On(OnPositionChanged);
        _player.StateChanged.On(OnStateChanged);
        _player.Finished.On(OnFinished);
        _player.SoundFontLoaded.On(OnSoundFontLoaded);
        _player.SoundFontLoadFailed.On(OnSoundFontLoadFailed);
        _player.MidiLoaded.On(OnMidiLoaded);
        _player.MidiLoadFailed.On(OnMidiLoadFailed);
        _player.ReadyForPlayback.On(OnReadyForPlayback);
        _player.MidiEventsPlayed.On(OnMidiEventsPlayed);
        _player.PlaybackRangeChanged.On(OnPlaybackRangeChanged);

        DispatchOnUiThread(OnReady);
    }

    public bool IsReady => _player.IsReady;
    public bool IsReadyForPlayback => _player.IsReadyForPlayback;

    public PlayerState State => _player == null ? PlayerState.Paused : _player.State;

    public LogLevel LogLevel
    {
        get => _logLevel;
        set
        {
            _logLevel = value;
            DispatchOnWorkerThread(() => { _player.LogLevel = value; });
        }
    }

    public double MasterVolume
    {
        get => _player.MasterVolume;
        set => DispatchOnWorkerThread(() => { _player.MasterVolume = value; });
    }

    public double CountInVolume
    {
        get => _player.CountInVolume;
        set => DispatchOnWorkerThread(() => { _player.CountInVolume = value; });
    }

    public IList<MidiEventType> MidiEventsPlayedFilter
    {
        get => _player.MidiEventsPlayedFilter;
        set => DispatchOnWorkerThread(() => { _player.MidiEventsPlayedFilter = value; });
    }

    public double MetronomeVolume
    {
        get => _player.MetronomeVolume;
        set => DispatchOnWorkerThread(() => { _player.MetronomeVolume = value; });
    }

    public double PlaybackSpeed
    {
        get => _player.PlaybackSpeed;
        set => DispatchOnWorkerThread(() => { _player.PlaybackSpeed = value; });
    }

    public double TickPosition
    {
        get => _player.TickPosition;
        set => DispatchOnWorkerThread(() => { _player.TickPosition = value; });
    }

    public double TimePosition
    {
        get => _player.TimePosition;
        set => DispatchOnWorkerThread(() => { _player.TimePosition = value; });
    }

    public PlaybackRange? PlaybackRange
    {
        get => _player.PlaybackRange;
        set => DispatchOnWorkerThread(() => { _player.PlaybackRange = value; });
    }

    public bool IsLooping
    {
        get => _player.IsLooping;
        set => DispatchOnWorkerThread(() => { _player.IsLooping = value; });
    }

    public bool Play()
    {
        if (State == PlayerState.Playing || !IsReadyForPlayback)
        {
            return false;
        }

        DispatchOnWorkerThread(() => { _player.Play(); });
        return true;
    }

    public void Pause()
    {
        DispatchOnWorkerThread(() => { _player.Pause(); });
    }

    public void PlayOneTimeMidiFile(MidiFile midiFile)
    {
        DispatchOnWorkerThread(() => { _player.PlayOneTimeMidiFile(midiFile); });
    }

    public void PlayPause()
    {
        DispatchOnWorkerThread(() => { _player.PlayPause(); });
    }

    public void Stop()
    {
        DispatchOnWorkerThread(() => { _player.Stop(); });
    }

    public void ResetSoundFonts()
    {
        DispatchOnWorkerThread(() => { _player.ResetSoundFonts(); });
    }

    public void LoadSoundFont(Uint8Array data, bool append)
    {
        DispatchOnWorkerThread(() => { _player.LoadSoundFont(data, append); });
    }

    public void LoadMidiFile(MidiFile midi)
    {
        DispatchOnWorkerThread(() => { _player.LoadMidiFile(midi); });
    }

    public void ApplyTranspositionPitches(IValueTypeMap<double, double> transpositionPitches)
    {
        DispatchOnWorkerThread(() => { _player.ApplyTranspositionPitches(transpositionPitches); });
    }

    public void SetChannelMute(double channel, bool mute)
    {
        DispatchOnWorkerThread(() => { _player.SetChannelMute(channel, mute); });
    }

    public void ResetChannelStates()
    {
        DispatchOnWorkerThread(() => { _player.ResetChannelStates(); });
    }

    public void SetChannelSolo(double channel, bool solo)
    {
        DispatchOnWorkerThread(() => { _player.SetChannelSolo(channel, solo); });
    }

    public void SetChannelVolume(double channel, double volume)
    {
        DispatchOnWorkerThread(() => { _player.SetChannelVolume(channel, volume); });
    }

    public void SetChannelTranspositionPitch(double channel, double semitones)
    {
        DispatchOnWorkerThread(() => { _player.SetChannelTranspositionPitch(channel, semitones); });
    }

    public void LoadBackingTrack(Score score)
    {
        DispatchOnWorkerThread(() => { _player.LoadBackingTrack(score); });
    }

    public void UpdateSyncPoints( IList<BackingTrackSyncPoint> syncPoints)
    {
        DispatchOnWorkerThread(() => { _player.UpdateSyncPoints(syncPoints); });
    }

    public IEventEmitter Ready { get; } = new EventEmitter();
    public IEventEmitter ReadyForPlayback { get; } = new EventEmitter();
    public IEventEmitter Finished { get; } = new EventEmitter();
    public IEventEmitter SoundFontLoaded { get; } = new EventEmitter();
    public IEventEmitterOfT<Error> SoundFontLoadFailed { get; } = new EventEmitterOfT<Error>();
    public IEventEmitterOfT<MidiFile> MidiLoad { get; } = new EventEmitterOfT<MidiFile>();
    public IEventEmitterOfT<PositionChangedEventArgs> MidiLoaded { get; } = new EventEmitterOfT<PositionChangedEventArgs>();
    public IEventEmitterOfT<Error> MidiLoadFailed { get; } = new EventEmitterOfT<Error>();
    public IEventEmitterOfT<PlayerStateChangedEventArgs> StateChanged { get; } = new EventEmitterOfT<PlayerStateChangedEventArgs>();
    public IEventEmitterOfT<PositionChangedEventArgs> PositionChanged { get; } = new EventEmitterOfT<PositionChangedEventArgs>();
    public IEventEmitterOfT<MidiEventsPlayedEventArgs> MidiEventsPlayed { get; } = new EventEmitterOfT<MidiEventsPlayedEventArgs>();
    public IEventEmitterOfT<PlaybackRangeChangedEventArgs> PlaybackRangeChanged { get; } = new EventEmitterOfT<PlaybackRangeChangedEventArgs>();

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

    protected virtual void OnPlaybackRangeChanged(PlaybackRangeChangedEventArgs obj)
    {
        DispatchOnUiThread(() => ((EventEmitterOfT<PlaybackRangeChangedEventArgs>)PlaybackRangeChanged).Trigger(obj));
    }
}
