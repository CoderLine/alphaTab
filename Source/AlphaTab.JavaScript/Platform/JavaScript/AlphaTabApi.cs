/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using System;
using AlphaTab.Audio;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Synthesis;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Collections;
using AlphaTab.Haxe;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Utils;
using AlphaTab.Util;
using Haxe;
using Haxe.Js.Html;
using Phase;

namespace AlphaTab.Platform.JavaScript
{
    public class ResizeEventArgs
    {
        public int OldWidth { get; set; }
        public int NewWidth { get; set; }
        public Settings Settings { get; set; }
    }

    public class AlphaTabApi
    {
        private readonly Element _canvasElement;
        private int _visibilityCheckerInterval;
        private int _visibilityCheckerIntervalId;

        private FastList<RenderFinishedEventArgs> _renderResults;
        private int _totalResultCount;

        protected bool IsElementVisible
        {
            get { return Element.OffsetWidth.IsTruthy() || Element.OffsetHeight.IsTruthy() || Element.GetClientRects().Length.IsTruthy(); }
        }

        public Settings Settings { get; private set; }
        public IScoreRenderer Renderer { get; private set; }
        public Score Score { get; set; }
        public int[] TrackIndexes { get; set; }
        public Element Element { get; set; }
        public Track[] Tracks
        {
            get
            {
                var tracks = TrackIndexesToTracks(TrackIndexes);

                if (tracks.Count == 0 && Score.Tracks.Count > 0)
                {
                    tracks.Add(Score.Tracks[0]);
                }

                return tracks.ToArray();
            }
        }

        public AlphaTabApi(Element element, dynamic options)
        {
            Element = element;

            Element.ClassList.Add("alphaTab");

            // load settings
            var dataAttributes = GetDataAttributes();
            var settings = Settings = AlphaTab.Settings.FromJson(options, dataAttributes);
            var autoSize = settings.Width < 0;

            Logger.LogLevel = settings.LogLevel;

            #region build tracks array

            // get track data to parse
            dynamic tracksData;
            if (options != null && options.tracks)
            {
                tracksData = options.tracks;
            }
            else
            {
                if (dataAttributes.ContainsKey("tracks"))
                {
                    tracksData = dataAttributes["tracks"];
                }
                else
                {
                    tracksData = 0;
                }
            }

            SetTracks(tracksData, false);

            #endregion

            string contents = "";
            if (element != null)
            {
                // get load contents

                if (dataAttributes.ContainsKey("tex") && element.InnerText.IsTruthy())
                {
                    contents = element.InnerHTML;
                    element.InnerHTML = "";
                    contents = contents.Trim();
                }

                #region Create context elements (wrapper, canvas etc)

                _canvasElement = Browser.Document.CreateElement("div");

                _canvasElement.ClassName = "alphaTabSurface";
                _canvasElement.Style.FontSize = "0";
                _canvasElement.Style.Overflow = "hidden";
                _canvasElement.Style.LineHeight = "0";
                element.AppendChild(_canvasElement);

                #endregion

                #region Setup scroll and resize handlers for lazy-loading

                if (settings.Engine == "default" || settings.Engine == "svg")
                {
                    Browser.Window.AddEventListener("scroll", (Action)(() =>
                    {
                        ShowSvgsInViewPort();
                    }), true);
                    Browser.Window.AddEventListener("resize", (Action)(() =>
                    {
                        ShowSvgsInViewPort();
                    }), true);
                }

                #endregion

                #region Auto Sizing

                if (autoSize)
                {
                    settings.Width = element.OffsetWidth;
                    int timeoutId = 0;
                    Browser.Window.AddEventListener("resize", (Action)(() =>
                    {
                        Browser.Window.ClearTimeout(timeoutId);
                        timeoutId = Browser.Window.SetTimeout((Action)(() =>
                        {
                            if (element.OffsetWidth != settings.Width)
                            {
                                TriggerResize();
                            }
                        }), 1);
                    }));
                }

                #endregion
            }

            #region Renderer Setup

            CreateStyleElement(settings);

            if (element != null && autoSize)
            {
                var initialResizeEventInfo = new ResizeEventArgs();
                initialResizeEventInfo.OldWidth = 0;
                initialResizeEventInfo.NewWidth = element.OffsetWidth;
                initialResizeEventInfo.Settings = settings;
                TriggerEvent("resize", initialResizeEventInfo);
                settings.Width = initialResizeEventInfo.NewWidth;
            }

            var workersUnsupported = !Browser.Window.Member<bool>("Worker");
            if (settings.UseWebWorker && !workersUnsupported && settings.Engine != "html5")
            {
                Renderer = new AlphaTabWorkerScoreRenderer(this, settings);
            }
            else
            {
                Renderer = new ScoreRenderer(settings);
            }
            Renderer.RenderFinished += o => TriggerEvent("rendered");
            Renderer.PostRenderFinished += () =>
            {
                Element.ClassList.Remove("loading");
                Element.ClassList.Remove("rendering");
                TriggerEvent("postRendered");
            };
            Renderer.PreRender += result =>
            {
                _renderResults = new FastList<RenderFinishedEventArgs>();
                _totalResultCount = 0;
                AppendRenderResult(result);
            };
            Renderer.PartialRenderFinished += AppendRenderResult;
            Renderer.RenderFinished += r =>
            {
                AppendRenderResult(r);
                AppendRenderResult(null); // marks last element
            };
            Renderer.Error += Error;

            #endregion

            if (settings.EnablePlayer)
            {
                SetupPlayer();
            }

            #region Load Default Data

            Action initialRender = () =>
            {
                // rendering was possibly delayed due to invisible element
                // in this case we need the correct width for autosize
                if (autoSize)
                {
                    Settings.Width = Element.OffsetWidth;
                    Renderer.UpdateSettings(settings);
                }

                if (!string.IsNullOrEmpty(contents))
                {
                    Tex(contents);
                }
                else if (options && options.file)
                {
                    Load(options.file);
                }
                else if (dataAttributes.ContainsKey("file"))
                {
                    Load(dataAttributes["file"]);
                }
            };

            _visibilityCheckerInterval = 500;
            if (options && options.visibilityCheckInterval)
            {
                _visibilityCheckerInterval = options.visibilityCheckInterval;
            }
            if (IsElementVisible)
            {
                // element is visible, so we start rendering
                initialRender();
            }
            else
            {
                // if the alphaTab element is not visible, we postpone the rendering
                // we check in a regular interval whether it became available. 
                Logger.Warning("Rendering", "AlphaTab container is invisible, checking for element visibility in " + _visibilityCheckerInterval + "ms intervals");
                _visibilityCheckerIntervalId = Browser.Window.SetInterval((Action)(() =>
                {
                    if (IsElementVisible)
                    {
                        Logger.Info("Rendering", "AlphaTab container became visible, triggering initial rendering");
                        initialRender();
                        Browser.Window.ClearInterval(_visibilityCheckerIntervalId);
                        _visibilityCheckerIntervalId = 0;
                    }
                }), _visibilityCheckerInterval);
            }

            #endregion
        }

        private FastDictionary<string, object> GetDataAttributes()
        {
            var dataAttributes = new FastDictionary<string, object>();

            if (Element.Dataset.As<bool>())
            {
                foreach (var key in Platform.JsonKeys(Element.Dataset))
                {
                    object value = Element.Dataset.Member<object>(key);
                    try
                    {
                        string stringValue = (string)value;
                        value = Json.Parse(stringValue);
                    }
                    catch
                    {
#pragma warning disable 252,253
                        if (value == "")
#pragma warning restore 252,253
                        {
                            value = null;
                        }
                    }
                    dataAttributes[key] = value;
                }
            }
            else
            {
                for (var i = 0; i < Element.Attributes.Length; i++)
                {
                    var attr = Element.Attributes.Item(i);
                    string nodeName = attr.NodeName;
                    if (nodeName.StartsWith("data-"))
                    {
                        var keyParts = nodeName.Substring(5).Split('-');
                        var key = keyParts[0];
                        for (int j = 1; j < keyParts.Length; j++)
                        {
                            key += keyParts[j].Substring(0, 1).ToUpper() + keyParts[j].Substring(1);
                        }

                        object value = attr.NodeValue;
                        try
                        {
                            value = Json.Parse(value.As<HaxeString>());
                        }
                        catch
                        {
#pragma warning disable 252, 253
                            if (value == "")
#pragma warning restore 252, 253
                            {
                                value = null;
                            }
                        }
                        dataAttributes[key] = value;
                    }
                }
            }

            return dataAttributes;
        }


        private void TriggerResize()
        {
            // if the element is visible, perfect, we do the update
            if (IsElementVisible)
            {
                if (_visibilityCheckerIntervalId != 0)
                {
                    Logger.Info("Rendering", "AlphaTab container became visible again, doing autosizing");
                    Browser.Window.ClearInterval(_visibilityCheckerIntervalId);
                    _visibilityCheckerIntervalId = 0;
                }

                var resizeEventInfo = new ResizeEventArgs();
                resizeEventInfo.OldWidth = Settings.Width;
                resizeEventInfo.NewWidth = Element.OffsetWidth;
                resizeEventInfo.Settings = Settings;
                TriggerEvent("resize", resizeEventInfo);
                Settings.Width = resizeEventInfo.NewWidth;
                Renderer.UpdateSettings(Settings);
                Renderer.Resize(Element.OffsetWidth);
            }
            // if there is no "invisibility timer" we set up one, if there is already a timer scheduled, it will trigger the proper rendering. 
            else if (_visibilityCheckerIntervalId == 0)
            {
                Logger.Warning("Rendering", "AlphaTab container was invisible while autosizing, checking for element visibility in " + _visibilityCheckerInterval + "ms intervals");
                _visibilityCheckerIntervalId = Browser.Window.SetInterval((Action)(TriggerResize), _visibilityCheckerInterval);
            }
        }

        private void ShowSvgsInViewPort()
        {
            var placeholders = _canvasElement.QuerySelectorAll("[data-lazy=true]");
            for (var i = 0; i < placeholders.Length; i++)
            {
                var placeholder = (Element)placeholders.Item(i);
                if (IsElementInViewPort(placeholder))
                {
                    placeholder.OuterHTML = placeholder.Member<HaxeString>("svg");
                }
            }
        }

        private static bool IsElementInViewPort(Element el)
        {
            var rect = el.GetBoundingClientRect();
            return
                (
                    rect.Top + rect.Height >= 0 && rect.Top <= Browser.Window.InnerHeight &&
                    rect.Left + rect.Width >= 0 && rect.Left <= Browser.Window.InnerWidth
                );
        }

        public void Print(string width)
        {
            // prepare a popup window for printing (a4 width, window height, centered)

            var preview = Browser.Window.Open("", "", "width=0,height=0");
            var a4 = preview.Document.CreateElement("div");
            if (!string.IsNullOrEmpty(width))
            {
                a4.Style.Width = width;
            }
            else
            {
                if (Settings.Layout.Mode == "horizontal")
                {
                    a4.Style.Width = "297mm";
                }
                else
                {
                    a4.Style.Width = "210mm";
                }
            }
            preview.Document.Write("<!DOCTYPE html><html></head><body></body></html>");
            preview.Document.Body.AppendChild(a4);

            int dualScreenLeft = Platform.TypeOf(Browser.Window.Member<int>("ScreenLeft")) != "undefined"
                ? Browser.Window.Member<int>("ScreenLeft")
                : (int)Browser.Window.Screen.Left;
            int dualScreenTop = Platform.TypeOf(Browser.Window.Member<int>("ScreenTop")) != "undefined"
                ? Browser.Window.Member<int>("ScreenTop")
                : (int)Browser.Window.Screen.Top;
            int screenWidth = Platform.TypeOf(Browser.Window.InnerWidth) != "undefined"
                ? Browser.Window.InnerWidth
                : Platform.TypeOf(Browser.Document.DocumentElement.ClientWidth) != "undefined"
                    ? Browser.Document.DocumentElement.ClientWidth
                    : Browser.Window.Screen.Width;
            int screenHeight = Platform.TypeOf(Browser.Window.InnerHeight) != "undefined"
                ? Browser.Window.InnerHeight
                : Platform.TypeOf(Browser.Document.DocumentElement.ClientHeight) != "undefined"
                    ? Browser.Document.DocumentElement.ClientHeight
                    : Browser.Window.Screen.Height;

            int w = a4.OffsetWidth + 50;
            var h = (int)Browser.Window.InnerHeight;
            int left = ((screenWidth / 2) - (w / 2)) + dualScreenLeft;
            int top = ((screenHeight / 2) - (h / 2)) + dualScreenTop;
            preview.ResizeTo(w, h);
            preview.MoveTo(left, top);

            preview.Focus();

            // render alphaTab
            var settings = Settings.Defaults;
            settings.ScriptFile = Settings.ScriptFile;
            settings.FontDirectory = Settings.FontDirectory;
            settings.Scale = 0.8f;
            settings.StretchForce = 0.8f;
            settings.DisableLazyLoading = true;
            settings.UseWebWorker = false;

            var alphaTab = new AlphaTabApi(a4, settings);
            alphaTab.Renderer.PostRenderFinished += () =>
            {
                alphaTab._canvasElement.Style.Height = "100%";
                preview.Print();
            };
            alphaTab.SetTracks(Tracks);
        }

        private void AppendRenderResult(RenderFinishedEventArgs result)
        {
            if (result != null)
            {
                _canvasElement.Style.Width = result.TotalWidth + "px";
                _canvasElement.Style.Height = result.TotalHeight + "px";
            }


            if (result == null || result.RenderResult != null)
            {
                // the queue/dequeue like mechanism used here is to maintain the order within the setTimeout. 
                // setTimeout allows to decouple the rendering from the JS processing a bit which makes the overall display faster. 
                _renderResults.Add(result);

                Browser.Window.SetTimeout((Action)(() =>
                {
                    while (_renderResults.Count > 0)
                    {
                        var renderResult = _renderResults[0];
                        _renderResults.RemoveAt(0);

                        // null result indicates that the rendering finished
                        if (renderResult == null)
                        {
                            // so we remove elements that might be from a previous render session
                            while (_canvasElement.ChildElementCount > _totalResultCount)
                            {
                                _canvasElement.RemoveChild(_canvasElement.LastChild);
                            }
                        }
                        // NOTE: here we try to replace existing children 
                        else
                        {
                            var body = renderResult.RenderResult;
                            if (Platform.TypeOf(body) == "string")
                            {
                                Element placeholder;
                                if (_totalResultCount < _canvasElement.ChildElementCount)
                                {
                                    placeholder = (Element)_canvasElement.ChildNodes.Item(_totalResultCount);
                                }
                                else
                                {
                                    placeholder = Browser.Document.CreateElement("div");
                                    _canvasElement.AppendChild(placeholder);
                                }

                                placeholder.Style.Width = renderResult.Width + "px";
                                placeholder.Style.Height = renderResult.Height + "px";
                                placeholder.Style.Display = "inline-block";

                                if (IsElementInViewPort(placeholder) || Settings.DisableLazyLoading)
                                {
                                    string bodyHtml = (string)body;
                                    placeholder.OuterHTML = bodyHtml;
                                }
                                else
                                {

                                    placeholder.Member("svg", body);
                                    placeholder.SetAttribute("data-lazy", "true");
                                }
                            }
                            else
                            {
                                if (_totalResultCount < _canvasElement.ChildElementCount)
                                {
                                    _canvasElement.ReplaceChild(renderResult.RenderResult.As<Node>(), _canvasElement.ChildNodes.Item(_totalResultCount));
                                }
                                else
                                {
                                    _canvasElement.AppendChild(renderResult.RenderResult.As<Node>());
                                }
                            }
                            _totalResultCount++;
                        }
                    }
                }), 1);

            }
        }

        private void CreateStyleElement(Settings settings)
        {
            var elementDocument = Element.OwnerDocument;
            var styleElement = (StyleElement)elementDocument.GetElementById("alphaTabStyle");
            if (styleElement == null)
            {
                string fontDirectory = settings.FontDirectory;
                styleElement = (StyleElement)elementDocument.CreateElement("style");
                styleElement.Id = "alphaTabStyle";
                styleElement.Type = "text/css";
                var css = new StringBuilder();
                css.AppendLine("@font-face {");
                css.AppendLine("    font-family: 'alphaTab';");
                css.AppendLine("     src: url('" + fontDirectory + "Bravura.eot');");
                css.AppendLine("     src: url('" + fontDirectory + "Bravura.eot?#iefix') format('embedded-opentype')");
                css.AppendLine("          , url('" + fontDirectory + "Bravura.woff') format('woff')");
                css.AppendLine("          , url('" + fontDirectory + "Bravura.otf') format('opentype')");
                css.AppendLine("          , url('" + fontDirectory + "Bravura.svg#Bravura') format('svg');");
                css.AppendLine("     font-weight: normal;");
                css.AppendLine("     font-style: normal;");
                css.AppendLine("}");
                css.AppendLine(".alphaTabSurface * {");
                css.AppendLine("    cursor: default;");
                css.AppendLine("}");
                css.AppendLine(".at {");
                css.AppendLine("     font-family: 'alphaTab';");
                css.AppendLine("     speak: none;");
                css.AppendLine("     font-style: normal;");
                css.AppendLine("     font-weight: normal;");
                css.AppendLine("     font-variant: normal;");
                css.AppendLine("     text-transform: none;");
                css.AppendLine("     line-height: 1;");
                css.AppendLine("     line-height: 1;");
                css.AppendLine("     -webkit-font-smoothing: antialiased;");
                css.AppendLine("     -moz-osx-font-smoothing: grayscale;");
                css.AppendLine("     font-size: 34px;");
                css.AppendLine("     overflow: visible !important;");
                css.AppendLine("}");
                styleElement.InnerHTML = css.ToString();
                elementDocument.GetElementsByTagName("head").Item(0).AppendChild(styleElement);
                Environment.CheckForFontAvailability();
            }
        }


        public virtual void Destroy()
        {
            Element.InnerHTML = "";
            Renderer.Destroy();
        }

        public void Load(object data)
        {
            Element.ClassList.Add("loading");
            try
            {
                if (Platform.InstanceOf<ArrayBuffer>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes(Platform.ArrayBufferToByteArray((ArrayBuffer)data), Settings));
                }
                else if (Platform.InstanceOf<Uint8Array>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes((byte[])data, Settings));
                }
                else if (Platform.TypeOf(data) == "string")
                {
                    ScoreLoader.LoadScoreAsync((string)data, s => ScoreLoaded(s), e =>
                    {
                        Error("import", e);
                    }, Settings);
                }
            }
            catch (Exception e)
            {
                Error("import", e);
            }
        }


        public void Tex(string contents)
        {
            Element.ClassList.Add("loading");
            try
            {
                var parser = new AlphaTexImporter();
                var data = ByteBuffer.FromBuffer(Platform.StringToByteArray(contents));
                parser.Init(data, Settings);
                ScoreLoaded(parser.ReadScore());
            }
            catch (Exception e)
            {
                Error("import", e);
            }
        }

        public void SetTracks(dynamic tracksData, bool render = true)
        {
            if (tracksData.length && Platform.TypeOf(tracksData[0].Index) == "number")
            {
                Score = tracksData[0].Score;
            }
            else if (Platform.TypeOf(tracksData.Index) == "number")
            {
                Score = tracksData.Score;
            }

            TrackIndexes = ParseTracks(tracksData);

            if (render)
            {
                Render();
            }
        }

        public FastList<Track> TrackIndexesToTracks(int[] trackIndexes)
        {
            var tracks = new FastList<Track>();

            foreach (var track in trackIndexes)
            {
                if (track >= 0 && track < Score.Tracks.Count)
                {
                    tracks.Add(Score.Tracks[track]);
                }
            }

            return tracks;
        }

        public int[] ParseTracks(dynamic tracksData)
        {
            FastList<int> tracks = new FastList<int>();

            // decode string
            if (Platform.TypeOf(tracksData) == "string")
            {
                try
                {
                    tracksData = Json.Parse(tracksData.As<string>());
                }
                catch
                {
                    tracksData = new[] { 0 };
                }
            }

            // decode array
            if (Platform.TypeOf(tracksData) == "number")
            {
                tracks.Add((int)tracksData);
            }
            else if (tracksData.length)
            {
                for (var i = 0; i < tracksData.length; i++)
                {
                    int value;
                    if (Platform.TypeOf(tracksData[i]) == "number")
                    {
                        value = (int)tracksData[i];
                    }
                    else if (Platform.TypeOf(tracksData[i].Index) == "number")
                    {
                        Track track = tracksData[i];
                        value = track.Index;
                    }
                    else
                    {
                        value = Platform.ParseInt(tracksData[i].ToString());
                    }

                    if (value >= 0)
                    {
                        tracks.Add(value);
                    }
                }
            }
            else if (Platform.TypeOf(tracksData.Index) == "number")
            {
                tracks.Add(tracksData.Index.As<int>());
            }

            return tracks.ToArray();
        }

        public void ScoreLoaded(Score score, bool render = true)
        {
            ModelUtils.ApplyPitchOffsets(Settings, score);

            Score = score;
            LoadMidiForScore();

            TriggerEvent("loaded", score);
            if (render)
            {
                Render();
            }
        }


        public void Error(string type, Exception details)
        {
            Logger.Error(type, "An unexpected error occurred", details);
            TriggerEvent("error", new
            {
                type = type,
                details = details
            });
        }

        public void TriggerEvent(string name, object details = null)
        {
            if (Element != null)
            {
                name = "alphaTab." + name;
                dynamic e = Browser.Document.CreateEvent("CustomEvent");
                e.initCustomEvent(name, false, false, details);
                Element.DispatchEvent(e);

                if (Platform.JsonExists(Browser.Window, "jQuery"))
                {
                    dynamic jquery = Browser.Window.Member<dynamic>("jQuery");
                    jquery(Element).trigger(name, details);
                }
            }
        }

        public void Render()
        {
            if (Renderer == null) return;
            Action renderAction = null;
            renderAction = () =>
            {
                // if font is not yet loaded, try again in 1 sec
                if (!Environment.IsFontLoaded && Settings.Engine == "html5")
                {
                    // TODO: trigger event in environment. 
                    Browser.Window.SetTimeout((Action)(() =>
                    {
                        renderAction();
                    }), 500);
                }
                else
                {
                    // when font is finally loaded, start rendering
                    Renderer.Render(Score, TrackIndexes);
                }
            };
            renderAction();
        }

        public void UpdateLayout(object json)
        {
            Settings.Layout = Settings.LayoutFromJson(json);
            Renderer.UpdateSettings(Settings);
            Renderer.Invalidate();
        }

        #region Player

        private AlphaSynthWebWorkerApi _player;

        public IAlphaSynth Player { get; set; }
        private MidiTickLookup _tickCache;
        private Element _cursorWrapper;
        private Element _beatCursor;
        private Element _barCursor;
        private Element _selectionWrapper;
        private int _previousTick;
        private BoundsLookup _previousCursorCache;
        private BoundsLookup _cursorCache;
        private PlayerState _playerState;
        private SelectionInfo _selectionStart;
        private SelectionInfo _selectionEnd;
        private bool _selecting;
        private Beat _currentBeat;
        private PlayerState _previousStateForCursor;
        private int _lastScroll;

        /// <summary>
        /// This method initilaizes the player. It detects browser compatibility and
        /// initializes a alphaSynth version for the client. 
        /// 
        /// Compatibility:
        ///   If a browser supports WebWorkers, we will use WebWorkers for Synthesizing the samples and a Flash player for playback
        ///   If the browser does not support WebWorkers we'll use a pure Flash fallback which requires Flash 11.4
        /// 
        /// - IE6-9   - Unsupported
        /// - IE10-11 - Flash is used for playback, Synthesizing is done in a WebWorker
        /// - Firefox - Web Audio API is used for playback, Synthesizing is done in a WebWorker 
        /// - Chrome  - Web Audio API is used for playback, Synthesizing is done in a WebWorker 
        /// - Safari  - Web Audio API is used for playback, Synthesizing is done in a WebWorker 
        /// - Opera   - Web Audio API is used for playback, Synthesizing is done in a WebWorker
        /// </summary>
        private void SetupPlayer()
        {
            var supportsWebAudio = Platform.SupportsWebAudio;
            var supportsWebWorkers = Platform.SupportsWebWorkers;
            var forceFlash = Platform.ForceFlash;
            var alphaSynthScriptFile = Environment.ScriptFile;

            if (supportsWebAudio && !forceFlash)
            {
                Logger.Info("Player", "Will use webworkers for synthesizing and web audio api for playback");
                _player = new AlphaSynthWebWorkerApi(new AlphaSynthWebAudioOutput(), alphaSynthScriptFile, Settings.LogLevel);
            }
            else if (supportsWebWorkers)
            {
                Logger.Info("Player", "Will use webworkers for synthesizing and flash for playback");
                _player = new AlphaSynthWebWorkerApi(new AlphaSynthFlashOutput(alphaSynthScriptFile), alphaSynthScriptFile, Settings.LogLevel);
            }

            Player = _player;

            if (_player == null)
            {
                Logger.Error("Player", "Player requires webworkers and web audio api or flash, browser unsupported");
            }
            else
            {
                _player.On("ready", (Action)(() =>
                {
                    LoadSoundFont(Settings.SoundFontFile);
                    LoadMidiForScore();
                }));
                _player.On("readyForPlayback", (Action)(() =>
                {
                    TriggerEvent("playerReady");
                }));
                _player.On("soundFontLoad", (Action<object>)(data =>
                {
                    TriggerEvent("soundFontLoad", data);
                }));
                _player.On("soundFontLoaded", (Action)(() =>
                {
                    TriggerEvent("soundFontLoaded");
                }));
                _player.On("soundFontLoadFailed", (Action)(() =>
                {
                    TriggerEvent("soundFontLoadFailed");
                }));

                _player.On("midiLoad", (Action<object>)(data =>
                {
                    TriggerEvent("midiLoad", data);
                }));
                _player.On("midiFileLoaded", (Action)(() =>
                {
                    TriggerEvent("midiFileLoaded");
                }));
                _player.On("midiFileLoadFailed", (Action)(() =>
                {
                    TriggerEvent("midiFileLoadFailed");
                }));
                _player.On("playerStateChanged", (Action<object>)(data =>
                {
                    TriggerEvent("playerStateChanged", data);
                }));
                _player.On("positionChanged", (Action<object>)(data =>
                {
                    TriggerEvent("positionChanged", data);
                }));
                _player.On("finished", (Action<object>)(data =>
                {
                    TriggerEvent("finished", data);
                }));

                if (Settings.EnableCursor)
                {
                    SetupCursor();
                }
            }
        }


        private void LoadMidiForScore()
        {
            if (Player == null || Score == null || !_player.IsReady)
            {
                return;
            }

            Logger.Info("AlphaTab", "Generating Midi");
            var midiFile = new MidiFile();
            var handler = new AlphaSynthMidiFileHandler(midiFile);
            var generator = new MidiFileGenerator(Score, Settings, handler);
            generator.Generate();
            _tickCache = generator.TickLookup;
            _player.LoadMidiFile(midiFile);
        }

        public void DownloadMidi()
        {
            var midiFile = new MidiFile();
            var handler = new AlphaSynthMidiFileHandler(midiFile);
            var generator = new MidiFileGenerator(Score, Settings, handler);
            generator.Generate();

            var binary = midiFile.ToBinary();
            Uint8Array uint8Array = Script.Write<Uint8Array>("binary.toUint8Array()");
            var fileName = string.IsNullOrEmpty(Score.Title) ? "File.mid" : Score.Title + ".mid";
            var dlLink = (AnchorElement)Browser.Document.CreateElement("a");
            dlLink.Download = fileName;

            var blob = new Blob(new[] { uint8Array }, new
            {
                type = "audio/midi"
            });
            var url = URL.CreateObjectURL(blob);
            dlLink.Href = url;
            dlLink.Style.Display = "none";
            Browser.Document.Body.AppendChild(dlLink);
            dlLink.Click();
            Browser.Document.Body.RemoveChild(dlLink);
        }

        public void SetTrackVolume(object tracks, float volume)
        {
            if (Player == null)
            {
                return;
            }

            var trackList = TrackIndexesToTracks(ParseTracks(tracks));
            foreach (var track in trackList)
            {
                Player.SetChannelVolume(track.PlaybackInfo.PrimaryChannel, volume);
                Player.SetChannelVolume(track.PlaybackInfo.SecondaryChannel, volume);
            }
        }

        public void SetTrackSolo(object tracks, bool solo)
        {
            if (Player == null)
            {
                return;
            }

            var trackList = TrackIndexesToTracks(ParseTracks(tracks));
            foreach (var track in trackList)
            {
                Player.SetChannelSolo(track.PlaybackInfo.PrimaryChannel, solo);
                Player.SetChannelSolo(track.PlaybackInfo.SecondaryChannel, solo);
            }
        }


        public void SetTrackMute(object tracks, bool mute)
        {
            if (Player == null)
            {
                return;
            }

            var trackList = TrackIndexesToTracks(ParseTracks(tracks));
            foreach (var track in trackList)
            {
                Player.SetChannelMute(track.PlaybackInfo.PrimaryChannel, mute);
                Player.SetChannelMute(track.PlaybackInfo.SecondaryChannel, mute);
            }
        }

        public void LoadSoundFont(object value)
        {
            if (Player == null)
            {
                return;
            }

            if (Platform.TypeOf(value) == "string")
            {
                _player.LoadSoundFontFromUrl((string)value);
            }
            else
            {
                _player.LoadSoundFont((byte[])value);
            }
        }

        public void Play()
        {
            if (Player == null)
            {
                return;
            }
            _player.Play();
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

        private void SetupCursor()
        {
            //
            // Create cursors

            var cursorWrapper = Browser.Document.CreateElement("div");
            cursorWrapper.ClassList.Add("cursors");

            var selectionWrapper = Browser.Document.CreateElement("div");
            selectionWrapper.ClassList.Add("selectionWrapper");

            var barCursor = Browser.Document.CreateElement("div");
            barCursor.ClassList.Add("barCursor");

            var beatCursor = Browser.Document.CreateElement("div");
            beatCursor.ClassList.Add("beatCursor");

            var surface = Element.QuerySelector(".alphaTabSurface");

            // required css styles 
            Element.Style.Position = "relative";
            Element.Style.TextAlign = "left";

            cursorWrapper.Style.Position = "absolute";
            cursorWrapper.Style.ZIndex = "1000";
            cursorWrapper.Style.Display = "inline";
            Script.Write("untyped __js__(\"{0}.pointerEvents = 'none'\", cursorWrapper.style);");

            selectionWrapper.Style.Position = "absolute";
            barCursor.Style.Position = "absolute";
            beatCursor.Style.Position = "absolute";
            beatCursor.Style.Transition = "all 0s linear";

            // store options and created elements for fast access
            _cursorWrapper = cursorWrapper;
            _barCursor = barCursor;
            _beatCursor = beatCursor;
            _selectionWrapper = selectionWrapper;

            // add cursors to UI
            Element.InsertBefore(cursorWrapper, Element.FirstChild);
            cursorWrapper.AppendChild(selectionWrapper);
            cursorWrapper.AppendChild(barCursor);
            cursorWrapper.AppendChild(beatCursor);

            //
            // Hook into events
            _previousTick = 0;
            _playerState = PlayerState.Paused;
            // we need to update our position caches if we render a tablature
            Renderer.PostRenderFinished += () =>
            {
                _cursorCache = Renderer.BoundsLookup;
                CursorUpdateTick(_previousTick);

                var surfaceSite = surface.GetBoundingClientRect();
                cursorWrapper.Style.Width = surfaceSite.Width + "px";
                cursorWrapper.Style.Height = surfaceSite.Height + "px";
            };

            _player.On("positionChanged", (Action<PositionChangedEventArgs>)(data =>
           {
               _previousTick = data.CurrentTick;
               Browser.Window.SetTimeout((Action)(() =>
              {
                  CursorUpdateTick(data.CurrentTick);
              }), 0); // enqueue cursor update for later to return ExternalInterface call in case of Flash
           }));


            _player.On("playerStateChanged", (Action<PlayerStateChangedEventArgs>)(data =>
            {
                _playerState = data.State;
                Browser.Window.SetTimeout((Action)(() =>
                {
                    CursorUpdateTick(_previousTick);
                }), 0); // enqueue cursor update for later to return ExternalInterface call in case of Flash
            }));

            if (Settings.EnableSeekByClick)
            {
                SetupClickHandling();
            }
        }

        private void SetupClickHandling()
        {
            _canvasElement.AddEventListener("mousedown", (Action<MouseEvent>)(e =>
            {
                if (e.Button != 0)
                {
                    return;
                }
                e.PreventDefault();

                // https://github.com/nefe/You-Dont-Need-jQuery#2.3
                var parentOffset = GetOffset(_canvasElement);

                var relX = e.PageX - parentOffset.X;
                var relY = e.PageY - parentOffset.Y;
                var beat = _cursorCache.GetBeatAtPos(relX, relY);
                if (beat != null)
                {
                    _selectionStart = new SelectionInfo(beat);
                    _selectionEnd = null;
                    _selecting = true;
                }
            }));

            _canvasElement.AddEventListener("mousemove", (Action<MouseEvent>)(e =>
            {
                if (!_selecting) return;
                var parentOffset = GetOffset(_canvasElement);
                var relX = e.PageX - parentOffset.X;
                var relY = e.PageY - parentOffset.Y;
                var beat = _cursorCache.GetBeatAtPos(relX, relY);
                if (beat != null && (_selectionEnd == null || _selectionEnd.Beat != beat))
                {
                    _selectionEnd = new SelectionInfo(beat);
                    CursorSelectRange(_selectionStart, _selectionEnd);
                }
            }));

            _canvasElement.AddEventListener("mouseup", (Action<MouseEvent>)(e =>
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
            }));

            Renderer.PostRenderFinished += () =>
            {
                if (_selectionStart != null)
                {
                    CursorSelectRange(_selectionStart, _selectionEnd);
                }
            };
        }

        private Bounds GetOffset(Element element)
        {
            var bounds = element.GetBoundingClientRect();
            float top = bounds.Top + element.OwnerDocument.DefaultView.PageYOffset;
            float left = bounds.Left + element.OwnerDocument.DefaultView.PageXOffset;
            return new Bounds
            {
                X = left,
                Y = top,
                W = bounds.Width,
                H = bounds.Height
            };
        }

        /// <summary>
        /// updates the cursors to highlight the beat at the specified tick position
        /// </summary>
        /// <param name="tick"></param>
        /// <param name="stop"></param>
        private void CursorUpdateTick(int tick, bool stop = false)
        {
            Browser.Window.RequestAnimationFrame(f =>
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
            barCursor.Style.Top = barBounds.Y + "px";
            barCursor.Style.Left = barBounds.X + "px";
            barCursor.Style.Width = barBounds.W + "px";
            barCursor.Style.Height = barBounds.H + "px";

            // move beat to start position immediately
            beatCursor.Style.Transition = "none";
            beatCursor.Style.Top = barBounds.Y + "px";
            beatCursor.Style.Left = beatBoundings.VisualBounds.X + "px";
            beatCursor.Style.Width = Settings.BeatCursorWidth + "px";
            beatCursor.Style.Height = barBounds.H + "px";

            // if playing, animate the cursor to the next beat
            var elements = Element.GetElementsByClassName("atHighlight");
            while (elements.Length > 0)
            {
                elements.Item(0).ClassList.Remove("atHighlight");
            }

            if (_playerState == PlayerState.Playing || stop)
            {
                duration /= Player.PlaybackSpeed;

                if (!stop)
                {
                    var className = BeatContainerGlyph.GetGroupId(beat);
                    var elementsToHighlight = Element.GetElementsByClassName(className);
                    for (int i = 0; i < elementsToHighlight.Length; i++)
                    {
                        elementsToHighlight.Item(i).ClassList.Add("atHighlight");
                    }

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

                    Browser.Window.RequestAnimationFrame(f =>
                    {
                        //Logger.Info("Player",
                        //    "Transition from " + beatBoundings.VisualBounds.X + " to " + nextBeatX + " in " + duration +
                        //    "(" + Player.PlaybackRange + ")");
                        beatCursor.Style.Transition = "all 0s linear";
                        beatCursor.Style.TransitionDuration = duration + "ms";
                        beatCursor.Style.Left = nextBeatX + "px";
                    });
                }

                if (!_selecting)
                {
                    // calculate position of whole music wheet within the scroll parent
                    var scrollElement = Browser.Document.QuerySelector(Settings.ScrollElement);

                    var elementOffset = GetOffset(Element);
                    var nodeName = scrollElement.NodeName.ToLowerCase();
                    if (nodeName != "html" && nodeName != "body")
                    {
                        var scrollElementOffset = GetOffset(scrollElement);
                        elementOffset.Y = elementOffset.Y + scrollElement.ScrollTop - scrollElementOffset.Y;
                        elementOffset.X = elementOffset.X + scrollElement.ScrollLeft - scrollElementOffset.X;
                    }
                    else
                    {
                        scrollElement = Browser.Document.DocumentElement;
                    }

                    if (Settings.ScrollMode == "vertical")
                    {
                        var scrollTop = (int)(elementOffset.Y + barBoundings.RealBounds.Y + Settings.ScrollOffsetY);
                        if (scrollTop != _lastScroll)
                        {
                            _lastScroll = scrollTop;
                            ScrollToY(scrollElement, scrollTop, Settings.ScrollSpeed);
                        }
                    }
                    else if (Settings.ScrollMode == "horizontal-bar")
                    {
                        var x = (int)barBoundings.VisualBounds.X;
                        if (x != _lastScroll)
                        {
                            var scrollLeft = (int)(barBoundings.RealBounds.X + Settings.ScrollOffsetX);
                            _lastScroll = (int)barBoundings.VisualBounds.X;
                            ScrollToX(scrollElement, scrollLeft, Settings.ScrollSpeed);
                        }
                    }
                    else if (Settings.ScrollMode == "horizontal-offscreen")
                    {
                        var elementRight = scrollElement.ScrollLeft + GetOffset(scrollElement).W;
                        if ((barBoundings.VisualBounds.X + barBoundings.VisualBounds.W) >= elementRight || barBoundings.VisualBounds.X < scrollElement.ScrollLeft)
                        {
                            var scrollLeft = barBoundings.RealBounds.X + Settings.ScrollOffsetX;
                            _lastScroll = (int)barBoundings.VisualBounds.X;
                            ScrollToX(scrollElement, (int)scrollLeft, Settings.ScrollSpeed);
                        }
                    }
                }

                // trigger an event for others to indicate which beat/bar is played
                TriggerEvent("playedBeatChanged", beat);
            }
        }

        private void ScrollToY(DOMElement element, int scrollTargetY, double speed)
        {
            var startY = element.ScrollTop;
            var diff = scrollTargetY - startY;
            HaxeFloat start = 0;

            Action<HaxeFloat> step = null;
            step = x =>
            {
                if (start == 0) start = x;

                double time = x - start;
                var percent = Math.Min(time / speed, 1);
                element.ScrollTop = (int)(startY + diff * percent);

                if (time < speed)
                {
                    Browser.Window.RequestAnimationFrame(step);
                }
            };
            Browser.Window.RequestAnimationFrame(step);
        }

        private void ScrollToX(DOMElement element, int scrollTargetX, int speed)
        {
            var startX = element.ScrollLeft;
            var diff = scrollTargetX - startX;
            HaxeFloat start = 0;

            Action<HaxeFloat> step = null;
            step = t =>
            {
                if (start == 0) start = t;

                double time = t - start;
                var percent = Math.Min(time / speed, 1);
                element.ScrollLeft = (int)(startX + diff * percent);

                if (time < speed)
                {
                    Browser.Window.RequestAnimationFrame(step);
                }
            };
            Browser.Window.RequestAnimationFrame(step);
        }

        private void CursorSelectRange(SelectionInfo startBeat, SelectionInfo endBeat)
        {
            var cache = _cursorCache;
            if (cache == null) return;

            var selectionWrapper = _selectionWrapper;
            selectionWrapper.InnerHTML = "";

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

                var startSelection = Browser.Document.CreateElement("div");
                startSelection.Style.Position = "absolute";
                startSelection.Style.Top = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.Y + "px";
                startSelection.Style.Left = startX + "px";
                startSelection.Style.Width = (staffEndX - startX) + "px";
                startSelection.Style.Height = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.H + "px";
                selectionWrapper.AppendChild(startSelection);

                var staffStartIndex = startBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.Index + 1;
                var staffEndIndex = endBeat.Bounds.BarBounds.MasterBarBounds.StaveGroupBounds.Index;
                for (var staffIndex = staffStartIndex; staffIndex < staffEndIndex; staffIndex++)
                {
                    var staffBounds = cache.StaveGroups[staffIndex];

                    var middleSelection = Browser.Document.CreateElement("div");
                    middleSelection.Style.Position = "absolute";
                    middleSelection.Style.Top = staffBounds.VisualBounds.Y + "px";
                    middleSelection.Style.Left = staffStartX + "px";
                    middleSelection.Style.Width = (staffEndX - staffStartX) + "px";
                    middleSelection.Style.Height = staffBounds.VisualBounds.H + "px";
                    selectionWrapper.AppendChild(middleSelection);
                }

                var endSelection = Browser.Document.CreateElement("div");
                endSelection.Style.Position = "absolute";
                endSelection.Style.Top = endBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.Y + "px";
                endSelection.Style.Left = staffStartX + "px";
                endSelection.Style.Width = (endX - staffStartX) + "px";
                endSelection.Style.Height = endBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.H + "px";
                selectionWrapper.AppendChild(endSelection);
            }
            else
            {
                // if the beats are on the same staff, we simply highlight from the startbeat to endbeat
                var selection = Browser.Document.CreateElement("div");
                selection.Style.Position = "absolute";
                selection.Style.Top = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.Y + "px";
                selection.Style.Left = startX + "px";
                selection.Style.Width = (endX - startX) + "px";
                selection.Style.Height = startBeat.Bounds.BarBounds.MasterBarBounds.VisualBounds.H + "px";
                selectionWrapper.AppendChild(selection);
            }
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
