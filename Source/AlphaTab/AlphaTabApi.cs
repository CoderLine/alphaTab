using System;
using AlphaTab.Audio;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Synthesis;
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
    public class ResizeEventArgs
    {
        public int OldWidth { get; set; }
        public int NewWidth { get; set; }
        public Settings Settings { get; set; }
    }

    public class AlphaTabApi<TSettings>
    {
        private long _startTime;

        protected IUiFacade<TSettings> UiFacade { get; }

        public IContainer Container { get; }
        public IContainer CanvasElement { get; }
        public IScoreRenderer Renderer { get; }
        public bool AutoSize { get; }

        public Score Score { get; private set; }
        public int[] TrackIndexes { get; private set; }

        public Settings Settings { get; internal set; }

        public Track[] Tracks
        {
            get
            {
                var tracks = TrackIndexesToTracks(TrackIndexes);

                if (tracks.Length == 0 && Score.Tracks.Count > 0)
                {
                    return new[] { Score.Tracks[0] };
                }

                return tracks;
            }
        }

        public AlphaTabApi(IUiFacade<TSettings> uiFacade, TSettings settings)
        {
            UiFacade = uiFacade;
            Container = uiFacade.RootContainer;

            uiFacade.Initialize(this, settings);
            Logger.LogLevel = Settings.LogLevel;

            AutoSize = Settings.Width < 0;

            CanvasElement = uiFacade.CreateCanvasElement();
            Container.AppendChild(CanvasElement);

            #region Auto Sizing

            if (AutoSize)
            {
                Settings.Width = (int)Container.Width;

                Container.Resize += Platform.Platform.Throttle(() =>
                {
                    if (Container.Width != Settings.Width)
                    {
                        TriggerResize();
                    }
                }, uiFacade.ResizeThrottle);

                var initialResizeEventInfo = new ResizeEventArgs();
                initialResizeEventInfo.OldWidth = 0;
                initialResizeEventInfo.NewWidth = (int)Container.Width;
                initialResizeEventInfo.Settings = Settings;
                OnResize(initialResizeEventInfo);
                Settings.Width = initialResizeEventInfo.NewWidth;
            }

            #endregion

            if (Settings.UseWorkers && UiFacade.AreWorkersSupported && Environment.GetRenderEngineFactory(Settings).SupportsWorkers)
            {
                Renderer = UiFacade.CreateWorkerRenderer();
            }
            else
            {
                Renderer = new ScoreRenderer(Settings);
            }

            Renderer.RenderFinished += OnRenderFinished;
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

        public virtual void Destroy()
        {
            if (Player != null)
            {
                Player.Destroy();
            }
            UiFacade.Destroy();
            Renderer.Destroy();
        }

        public Track[] TrackIndexesToTracks(int[] trackIndexes)
        {
            var tracks = new FastList<Track>();

            if (trackIndexes == null)
            {
                return Score.Tracks.ToArray();
            }

            foreach (var track in trackIndexes)
            {
                if (track >= 0 && track < Score.Tracks.Count)
                {
                    tracks.Add(Score.Tracks[track]);
                }
            }

            return tracks.ToArray();
        }


        #region Rendering

        public void UpdateSettings()
        {
            Renderer.UpdateSettings(Settings);
        }

        private void TriggerResize()
        {
            if (!Container.IsVisible)
            {
                Logger.Warning("Rendering", "AlphaTab container was invisible while autosizing, waiting for element to become visible");
                UiFacade.RootContainerBecameVisible += () =>
                {
                    Logger.Info("Rendering", "AlphaTab container became visible, doing autosizing");
                    TriggerResize();
                };
            }
            else
            {
                var resizeEventInfo = new ResizeEventArgs();
                resizeEventInfo.OldWidth = Settings.Width;
                resizeEventInfo.NewWidth = (int)Container.Width;
                resizeEventInfo.Settings = Settings;
                OnResize(resizeEventInfo);
                Settings.Width = resizeEventInfo.NewWidth;
                Renderer.UpdateSettings(Settings);
                Renderer.Resize(Settings.Width);
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

        public void RenderTracks(Score score, int[] tracks, bool invalidate = true)
        {
            if (score != null && score != Score)
            {
                ScoreLoaded(score, false);
            }

            TrackIndexes = tracks;

            if (invalidate)
            {
                Render();
            }
        }

        public void Tex(string contents, int[] tracks = null)
        {
            try
            {
                var parser = new AlphaTexImporter();
                var data = ByteBuffer.FromBuffer(Platform.Platform.StringToByteArray(contents));
                parser.Init(data, Settings);
                var score = parser.ReadScore();
                if (tracks != null)
                {
                    tracks = new int[] {0};
                }
                RenderTracks(score, tracks, true);
            }
            catch (Exception e)
            {
                OnError("import", e);
            }
        }

        protected internal void ScoreLoaded(Score score, bool render = true)
        {
            ModelUtils.ApplyPitchOffsets(Settings, score);

            Score = score;
            LoadMidiForScore();

            OnLoaded(score);
            if (render)
            {
                Render();
            }
        }

        public void Render()
        {
            if (Renderer == null) return;
            Action renderAction = null;
            renderAction = () =>
            {
                if (UiFacade.CanRender)
                {
                    // when font is finally loaded, start rendering
                    Renderer.Render(Score, TrackIndexes);
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

        public IAlphaSynth Player { get; private set; }

        private void SetupPlayer()
        {
            Player = UiFacade.CreateWorkerPlayer();
            if (Player == null) return;

            Player.Ready += () =>
            {
                LoadMidiForScore();
            };

            Player.ReadyForPlayback += () =>
            {
                UiFacade.TriggerEvent(Container, "playerReady");
            };

            Player.SoundFontLoaded += () =>
            {
                UiFacade.TriggerEvent(Container, "soundFontLoaded");
            };
            Player.SoundFontLoadFailed += e =>
            {
                UiFacade.TriggerEvent(Container, "soundFontLoadFailed", e);
            };

            Player.MidiLoaded += () =>
            {
                UiFacade.TriggerEvent(Container, "midiFileLoaded");
            };
            Player.MidiLoadFailed += e =>
            {
                UiFacade.TriggerEvent(Container, "midiFileLoadFailed", e);
            };

            Player.StateChanged += e =>
            {
                UiFacade.TriggerEvent(Container, "playerStateChanged", e);
            };
            Player.PositionChanged += e =>
            {
                UiFacade.TriggerEvent(Container, "positionChanged", e);
            };
            Player.Finished += e =>
            {
                UiFacade.TriggerEvent(Container, "finished", e);
            };

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

        public void ChangeTrackVolume(Track[] tracks, float volume)
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

        public void ChangeTrackSolo(Track[] tracks, bool solo)
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

        public void ChangeTrackMute(Track[] tracks, bool mute)
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

        public void Play()
        {
            if (Player == null)
            {
                return;
            }
            Player.Play();
        }

        public void Pause()
        {
            if (Player == null)
            {
                return;
            }
            Player.Pause();
        }

        public void PlayPause()
        {
            if (Player == null)
            {
                return;
            }
            Player.PlayPause();
        }

        public void Stop()
        {
            if (Player == null)
            {
                return;
            }
            Player.Stop();
            CursorUpdateTick(0, true);
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
            if (cursors == null) return;

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
                UiFacade.BeginInvoke(() => { CursorUpdateTick(_previousTick); });
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
            if (beat == null) return;

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
                                nextBeatBoundings.BarBounds.MasterBarBounds.StaveGroupBounds == barBoundings.StaveGroupBounds)
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
                                if ((barBoundings.VisualBounds.Y + barBoundings.VisualBounds.H) >= elementBottom || barBoundings.VisualBounds.Y < scrollElement.ScrollTop)
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
                                if ((barBoundings.VisualBounds.X + barBoundings.VisualBounds.W) >= elementRight || barBoundings.VisualBounds.X < scrollElement.ScrollLeft)
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
                if (!_selecting) return;
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
                if (!_selecting) return;
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

        private void CursorSelectRange(SelectionInfo startBeat, SelectionInfo endBeat)
        {
            var cache = _cursorCache;
            if (cache == null) return;

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
                endX = endBeat.Bounds.BarBounds.MasterBarBounds.RealBounds.X + endBeat.Bounds.BarBounds.MasterBarBounds.RealBounds.W;
            }

            // if the selection goes across multiple staves, we need a special selection highlighting
            if (startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds != endBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds)
            {
                // from the startbeat to the end of the staff, 
                // then fill all staffs until the end-beat staff
                // then from staff-start to the end beat (or to end of bar if it's the last beat)

                var staffStartX = startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.X;
                var staffEndX = startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.X + startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.W;

                var startSelection = UiFacade.CreateSelectionElement();
                startSelection.Top = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.Y;
                startSelection.Left = startX;
                startSelection.Width = (staffEndX - startX);
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
                    middleSelection.Width = (staffEndX - staffStartX);
                    middleSelection.Height = staffBounds.VisualBounds.H;
                    selectionWrapper.AppendChild(middleSelection);
                }

                var endSelection = UiFacade.CreateSelectionElement();
                endSelection.Top = endBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.Y;
                endSelection.Left = staffStartX;
                endSelection.Width = (endX - staffStartX);
                endSelection.Height = endBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.H;
                selectionWrapper.AppendChild(endSelection);
            }
            else
            {
                // if the beats are on the same staff, we simply highlight from the startbeat to endbeat
                var selection = UiFacade.CreateSelectionElement();
                selection.Top = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.Y;
                selection.Left = startX;
                selection.Width = (endX - startX);
                selection.Height = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.H;
                selectionWrapper.AppendChild(selection);
            }
        }

        #endregion

        #region Events

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

        public event Action<RenderFinishedEventArgs> RenderFinished;
        private void OnRenderFinished(RenderFinishedEventArgs e)
        {
            var handler = RenderFinished;
            if (handler != null)
            {
                handler(e);
            }
            UiFacade.TriggerEvent(Container, "rendered");
        }

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

        public void OnError(string type, Exception details)
        {
            Logger.Error(type, "An unexpected error occurred", details);
            UiFacade.TriggerEvent(Container, "error", new
            {
                type = type,
                details = details
            });
        }

        #endregion
    }

    class SelectionInfo
    {
        public Beat Beat { get; set; }
        public BeatBounds Bounds { get; set; }

        public SelectionInfo(Beat beat)
        {
            Beat = beat;
        }
    }
}