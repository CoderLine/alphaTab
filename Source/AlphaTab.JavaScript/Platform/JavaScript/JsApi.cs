/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Util;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public class ResizeEventArgs
    {
        public int OldWidth { get; set; }
        public int NewWidth { get; set; }
        public Settings Settings { get; set; }
    }

    public class JsApi : HtmlContext
    {
        private readonly HtmlElement _element;
        private readonly HtmlElement _canvasElement;
        private readonly Settings _settings;
        private int _visibilityCheckerInterval;
        private int _visibilityCheckerIntervalId;

        private FastList<RenderFinishedEventArgs> _renderResults;
        private int _totalResultCount;

        protected bool IsElementVisible
        {
            get { return !!(_element.offsetWidth.As<bool>() || _element.offsetHeight.As<bool>() || _element.getClientRects().length.As<bool>()); }
        }

        public IScoreRenderer Renderer { get; private set; }
        public Score Score { get; set; }
        public int[] TrackIndexes { get; set; }
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

        protected JsApi(HtmlElement element, dynamic options)
        {
            _element = element;

            _element.classList.add("alphaTab");

            // load settings
            var dataAttributes = GetDataAttributes();
            var settings = _settings = Settings.FromJson(options, dataAttributes);
            var autoSize = settings.Width < 0;

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

                if (dataAttributes.ContainsKey("tex") && element.innerText.As<JsBoolean>())
                {
                    contents = (element.innerHTML.As<string>()).Trim();
                    element.innerHTML = "";
                }

                #region Create context elements (wrapper, canvas etc)

                _canvasElement = (HtmlElement)document.createElement("div");

                _canvasElement.className = "alphaTabSurface";
                _canvasElement.style.fontSize = "0";
                _canvasElement.style.overflow = "hidden";
                _canvasElement.style.lineHeight = "0";
                element.appendChild(_canvasElement);

                #endregion

                #region Setup scroll and resize handlers for lazy-loading

                if (settings.Engine == "default" || settings.Engine == "svg")
                {
                    window.addEventListener("scroll", e =>
                    {
                        ShowSvgsInViewPort();
                    }, true);
                    window.addEventListener("resize", e =>
                    {
                        ShowSvgsInViewPort();
                    }, true);
                }

                #endregion

                #region Auto Sizing

                if (autoSize)
                {
                    settings.Width = element.offsetWidth;
                    int timeoutId = 0;
                    window.addEventListener("resize", e =>
                    {
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(() =>
                        {
                            if (element.offsetWidth != settings.Width)
                            {
                                TriggerResize();
                            }
                        }, 1);
                    });
                }

                #endregion
            }

            #region Renderer Setup

            CreateStyleElement(settings);
            
            if (element != null && autoSize)
            {
                var initialResizeEventInfo = new ResizeEventArgs();
                initialResizeEventInfo.OldWidth = 0;
                initialResizeEventInfo.NewWidth = element.offsetWidth;
                initialResizeEventInfo.Settings = settings;
                TriggerEvent("resize", initialResizeEventInfo);
                settings.Width = initialResizeEventInfo.NewWidth;
            }

            var workersUnsupported = !window.Worker.As<bool>();
            if (settings.UseWebWorker && !workersUnsupported && settings.Engine != "html5")
            {
                Renderer = new WorkerScoreRenderer(this, settings);
            }
            else
            {
                Renderer = new ScoreRenderer(settings);
            }
            Renderer.RenderFinished += o => TriggerEvent("rendered");
            Renderer.PostRenderFinished += () =>
            {
                _element.classList.remove("loading");
                _element.classList.remove("rendering");
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

            #region Load Default Data

            Action initialRender = () =>
            {
                // rendering was possibly delayed due to invisible element
                // in this case we need the correct width for autosize
                if (autoSize)
                {
                    _settings.Width = _element.offsetWidth;
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

            _visibilityCheckerInterval = options && options.visibilityCheckInterval || 500;
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
                _visibilityCheckerIntervalId = setInterval(() =>
                {
                    if (IsElementVisible)
                    {
                        Logger.Info("Rendering", "AlphaTab container became visible, triggering initial rendering");
                        initialRender();
                        clearInterval(_visibilityCheckerIntervalId);
                        _visibilityCheckerIntervalId = 0;
                    }
                }, _visibilityCheckerInterval);
            }

            #endregion
        }

        private FastDictionary<string, object> GetDataAttributes()
        {
            var dataAttributes = new FastDictionary<string, object>();

            if (_element.dataset.As<bool>())
            {
                foreach (var key in _element.dataset.As<JsObject>())
                {
                    object value = _element.dataset.Member(key);
                    try
                    {
                        value = JSON.parse(value.As<string>());
                    }
                    catch
                    {
                        if (value == "")
                        {
                            value = null;
                        }
                    }
                    dataAttributes[key] = value;
                }
            }
            else
            {
                for (var i = 0; i < _element.attributes.length; i++)
                {
                    var attr = _element.attributes[i];
                    if (attr.nodeName.As<string>().StartsWith("data-"))
                    {
                        var keyParts = attr.nodeName.substr(5).split("-");
                        var key = keyParts[0];
                        for (int j = 1; j < keyParts.length; j++)
                        {
                            key += keyParts[j].substr(0, 1).toUpperCase() + keyParts[j].substr(1);
                        }

                        object value = attr.nodeValue;
                        try
                        {
                            value = JSON.parse(value.As<string>());
                        }
                        catch
                        {
                            if (value == "")
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
                    clearInterval(_visibilityCheckerIntervalId);
                    _visibilityCheckerIntervalId = 0;
                }

                var resizeEventInfo = new ResizeEventArgs();
                resizeEventInfo.OldWidth = _settings.Width;
                resizeEventInfo.NewWidth = _element.offsetWidth;
                resizeEventInfo.Settings = _settings;
                TriggerEvent("resize", resizeEventInfo);
                _settings.Width = resizeEventInfo.NewWidth;
                Renderer.UpdateSettings(_settings);
                Renderer.Resize(_element.offsetWidth);
            }
            // if there is no "invisibility timer" we set up one, if there is already a timer scheduled, it will trigger the proper rendering. 
            else if (_visibilityCheckerIntervalId == 0)
            {
                Logger.Warning("Rendering", "AlphaTab container was invisible while autosizing, checking for element visibility in " + _visibilityCheckerInterval + "ms intervals");
                _visibilityCheckerIntervalId = setInterval(TriggerResize, _visibilityCheckerInterval);
            }
        }

        private void ShowSvgsInViewPort()
        {
            var placeholders = _canvasElement.querySelectorAll("[data-lazy=true]");
            foreach (var x in placeholders)
            {
                var placeholder = x.As<HtmlElement>();
                if (IsElementInViewPort(placeholder))
                {
                    placeholder.outerHTML = placeholder.As<dynamic>().svg;
                }
            }
        }

        private static bool IsElementInViewPort(Element el)
        {
            var rect = el.getBoundingClientRect();
            return
                (
                    rect.top + rect.height >= 0 && rect.top <= window.innerHeight &&
                    rect.left + rect.width >= 0 && rect.left <= window.innerWidth
                );
        }

        public void Print(string width)
        {
            // prepare a popup window for printing (a4 width, window height, centered)

            var preview = window.open("", "", "width=0,height=0");
            var a4 = (HtmlDivElement)preview.document.createElement("div");
            if (!string.IsNullOrEmpty(width))
            {
                a4.style.width = width;
            }
            else
            {
                a4.style.width = "210mm";
            }
            preview.document.As<HtmlDocument>().write("<!DOCTYPE html><html></head><body></body></html>");
            preview.document.body.appendChild(a4);

            var dualScreenLeft = JsTypeOf(window.screenLeft) != JsTypes.undefined
                ? window.screenLeft
                : screen.Member("left").As<int>();
            var dualScreenTop = JsTypeOf(window.screenTop) != JsTypes.undefined
                ? window.screenTop
                : screen.Member("top").As<int>();
            var screenWidth = JsTypeOf(window.innerWidth) != JsTypes.undefined
                ? window.innerWidth
                : JsTypeOf(document.documentElement.clientWidth) != JsTypes.undefined
                    ? document.documentElement.clientWidth
                    : screen.width;
            var screenHeight = JsTypeOf(window.innerHeight) != JsTypes.undefined
                ? window.innerHeight
                : JsTypeOf(document.documentElement.clientHeight) != JsTypes.undefined
                    ? document.documentElement.clientHeight
                    : screen.height;

            var w = a4.offsetWidth + 50;
            var h = window.innerHeight;
            var left = ((screenWidth / 2) - (w / 2)) + dualScreenLeft;
            var top = ((screenHeight / 2) - (h / 2)) + dualScreenTop;
            preview.resizeTo(w, h);
            preview.moveTo(left, top);

            preview.focus();

            // render alphaTab
            var settings = Settings.Defaults;
            settings.ScriptFile = _settings.ScriptFile;
            settings.FontDirectory = _settings.FontDirectory;
            settings.Scale = 0.8f;
            settings.StretchForce = 0.8f;
            settings.DisableLazyLoading = true;
            settings.UseWebWorker = false;

            var alphaTab = new JsApi(a4, settings);
            alphaTab.Renderer.PostRenderFinished += () =>
            {
                alphaTab._canvasElement.style.height = "100%";
                preview.window.print();
            };
            alphaTab.SetTracks(Tracks);
        }

        private void AppendRenderResult(RenderFinishedEventArgs result)
        {
            if (result != null)
            {
                _canvasElement.style.width = result.TotalWidth + "px";
                _canvasElement.style.height = result.TotalHeight + "px";
            }


            if (result == null || result.RenderResult != null)
            {
                // the queue/dequeue like mechanism used here is to maintain the order within the setTimeout. 
                // setTimeout allows to decouple the rendering from the JS processing a bit which makes the overall display faster. 
                _renderResults.Add(result);

                setTimeout(() =>
                {
                    while (_renderResults.Count > 0)
                    {
                        var renderResult = _renderResults[0];
                        _renderResults.RemoveAt(0);

                        // null result indicates that the rendering finished
                        if (renderResult == null)
                        {
                            // so we remove elements that might be from a previous render session
                            while (_canvasElement.childElementCount > _totalResultCount)
                            {
                                _canvasElement.removeChild(_canvasElement.lastChild);
                            }
                        }
                        // NOTE: here we try to replace existing children 
                        else
                        {
                            var body = renderResult.RenderResult;
                            if (@typeof(body) == "string")
                            {
                                HtmlElement placeholder;
                                if (_totalResultCount < _canvasElement.childElementCount)
                                {
                                    placeholder = _canvasElement.children[_totalResultCount].As<HtmlElement>();
                                }
                                else
                                {
                                    placeholder = document.createElement("div").As<HtmlElement>();
                                    _canvasElement.appendChild(placeholder);
                                }

                                placeholder.style.width = renderResult.Width + "px";
                                placeholder.style.height = renderResult.Height + "px";
                                placeholder.style.display = "inline-block";

                                if (IsElementInViewPort(placeholder) || _settings.DisableLazyLoading)
                                {
                                    placeholder.outerHTML = body.As<string>();
                                }
                                else
                                {
                                    placeholder.As<dynamic>().svg = body;
                                    placeholder.setAttribute("data-lazy", "true");
                                }
                            }
                            else
                            {
                                if (_totalResultCount < _canvasElement.childElementCount)
                                {
                                    _canvasElement.replaceChild(renderResult.RenderResult.As<Node>(), _canvasElement.children[_totalResultCount]);
                                }
                                else
                                {
                                    _canvasElement.appendChild(renderResult.RenderResult.As<Node>());
                                }
                            }
                            _totalResultCount++;
                        }
                    }
                }, 1);

            }
        }

        private void CreateStyleElement(Settings settings)
        {
            var elementDocument = _element.ownerDocument;
            var styleElement = (HtmlStyleElement)elementDocument.getElementById("alphaTabStyle");
            if (styleElement == null)
            {
                string fontDirectory = settings.FontDirectory;
                styleElement = (HtmlStyleElement)elementDocument.createElement("style");
                styleElement.id = "alphaTabStyle";
                styleElement.type = "text/css";
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
                styleElement.innerHTML = css.ToString();
                elementDocument.getElementsByTagName("head")[0].appendChild(styleElement);
            }
        }


        public virtual void Destroy()
        {
            _element.innerHTML = "";
            Renderer.Destroy();
        }

        public void Load(object data)
        {
            _element.classList.add("loading");
            try
            {
                if (Std.InstanceOf<ArrayBuffer>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes(Std.ArrayBufferToByteArray((ArrayBuffer)data)));
                }
                else if (Std.InstanceOf<Uint8Array>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes((byte[])data));
                }
                else if (JsTypeOf(data) == JsTypes.@string)
                {
                    ScoreLoader.LoadScoreAsync((string)data, s => ScoreLoaded(s), e =>
                    {
                        Error("import", e);
                    });
                }
            }
            catch (Exception e)
            {
                Error("import", e);
            }
        }


        public void Tex(string contents)
        {
            _element.classList.add("loading");
            try
            {
                var parser = new AlphaTexImporter();
                var data = ByteBuffer.FromBuffer(Std.StringToByteArray(contents));
                parser.Init(data);
                ScoreLoaded(parser.ReadScore());
            }
            catch (Exception e)
            {
                Error("import", e);
            }
        }

        public void SetTracks(dynamic tracksData, bool render = true)
        {
            if (tracksData.length && JsTypeOf(tracksData[0].Index) == JsTypes.number)
            {
                Score = tracksData[0].Score;
            }
            else if (JsTypeOf(tracksData.Index) == JsTypes.number)
            {
                Score = tracksData.Score;
            }

            TrackIndexes = ParseTracks(tracksData);

            if (render)
            {
                Render();
            }
        }

        private FastList<Track> TrackIndexesToTracks(int[] trackIndexes)
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
            if (JsTypeOf(tracksData) == JsTypes.@string)
            {
                try
                {
                    tracksData = JSON.parse((string)tracksData);
                }
                catch
                {
                    tracksData = new[] { 0 };
                }
            }

            // decode array
            if (JsTypeOf(tracksData) == JsTypes.number)
            {
                tracks.Add((int)tracksData);
            }
            else if (tracksData.length)
            {
                for (var i = 0; i < tracksData.length; i++)
                {
                    int value;
                    if (JsTypeOf(tracksData[i]) == JsTypes.number)
                    {
                        value = (int)tracksData[i];
                    }
                    else if (JsTypeOf(tracksData[i].Index) == JsTypes.number)
                    {
                        Track track = tracksData[i];
                        value = track.Index;
                    }
                    else
                    {
                        value = Std.ParseInt(tracksData[i].ToString());
                    }

                    if (value >= 0)
                    {
                        tracks.Add(value);
                    }
                }
            }
            else if (JsTypeOf(tracksData.Index) == JsTypes.number)
            {
                tracks.Add((int)tracksData.Index);
            }

            return tracks.ToArray();
        }

        protected void ScoreLoaded(Score score, bool render = true)
        {
            ModelUtils.ApplyPitchOffsets(_settings, score);

            Score = score;

            TriggerEvent("loaded", score);
            if (render)
            {
                Render();
            }
        }


        public void Error(string type, object details)
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
            if (_element != null)
            {
                name = "alphaTab." + name;
                dynamic e = document.createEvent("CustomEvent");
                e.initCustomEvent(name, false, false, details);
                _element.dispatchEvent(e);

                if (Std.JsonExists(window, "jQuery"))
                {
                    dynamic jquery = window["jQuery"];
                    jquery(_element).trigger(name, details);
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
                if (!Environment.IsFontLoaded)
                {
                    window.setTimeout(() =>
                    {
                        renderAction();
                    }, 1000);
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
            _settings.Layout = Settings.LayoutFromJson(json);
            Renderer.UpdateSettings(_settings);
            Renderer.Invalidate();
        }
    }
}
