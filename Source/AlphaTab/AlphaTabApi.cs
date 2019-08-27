﻿using System;
using AlphaTab.Audio;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Utils;
using AlphaTab.UI;
using AlphaTab.Util;

namespace AlphaTab
{
    /// <summary>
    /// This class represents the public API of alphaTab and provides all logic to display
    /// a music sheet in any UI using the given <see cref="IUiFacade{TSettings}"/>
    /// </summary>
    /// <typeparam name="TSettings">The UI object holding the settings.</typeparam>
    public class AlphaTabApi<TSettings>
    {
        private long _startTime;
        private FastList<int> _trackIndexes;

        /// <summary>
        /// Gets the UI facade to use for interacting with the user interface.
        /// </summary>
        protected internal IUiFacade<TSettings> UiFacade { get; }

        /// <summary>
        /// Gets the UI container that holds the whole alphaTab control.
        /// </summary>
        public IContainer Container { get; }

        /// <summary>
        /// Gets the score renderer used for rendering the music sheet. This is the low-level API responsible for the actual rendering chain.
        /// </summary>
        public IScoreRenderer Renderer { get; }

        /// <summary>
        /// Gets the score holding all information about the song being rendered.
        /// </summary>
        public Score Score { get; private set; }

        /// <summary>
        /// Gets the settings that are used for rendering the music notation.
        /// </summary>
        public Settings Settings { get; internal set; }

        /// <summary>
        /// Gets a list of the tracks that are currently rendered;
        /// </summary>
        public Track[] Tracks { get; private set; }

        /// <summary>
        /// Gets the UI container that will hold all rendered results.
        /// </summary>
        internal IContainer CanvasElement { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="AlphaTabApi{TSettings}"/> class.
        /// </summary>
        /// <param name="uiFacade">The UI facade to use for interacting with the user interface.</param>
        /// <param name="settings">The UI settings object to use for loading the settings.</param>
        public AlphaTabApi(IUiFacade<TSettings> uiFacade, TSettings settings)
        {
            UiFacade = uiFacade;
            Container = uiFacade.RootContainer;

            uiFacade.Initialize(this, settings);
            Logger.LogLevel = Settings.LogLevel;

            CanvasElement = uiFacade.CreateCanvasElement();
            Container.AppendChild(CanvasElement);


            Container.Resize += Platform.Platform.Throttle(() =>
                {
                    if (Container.Width != Renderer.Width)
                    {
                        TriggerResize();
                    }
                },
                uiFacade.ResizeThrottle);

            if (Settings.UseWorkers && UiFacade.AreWorkersSupported &&
                Environment.GetRenderEngineFactory(Settings).SupportsWorkers)
            {
                Renderer = UiFacade.CreateWorkerRenderer();
            }
            else
            {
                Renderer = new ScoreRenderer(Settings);
            }

            var initialResizeEventInfo = new ResizeEventArgs();
            initialResizeEventInfo.OldWidth = Renderer.Width;
            initialResizeEventInfo.NewWidth = (int)Container.Width;
            initialResizeEventInfo.Settings = Settings;
            OnResize(initialResizeEventInfo);

            Renderer.RenderFinished += e => OnRenderFinished();
            Renderer.PostRenderFinished += () =>
            {
                var duration = Platform.Platform.GetCurrentMilliseconds() - _startTime;
                Logger.Info("rendering", "Rendering completed in " + duration + "ms");
                OnPostRenderFinished();
            };
            Renderer.PreRender += () =>
            {
                _startTime = Platform.Platform.GetCurrentMilliseconds();
            };
            Renderer.PartialRenderFinished += AppendRenderResult;
            Renderer.RenderFinished += r =>
            {
                AppendRenderResult(r);
                AppendRenderResult(null); // marks last element
            };
            Renderer.Error += OnError;

            if (Settings.EnablePlayer)
            {
                SetupPlayer();
            }

            UiFacade.InitialRender();
        }

        /// <summary>
        /// Destroys the alphaTab control and restores the initial state of the UI.
        /// </summary>
        public virtual void Destroy()
        {
            if (Player != null)
            {
                Player.Destroy();
            }

            UiFacade.Destroy();
            Renderer.Destroy();
        }

        #region Rendering

        /// <summary>
        /// Applies any changes that were done to the settings object and informs the <see cref="Renderer"/> about any new values to consider.
        /// </summary>
        public void UpdateSettings()
        {
            Renderer.UpdateSettings(Settings);
        }

        /// <summary>
        /// Attempts a load of the score represented by the given data object.
        /// </summary>
        /// <param name="scoreData">The data container supported by <see cref="IUiFacade{TSettings}"/></param>
        /// <param name="trackIndexes">
        /// The indexes of the tracks from the song that should be rendered. If not provided, the first track of the
        /// song will be shown.
        /// </param>
        /// <returns>true if the data object is supported and a load was initiated, otherwise false</returns>
        public bool Load(object scoreData, int[] trackIndexes = null)
        {
            try
            {
                return UiFacade.Load(scoreData,
                    score =>
                    {
                        RenderScore(score, trackIndexes);
                    },
                    error =>
                    {
                        OnError("import", error);
                    });
            }
            catch (Exception e)
            {
                OnError("import", e);
                return false;
            }
        }

        /// <summary>
        /// Initiates a rendering of the given score.
        /// </summary>
        /// <param name="score">The score containing the tracks to be rendered.</param>
        /// <param name="trackIndexes">
        /// The indexes of the tracks from the song that should be rendered. If not provided, the first track of the
        /// song will be shown.
        /// </param>
        public void RenderScore(Score score, int[] trackIndexes = null)
        {
            var tracks = new FastList<Track>();
            if (trackIndexes == null)
            {
                if (score.Tracks.Count > 0)
                {
                    tracks.Add(score.Tracks[0]);
                }
            }
            else
            {
                foreach (var index in trackIndexes)
                {
                    if (index >= 0 && index <= score.Tracks.Count)
                    {
                        tracks.Add(score.Tracks[index]);
                    }
                }
            }
            InternalRenderTracks(score, tracks.ToArray());
        }

        public void RenderTracks(Track[] tracks)
        {
            if (tracks.Length > 0)
            {
                var score = tracks[0].Score;
                foreach (var track in tracks)
                {
                    if (track.Score != score)
                    {
                        OnError("load", new AlphaTabException("All rendered tracks must belong to the same score."));
                        return;
                    }
                }

                InternalRenderTracks(score, tracks);
            }
        }

        private void InternalRenderTracks(Score score, Track[] tracks)
        {
            ModelUtils.ApplyPitchOffsets(Settings, score);

            Score = score;
            Tracks = tracks;
            _trackIndexes = new FastList<int>();
            foreach (var track in tracks)
            {
                _trackIndexes.Add(track.Index);
            }

            OnLoaded(score);
            LoadMidiForScore();

            Render();
        }

        private void TriggerResize()
        {
            if (!Container.IsVisible)
            {
                Logger.Warning("Rendering",
                    "AlphaTab container was invisible while autosizing, waiting for element to become visible");
                UiFacade.RootContainerBecameVisible += () =>
                {
                    Logger.Info("Rendering", "AlphaTab container became visible, doing autosizing");
                    TriggerResize();
                };
            }
            else
            {
                var resizeEventInfo = new ResizeEventArgs
                {
                    OldWidth = Renderer.Width,
                    NewWidth = (int)Container.Width,
                    Settings = Settings
                };
                OnResize(resizeEventInfo);
                Renderer.UpdateSettings(Settings);
                Renderer.Width = (int)Container.Width;
                Renderer.ResizeRender();
            }
        }

        private void AppendRenderResult(RenderFinishedEventArgs result)
        {
            if (result != null)
            {
                CanvasElement.Width = (int)result.TotalWidth;
                CanvasElement.Height = (int)result.TotalHeight;
                if (_cursorWrapper != null)
                {
                    _cursorWrapper.Width = (int)result.TotalWidth;
                    _cursorWrapper.Height = (int)result.TotalHeight;
                }
            }

            if (result == null || result.RenderResult != null)
            {
                UiFacade.BeginAppendRenderResults(result);
            }
        }

        /// <summary>
        /// Tells alphaTab to render the given alphaTex.
        /// </summary>
        /// <param name="tex">The alphaTex code to render.</param>
        /// <param name="tracks">If set, the given tracks will be rendered, otherwise the first track only will be rendered.</param>
        public virtual void Tex(string tex, int[] tracks = null)
        {
            try
            {
                var parser = new AlphaTexImporter();
                var data = ByteBuffer.FromBuffer(Platform.Platform.StringToByteArray(tex));
                parser.Init(data, Settings);
                var score = parser.ReadScore();
                RenderScore(score, tracks);
            }
            catch (Exception e)
            {
                OnError("import", e);
            }
        }

        /// <summary>
        /// Attempts a load of the score represented by the given data object.
        /// </summary>
        /// <param name="data">The data object to decode</param>
        /// <returns>true if the data object is supported and a load was initiated, otherwise false</returns>
        public bool LoadSoundFont(object data)
        {
            if (Player == null)
            {
                return false;
            }

            return UiFacade.LoadSoundFont(data);
        }

        /// <summary>
        /// Initiates a re-rendering of the current setup. If rendering is not yet possible, it will be deferred until the UI changes to be ready for rendering.
        /// </summary>
        public void Render()
        {
            if (Renderer == null)
            {
                return;
            }

            Action renderAction = null;
            renderAction = () =>
            {
                if (UiFacade.CanRender)
                {
                    // when font is finally loaded, start rendering
                    Renderer.Width = (int)Container.Width;
                    Renderer.RenderScore(Score, _trackIndexes.ToArray());
                }
                else
                {
                    UiFacade.CanRenderChanged += renderAction;
                }
            };
            renderAction();
        }

        #endregion

        #region Player

        private MidiTickLookup _tickCache;

        /// <summary>
        /// Gets the alphaSynth player used for playback. This is the low-level API to the Midi synthesizer used for playback.
        /// </summary>
        public IAlphaSynth Player { get; private set; }

        /// <summary>
        /// Gets whether the synthesizer is ready for playback. (output, worker are initialized, soundfont and midi are loaded)
        /// </summary>
        public virtual bool IsReadyForPlayback
        {
            get
            {
                if (Player == null)
                {
                    return false;
                }

                return Player.IsReadyForPlayback;
            }
        }

        /// <summary>
        /// Gets the current player state.
        /// </summary>
        public virtual PlayerState PlayerState
        {
            get
            {
                if (Player == null)
                {
                    return PlayerState.Paused;
                }

                return Player.State;
            }
        }

        /// <summary>
        /// Gets or sets the current master volume as percentage. (range: 0.0-3.0, default 1.0)
        /// </summary>
        public float MasterVolume
        {
            get
            {
                if (Player == null)
                {
                    return 0;
                }

                return Player.MasterVolume;
            }
            set
            {
                if (Player != null)
                {
                    Player.MasterVolume = value;
                }
            }
        }

        /// <summary>
        /// Gets or sets the metronome volume as percentage. (range: 0.0-3.0, default 0.0)
        /// </summary>
        public float MetronomeVolume
        {
            get
            {
                if (Player == null)
                {
                    return 0;
                }

                return Player.MetronomeVolume;
            }
            set
            {
                if (Player != null)
                {
                    Player.MetronomeVolume = value;
                }
            }
        }

        /// <summary>
        /// Gets or sets the position within the song in midi ticks.
        /// </summary>
        public int TickPosition
        {
            get
            {
                if (Player == null)
                {
                    return 0;
                }

                return Player.TickPosition;
            }
            set
            {
                if (Player != null)
                {
                    Player.TickPosition = value;
                }
            }
        }

        /// <summary>
        /// Gets or sets the position within the song in milliseconds.
        /// </summary>
        public double TimePosition
        {
            get
            {
                if (Player == null)
                {
                    return 0;
                }

                return Player.TimePosition;
            }
            set
            {
                if (Player != null)
                {
                    Player.TimePosition = value;
                }
            }
        }

        /// <summary>
        /// Gets or sets the range of the song that should be played. Set this to null
        /// to play the whole song.
        /// </summary>
        public PlaybackRange PlaybackRange
        {
            get
            {
                if (Player == null)
                {
                    return null;
                }

                return Player.PlaybackRange;
            }
            set
            {
                if (Player != null)
                {
                    Player.PlaybackRange = value;
                }
            }
        }

        /// <summary>
        /// Gets or sets the current playback speed as percentage. (range: 0.125-8.0, default: 1.0)
        /// </summary>
        public double PlaybackSpeed
        {
            get
            {
                if (Player == null)
                {
                    return 0;
                }

                return Player.PlaybackSpeed;
            }
            set
            {
                if (Player != null)
                {
                    Player.PlaybackSpeed = value;
                }
            }
        }

        /// <summary>
        /// Gets or sets whether the playback should automatically restart after it finished.
        /// </summary>
        public bool IsLooping
        {
            get
            {
                if (Player == null)
                {
                    return false;
                }

                return Player.IsLooping;
            }
            set
            {
                if (Player != null)
                {
                    Player.IsLooping = value;
                }
            }
        }

        private void SetupPlayer()
        {
            Player = UiFacade.CreateWorkerPlayer();
            if (Player == null)
            {
                return;
            }

            Player.Ready += () =>
            {
                LoadMidiForScore();
            };

            Player.ReadyForPlayback += () =>
            {
                OnReadyForPlayback();
                if (Tracks != null)
                {
                    foreach (var track in Tracks)
                    {
                        var volume = track.PlaybackInfo.Volume / 16f;
                        Player.SetChannelVolume(track.PlaybackInfo.PrimaryChannel, volume);
                        Player.SetChannelVolume(track.PlaybackInfo.SecondaryChannel, volume);
                    }
                }
            };

            Player.SoundFontLoaded += OnSoundFontLoaded;
            Player.SoundFontLoadFailed += e =>
            {
                OnError("soundFont", e);
            };

            Player.MidiLoaded += OnMidiLoaded;
            Player.MidiLoadFailed += e =>
            {
                OnError("midi", e);
            };

            Player.StateChanged += OnPlayerStateChanged;
            Player.PositionChanged += OnPlayerPositionChanged;
            Player.Finished += OnPlayerFinished;

            if (Settings.EnableCursor)
            {
                SetupCursor();
            }
        }

        private void LoadMidiForScore()
        {
            if (Player == null || Score == null || !Player.IsReady)
            {
                return;
            }

            Logger.Info("AlphaTab", "Generating Midi");
            var midiFile = new MidiFile();
            var handler = new AlphaSynthMidiFileHandler(midiFile);
            var generator = new MidiFileGenerator(Score, Settings, handler);
            generator.Generate();
            _tickCache = generator.TickLookup;
            Player.LoadMidiFile(midiFile);
        }

        /// <summary>
        /// Changes the volume of the given tracks.
        /// </summary>
        /// <param name="tracks">The tracks for which the volume should be changed.</param>
        /// <param name="volume">The volume to set for all tracks in percent (0-1)</param>
        public virtual void ChangeTrackVolume(Track[] tracks, float volume)
        {
            if (Player == null)
            {
                return;
            }

            foreach (var track in tracks)
            {
                Player.SetChannelVolume(track.PlaybackInfo.PrimaryChannel, volume);
                Player.SetChannelVolume(track.PlaybackInfo.SecondaryChannel, volume);
            }
        }

        /// <summary>
        /// Changes the given tracks to be played solo or not.
        /// </summary>
        /// <param name="tracks">The list of tracks to play solo or not.</param>
        /// <param name="solo">If set to true, the tracks will be added to the solo list. If false, they are removed.</param>
        /// <remarks>
        /// If one or more tracks are set to solo, only those tracks are hearable.
        /// </remarks>
        public virtual void ChangeTrackSolo(Track[] tracks, bool solo)
        {
            if (Player == null)
            {
                return;
            }

            foreach (var track in tracks)
            {
                Player.SetChannelSolo(track.PlaybackInfo.PrimaryChannel, solo);
                Player.SetChannelSolo(track.PlaybackInfo.SecondaryChannel, solo);
            }
        }

        /// <summary>
        /// Changes the given tracks to be muted or not.
        /// </summary>
        /// <param name="tracks">The list of track to mute or unmute.</param>
        /// <param name="mute">If set to true, the tracks will be muted. If false they are unmuted.</param>
        public virtual void ChangeTrackMute(Track[] tracks, bool mute)
        {
            if (Player == null)
            {
                return;
            }

            foreach (var track in tracks)
            {
                Player.SetChannelMute(track.PlaybackInfo.PrimaryChannel, mute);
                Player.SetChannelMute(track.PlaybackInfo.SecondaryChannel, mute);
            }
        }

        /// <summary>
        /// Starts the playback of the current song.
        /// </summary>
        /// <returns>true if the playback was started, otherwise false. Reasons for not starting can be that the player is not ready or already playing.</returns>
        public bool Play()
        {
            if (Player == null)
            {
                return false;
            }

            return Player.Play();
        }

        /// <summary>
        /// Pauses the playback of the current song.
        /// </summary>
        public void Pause()
        {
            if (Player == null)
            {
                return;
            }

            Player.Pause();
        }

        /// <summary>
        /// Toggles between play/pause depending on the current player state.
        /// </summary>
        public void PlayPause()
        {
            if (Player == null)
            {
                return;
            }

            Player.PlayPause();
        }

        /// <summary>
        /// Stops the playback of the current song, and moves the playback position back to the start.
        /// </summary>
        public void Stop()
        {
            if (Player == null)
            {
                return;
            }

            Player.Stop();
        }

        #endregion

        #region Cursors

        private IContainer _cursorWrapper;
        private IContainer _barCursor;
        private IContainer _beatCursor;
        private IContainer _selectionWrapper;

        private int _previousTick;
        private PlayerState _playerState;

        private BoundsLookup _cursorCache;
        private Beat _currentBeat;

        private PlayerState _previousStateForCursor;
        private BoundsLookup _previousCursorCache;
        private int _lastScroll;

        private void SetupCursor()
        {
            //
            // Create cursors

            var cursors = UiFacade.CreateCursors();
            if (cursors == null)
            {
                return;
            }

            // store options and created elements for fast access
            _cursorWrapper = cursors.CursorWrapper;
            _barCursor = cursors.BarCursor;
            _beatCursor = cursors.BeatCursor;
            _selectionWrapper = cursors.SelectionWrapper;

            //
            // Hook into events

            //var surface = Element.QuerySelector(".alphaTabSurface");
            _previousTick = 0;
            _playerState = PlayerState.Paused;
            // we need to update our position caches if we render a tablature
            Renderer.PostRenderFinished += () =>
            {
                _cursorCache = Renderer.BoundsLookup;
                CursorUpdateTick(_previousTick);
            };

            Player.PositionChanged += e =>
            {
                _previousTick = e.CurrentTick;
                UiFacade.BeginInvoke(() => { CursorUpdateTick(e.CurrentTick); });
            };

            Player.StateChanged += e =>
            {
                _playerState = e.State;

                if (!e.Stopped && e.State == PlayerState.Paused)
                {
                    var currentBeat = _currentBeat;
                    var tickCache = _tickCache;
                    if (currentBeat != null && tickCache != null)
                    {
                        Player.TickPosition = tickCache.GetMasterBarStart(currentBeat.Voice.Bar.MasterBar) +
                                              currentBeat.PlaybackStart;
                    }
                }
            };

            SetupClickHandling();
        }

        /// <summary>
        /// updates the cursors to highlight the beat at the specified tick position
        /// </summary>
        /// <param name="tick"></param>
        /// <param name="stop"></param>
        private void CursorUpdateTick(int tick, bool stop = false)
        {
            UiFacade.BeginInvoke(() =>
            {
                var cache = _tickCache;
                if (cache != null)
                {
                    var tracks = Tracks;
                    if (tracks.Length > 0)
                    {
                        var beat = cache.FindBeat(tracks, tick);
                        if (beat != null)
                        {
                            CursorUpdateBeat(beat.CurrentBeat, beat.NextBeat, beat.Duration, stop);
                        }
                    }
                }
            });
        }

        /// <summary>
        /// updates the cursors to highlight the specified beat
        /// </summary>
        private void CursorUpdateBeat(Beat beat, Beat nextBeat, double duration, bool stop)
        {
            if (beat == null)
            {
                return;
            }

            var cache = _cursorCache;
            if (cache == null)
            {
                return;
            }

            var previousBeat = _currentBeat;
            var previousCache = _previousCursorCache;
            var previousState = _previousStateForCursor;
            _currentBeat = beat;
            _previousCursorCache = cache;
            _previousStateForCursor = _playerState;

            if (beat == previousBeat && cache == previousCache && previousState == _playerState)
            {
                return;
            }


            var barCursor = _barCursor;
            var beatCursor = _beatCursor;

            var beatBoundings = cache.FindBeat(beat);
            if (beatBoundings == null)
            {
                return;
            }

            var barBoundings = beatBoundings.BarBounds.MasterBarBounds;
            var barBounds = barBoundings.VisualBounds;
            barCursor.Top = barBounds.Y;
            barCursor.Left = barBounds.X;
            barCursor.Width = barBounds.W;
            barCursor.Height = barBounds.H;

            // move beat to start position immediately
            beatCursor.StopAnimation();
            beatCursor.Top = barBounds.Y;
            beatCursor.Left = beatBoundings.VisualBounds.X;
            beatCursor.Width = Settings.BeatCursorWidth;
            beatCursor.Height = barBounds.H;

            // if playing, animate the cursor to the next beat
            UiFacade.RemoveHighlights();

            if (_playerState == PlayerState.Playing || stop)
            {
                duration /= Player.PlaybackSpeed;

                if (!stop)
                {
                    var className = BeatContainerGlyph.GetGroupId(beat);
                    UiFacade.HighlightElements(className);

                    var nextBeatX = barBoundings.VisualBounds.X + barBoundings.VisualBounds.W;
                    // get position of next beat on same stavegroup
                    if (nextBeat != null)
                    {
                        // if we are moving within the same bar or to the next bar
                        // transition to the next beat, otherwise transition to the end of the bar.
                        if (nextBeat.Voice.Bar.Index == beat.Voice.Bar.Index ||
                            nextBeat.Voice.Bar.Index == beat.Voice.Bar.Index + 1)
                        {
                            var nextBeatBoundings = cache.FindBeat(nextBeat);
                            if (nextBeatBoundings != null &&
                                nextBeatBoundings.BarBounds.MasterBarBounds.StaveGroupBounds ==
                                barBoundings.StaveGroupBounds)
                            {
                                nextBeatX = nextBeatBoundings.VisualBounds.X;
                            }
                        }
                    }

                    UiFacade.BeginInvoke(() =>
                    {
                        //Logger.Info("Player",
                        //    "Transition from " + beatBoundings.VisualBounds.X + " to " + nextBeatX + " in " + duration +
                        //    "(" + Player.PlaybackRange + ")");
                        beatCursor.TransitionToX(duration, nextBeatX);
                    });
                }

                if (!_selecting && Settings.ScrollMode != ScrollMode.Off)
                {
                    //// calculate position of whole music wheet within the scroll parent
                    var scrollElement = UiFacade.GetScrollContainer();
                    var isVertical = Environment.GetLayoutEngineFactory(Settings).Vertical;
                    var mode = Settings.ScrollMode;

                    var elementOffset = UiFacade.GetOffset(scrollElement, Container);

                    if (isVertical)
                    {
                        switch (mode)
                        {
                            case ScrollMode.Continuous:
                                var y = (int)(elementOffset.Y + barBoundings.RealBounds.Y + Settings.ScrollOffsetY);
                                if (y != _lastScroll)
                                {
                                    _lastScroll = y;
                                    UiFacade.ScrollToY(scrollElement, y, Settings.ScrollSpeed);
                                }

                                break;
                            case ScrollMode.OffScreen:
                                var elementBottom = scrollElement.ScrollTop + UiFacade.GetOffset(null, scrollElement).H;
                                if (barBoundings.VisualBounds.Y + barBoundings.VisualBounds.H >= elementBottom ||
                                    barBoundings.VisualBounds.Y < scrollElement.ScrollTop)
                                {
                                    var scrollTop = barBoundings.RealBounds.Y + Settings.ScrollOffsetY;
                                    _lastScroll = (int)barBoundings.VisualBounds.X;
                                    UiFacade.ScrollToY(scrollElement, (int)scrollTop, Settings.ScrollSpeed);
                                }

                                break;
                        }
                    }
                    else
                    {
                        switch (mode)
                        {
                            case ScrollMode.Continuous:
                                var x = (int)barBoundings.VisualBounds.X;
                                if (x != _lastScroll)
                                {
                                    var scrollLeft = (int)(barBoundings.RealBounds.X + Settings.ScrollOffsetX);
                                    _lastScroll = (int)barBoundings.VisualBounds.X;
                                    UiFacade.ScrollToX(scrollElement, scrollLeft, Settings.ScrollSpeed);
                                }

                                break;
                            case ScrollMode.OffScreen:
                                var elementRight = scrollElement.ScrollLeft + UiFacade.GetOffset(null, scrollElement).W;
                                if (barBoundings.VisualBounds.X + barBoundings.VisualBounds.W >= elementRight ||
                                    barBoundings.VisualBounds.X < scrollElement.ScrollLeft)
                                {
                                    var scrollLeft = barBoundings.RealBounds.X + Settings.ScrollOffsetX;
                                    _lastScroll = (int)barBoundings.VisualBounds.X;
                                    UiFacade.ScrollToX(scrollElement, (int)scrollLeft, Settings.ScrollSpeed);
                                }

                                break;
                        }
                    }
                }

                // trigger an event for others to indicate which beat/bar is played
                OnPlayedBeatChanged(beat);
            }
        }

        /// <summary>
        /// This event is fired whenever a new beat is played.
        /// </summary>
        public event Action<Beat> PlayedBeatChanged;

        private void OnPlayedBeatChanged(Beat beat)
        {
            var handler = PlayedBeatChanged;
            if (handler != null)
            {
                handler(beat);
            }

            UiFacade.TriggerEvent(Container, "playedBeatChanged", beat);
        }

        #endregion

        #region Selection

        private bool _selecting;
        private SelectionInfo _selectionStart;
        private SelectionInfo _selectionEnd;

        private void SetupClickHandling()
        {
            CanvasElement.MouseDown += e =>
            {
                if (!e.IsLeftMouseButton)
                {
                    return;
                }

                e.PreventDefault();

                var relX = e.GetX(CanvasElement);
                var relY = e.GetY(CanvasElement);
                var beat = _cursorCache.GetBeatAtPos(relX, relY);
                if (beat != null)
                {
                    _selectionStart = new SelectionInfo(beat);
                    _selectionEnd = null;
                    _selecting = true;
                }
            };

            CanvasElement.MouseMove += e =>
            {
                if (!_selecting)
                {
                    return;
                }

                var relX = e.GetX(CanvasElement);
                var relY = e.GetY(CanvasElement);
                var beat = _cursorCache.GetBeatAtPos(relX, relY);
                if (beat != null && (_selectionEnd == null || _selectionEnd.Beat != beat))
                {
                    _selectionEnd = new SelectionInfo(beat);
                    CursorSelectRange(_selectionStart, _selectionEnd);
                }
            };

            CanvasElement.MouseUp += e =>
            {
                if (!_selecting)
                {
                    return;
                }

                e.PreventDefault();

                // for the selection ensure start < end
                if (_selectionEnd != null)
                {
                    var startTick = _selectionStart.Beat.AbsoluteDisplayStart;
                    var endTick = _selectionStart.Beat.AbsoluteDisplayStart;
                    if (endTick < startTick)
                    {
                        var t = _selectionStart;
                        _selectionStart = _selectionEnd;
                        _selectionEnd = t;
                    }
                }

                if (_selectionStart != null)
                {
                    // get the start and stop ticks (which consider properly repeats)
                    var tickCache = _tickCache;
                    var realMasterBarStart = tickCache.GetMasterBarStart(_selectionStart.Beat.Voice.Bar.MasterBar);

                    // move to selection start
                    CursorUpdateBeat(_selectionStart.Beat, null, 0, false);
                    Player.TickPosition = realMasterBarStart + _selectionStart.Beat.PlaybackStart;

                    // set playback range
                    if (_selectionEnd != null && _selectionStart.Beat != _selectionEnd.Beat)
                    {
                        var realMasterBarEnd = tickCache.GetMasterBarStart(_selectionEnd.Beat.Voice.Bar.MasterBar);
                        Player.PlaybackRange = new PlaybackRange
                        {
                            StartTick = realMasterBarStart + _selectionStart.Beat.PlaybackStart,
                            EndTick = realMasterBarEnd + _selectionEnd.Beat.PlaybackStart +
                                      _selectionEnd.Beat.PlaybackDuration - 50
                        };
                    }
                    else
                    {
                        _selectionStart = null;
                        Player.PlaybackRange = null;
                        CursorSelectRange(_selectionStart, _selectionEnd);
                    }
                }

                _selecting = false;
            };

            Renderer.PostRenderFinished += () =>
            {
                if (_selectionStart != null)
                {
                    CursorSelectRange(_selectionStart, _selectionEnd);
                }
            };
        }

        /// <summary>
        /// Updates the layout settings and triggers a re-rendering.
        /// </summary>
        /// <param name="layoutSettings">The new layout settings to apply</param>
        public virtual void UpdateLayout(LayoutSettings layoutSettings)
        {
            Settings.Layout = layoutSettings;
            Renderer.UpdateSettings(Settings);
            Renderer.Render();
        }


        private void CursorSelectRange(SelectionInfo startBeat, SelectionInfo endBeat)
        {
            var cache = _cursorCache;
            if (cache == null)
            {
                return;
            }

            var selectionWrapper = _selectionWrapper;
            selectionWrapper.Clear();

            if (startBeat == null || endBeat == null || startBeat.Beat == endBeat.Beat)
            {
                return;
            }

            if (startBeat.Bounds == null)
            {
                startBeat.Bounds = cache.FindBeat(startBeat.Beat);
            }

            if (endBeat.Bounds == null)
            {
                endBeat.Bounds = cache.FindBeat(endBeat.Beat);
            }

            var startTick = startBeat.Beat.AbsolutePlaybackStart;
            var endTick = endBeat.Beat.AbsolutePlaybackStart;
            if (endTick < startTick)
            {
                var t = startBeat;
                startBeat = endBeat;
                endBeat = t;
            }

            var startX = startBeat.Bounds.RealBounds.X;
            var endX = endBeat.Bounds.RealBounds.X + endBeat.Bounds.RealBounds.W;
            if (endBeat.Beat.Index == endBeat.Beat.Voice.Beats.Count - 1)
            {
                endX = endBeat.Bounds.BarBounds.MasterBarBounds.RealBounds.X +
                       endBeat.Bounds.BarBounds.MasterBarBounds.RealBounds.W;
            }

            // if the selection goes across multiple staves, we need a special selection highlighting
            if (startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds !=
                endBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds)
            {
                // from the startbeat to the end of the staff,
                // then fill all staffs until the end-beat staff
                // then from staff-start to the end beat (or to end of bar if it's the last beat)

                var staffStartX = startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.X;
                var staffEndX = startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.X +
                                startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.W;

                var startSelection = UiFacade.CreateSelectionElement();
                startSelection.Top = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.Y;
                startSelection.Left = startX;
                startSelection.Width = staffEndX - startX;
                startSelection.Height = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.H;
                selectionWrapper.AppendChild(startSelection);

                var staffStartIndex = startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.Index + 1;
                var staffEndIndex = endBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.Index;
                for (var staffIndex = staffStartIndex; staffIndex < staffEndIndex; staffIndex++)
                {
                    var staffBounds = cache.StaveGroups[staffIndex];

                    var middleSelection = UiFacade.CreateSelectionElement();
                    middleSelection.Top = staffBounds.VisualBounds.Y;
                    middleSelection.Left = staffStartX;
                    middleSelection.Width = staffEndX - staffStartX;
                    middleSelection.Height = staffBounds.VisualBounds.H;
                    selectionWrapper.AppendChild(middleSelection);
                }

                var endSelection = UiFacade.CreateSelectionElement();
                endSelection.Top = endBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.Y;
                endSelection.Left = staffStartX;
                endSelection.Width = endX - staffStartX;
                endSelection.Height = endBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.H;
                selectionWrapper.AppendChild(endSelection);
            }
            else
            {
                // if the beats are on the same staff, we simply highlight from the startbeat to endbeat
                var selection = UiFacade.CreateSelectionElement();
                selection.Top = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.Y;
                selection.Left = startX;
                selection.Width = endX - startX;
                selection.Height = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.H;
                selectionWrapper.AppendChild(selection);
            }
        }

        #endregion

        #region Events

        /// <summary>
        /// This event is fired whenever a new song is loaded.
        /// </summary>
        public event Action<Score> Loaded;

        private void OnLoaded(Score obj)
        {
            var handler = Loaded;
            if (handler != null)
            {
                handler(obj);
            }

            UiFacade.TriggerEvent(Container, "loaded", obj);
        }

        /// <summary>
        /// This event is fired when alphaTab was resized and is about to rerender the music notation.
        /// </summary>
        public event Action<ResizeEventArgs> Resize;

        private void OnResize(ResizeEventArgs obj)
        {
            var handler = Resize;
            if (handler != null)
            {
                handler(obj);
            }

            UiFacade.TriggerEvent(Container, "resize", obj);
        }

        /// <summary>
        /// This event is fired when the rendering of the whole music sheet is finished.
        /// </summary>
        public event Action RenderFinished;

        private void OnRenderFinished()
        {
            var handler = RenderFinished;
            if (handler != null)
            {
                handler();
            }

            UiFacade.TriggerEvent(Container, "rendered");
        }

        /// <summary>
        /// This event is fired when the rendering of the whole music sheet is finished, and all handlers of <see cref="RenderFinished"/> ran.
        /// </summary>
        public event Action PostRenderFinished;

        private void OnPostRenderFinished()
        {
            var handler = PostRenderFinished;
            if (handler != null)
            {
                handler();
            }

            UiFacade.TriggerEvent(Container, "postRendered");
        }

        /// <summary>
        /// This event is fired when an error within alphatab occurred.
        /// </summary>
        public event Action<string, Exception> Error;

        internal void OnError(string type, Exception details)
        {
            Logger.Error(type, "An unexpected error occurred", details);

            var handler = Error;
            if (handler != null)
            {
                handler(type, details);
            }

            UiFacade.TriggerEvent(Container,
                "error",
                new
                {
                    type = type,
                    details = details
                });
        }

        #endregion

        #region Player Events

        /// <summary>
        /// This event is fired when all required data for playback is loaded and ready.
        /// </summary>
        public event Action ReadyForPlayback;
        private void OnReadyForPlayback()
        {
            var handler = ReadyForPlayback;
            if (handler != null)
            {
                handler();
            }

            UiFacade.TriggerEvent(Container, "playerReady");
        }

        /// <summary>
        /// This event is fired when the playback of the whole song finished.
        /// </summary>
        public event Action PlayerFinished;
        private void OnPlayerFinished()
        {
            var handler = PlayerFinished;
            if (handler != null)
            {
                handler();
            }

            UiFacade.TriggerEvent(Container, "finished");
        }

        /// <summary>
        /// This event is fired when the SoundFont needed for playback was loaded.
        /// </summary>
        public event Action SoundFontLoaded;
        private void OnSoundFontLoaded()
        {
            var handler = SoundFontLoaded;
            if (handler != null)
            {
                handler();
            }
            UiFacade.TriggerEvent(Container, "soundFontLoaded");
        }

        /// <summary>
        /// This event is fired when the Midi file needed for playback was loaded.
        /// </summary>
        public event Action MidiLoaded;
        private void OnMidiLoaded()
        {
            var handler = MidiLoaded;
            if (handler != null)
            {
                handler();
            }
            UiFacade.TriggerEvent(Container, "midiFileLoaded");
        }

        /// <summary>
        /// This event is fired when the playback state changed.
        /// </summary>
        public event Action<PlayerStateChangedEventArgs> PlayerStateChanged;
        private void OnPlayerStateChanged(PlayerStateChangedEventArgs e)
        {
            var handler = PlayerStateChanged;
            if (handler != null)
            {
                handler(e);
            }
            UiFacade.TriggerEvent(Container, "playerStateChanged", e);
        }

        /// <summary>
        /// This event is fired when the current playback position of the song changed.
        /// </summary>
        public event Action<PositionChangedEventArgs> PlayerPositionChanged;
        private void OnPlayerPositionChanged(PositionChangedEventArgs e)
        {
            var handler = PlayerPositionChanged;
            if (handler != null)
            {
                handler(e);
            }
            UiFacade.TriggerEvent(Container, "positionChanged", e);
        }

        #endregion
    }

    internal class SelectionInfo
    {
        public Beat Beat { get; set; }
        public BeatBounds Bounds { get; set; }

        public SelectionInfo(Beat beat)
        {
            Beat = beat;
        }
    }
}
