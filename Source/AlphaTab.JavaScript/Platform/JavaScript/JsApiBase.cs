/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering;
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

    public abstract class JsApiBase : HtmlContext
    {
        protected readonly HtmlElement Element;
        protected readonly HtmlElement CanvasElement;
        protected int[] TrackIndexes;
        protected bool AutoSize;

        private FastList<RenderFinishedEventArgs> _renderResults;
        private int _totalResultCount;

        protected JsApiBase(HtmlElement element, dynamic options)
        {
            Element = element;
            dynamic dataset = Element.dataset;

            // load settings
            Settings settings = Settings.FromJson(options);

            #region build tracks array

            // get track data to parse
            dynamic tracksData;
            if (options != null && options.tracks)
            {
                tracksData = options.tracks;
            }
            else if (element != null && element.dataset != null && dataset["tracks"] != null)
            {
                tracksData = dataset["tracks"];
            }
            else
            {
                tracksData = 0;
            }

            SetTracks(tracksData, false);

            #endregion

            string contents = "";
            if (element != null)
            {
                // get load contents

                if (element.dataset != null && dataset["tex"] != null &&
                    element.innerText.As<JsBoolean>())
                {
                    contents = (element.innerHTML.As<string>()).Trim();
                    element.innerHTML = "";
                }

                #region Create context elements (wrapper, canvas etc)

                CanvasElement = (HtmlElement)document.createElement("div");

                CanvasElement.className = "alphaTabSurface";
                CanvasElement.style.fontSize = "0";
                CanvasElement.style.overflow = "hidden";
                element.appendChild(CanvasElement);

                #endregion

                #region Setup scroll and resize handlers for lazy-loading

                if (settings.Engine == "default" || settings.Engine == "svg")
                {
                    window.addEventListener("scroll", e =>
                    {
                        ShowSvgsInViewPort();
                    });
                    window.addEventListener("resize", e =>
                    {
                        ShowSvgsInViewPort();
                    });
                }

                #endregion

                #region Auto Sizing

                AutoSize = settings.Width < 0;
                if (AutoSize)
                {
                    settings.Width = element.offsetWidth;
                    if (options)
                    {
                        options.width = element.offsetWidth;
                    }
                    int timeoutId = 0;
                    window.addEventListener("resize", e =>
                    {
                        clearTimeout(timeoutId);

                        timeoutId = setTimeout(() =>
                        {
                            if (element.offsetWidth != settings.Width)
                            {
                                var resizeEventInfo = new ResizeEventArgs();
                                resizeEventInfo.OldWidth = settings.Width;
                                resizeEventInfo.NewWidth = element.offsetWidth;
                                resizeEventInfo.Settings = settings;
                                TriggerEvent("resize", resizeEventInfo);
                                settings.Width = resizeEventInfo.NewWidth;
                                Renderer.UpdateSettings(settings);
                                Renderer.Resize(element.offsetWidth);
                            }
                        }, 1);
                    });
                }

                #endregion
            }

            #region Renderer Setup

            CreateStyleElement(settings);

            if (element != null && AutoSize)
            {
                var initialResizeEventInfo = new ResizeEventArgs();
                initialResizeEventInfo.OldWidth = 0;
                initialResizeEventInfo.NewWidth = element.offsetWidth;
                initialResizeEventInfo.Settings = settings;
                TriggerEvent("resize", initialResizeEventInfo);
                settings.Width = initialResizeEventInfo.NewWidth;
            }

            Renderer = CreateScoreRenderer(settings);
            Renderer.RenderFinished += o => TriggerEvent("rendered");
            Renderer.PostRenderFinished += () => TriggerEvent("post-rendered");
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

            #endregion

            #region Load Default Data

            if (!string.IsNullOrEmpty(contents))
            {
                Tex(contents);
            }
            else if (options && options.file)
            {
                Load(options.file);
            }
            else if (Element != null && Element.dataset != null && !string.IsNullOrEmpty(dataset["file"]))
            {
                Load(dataset["file"]);
            }
            else if (Element != null && !string.IsNullOrEmpty(Element.getAttribute("data-file")))
            {
                Load(Element.getAttribute("data-file"));
            }


            #endregion
        }

        private void ShowSvgsInViewPort()
        {
            var placeholders = CanvasElement.querySelectorAll("[data-lazy=true]");
            foreach (var x in placeholders)
            {
                var placeholder = x.As<HtmlElement>();
                if (IsElementVisible(placeholder))
                {
                    placeholder.outerHTML = placeholder.As<dynamic>().svg;
                }
            }
        }

        private static bool IsElementVisible(Element el)
        {
            var rect = el.getBoundingClientRect();
            return 
                (
                    rect.top + rect.height >= 0 && rect.top <= window.innerHeight &&
                    rect.left + rect.width >= 0 && rect.left <= window.innerWidth
                );
        }

        private void AppendRenderResult(RenderFinishedEventArgs result)
        {
            if (result != null)
            {
                CanvasElement.style.width = result.TotalWidth + "px";
                CanvasElement.style.height = result.TotalHeight + "px";
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
                            while (CanvasElement.childElementCount > _totalResultCount)
                            {
                                CanvasElement.removeChild(CanvasElement.lastChild);
                            }
                        }
                        // NOTE: here we try to replace existing children 
                        else
                        {
                            var body = renderResult.RenderResult;
                            if (@typeof(body) == "string")
                            {
                                HtmlElement placeholder;
                                if (_totalResultCount < CanvasElement.childElementCount)
                                {
                                    placeholder = CanvasElement.children[_totalResultCount].As<HtmlElement>();
                                }
                                else
                                {
                                    placeholder = document.createElement("div").As<HtmlElement>();
                                    CanvasElement.appendChild(placeholder);
                                }

                                placeholder.style.width = renderResult.Width + "px";
                                placeholder.style.height = renderResult.Height + "px";
                                placeholder.style.display = "inline-block";

                                if (IsElementVisible(placeholder))
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
                                if (_totalResultCount < CanvasElement.childElementCount)
                                {
                                    CanvasElement.replaceChild(renderResult.RenderResult.As<Node>(), CanvasElement.children[_totalResultCount]);
                                }
                                else
                                {
                                    CanvasElement.appendChild(renderResult.RenderResult.As<Node>());
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
            var styleElement = (HtmlStyleElement)document.getElementById("alphaTabStyle");
            if (styleElement == null)
            {
                var fontDirectory = settings.ScriptFile;
                fontDirectory = fontDirectory.Substring(0, fontDirectory.LastIndexOf("/")) + "/Font/";

                styleElement = (HtmlStyleElement)document.createElement("style");
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
                document.getElementsByTagName("head")[0].appendChild(styleElement);
            }
        }

        protected abstract IScoreRenderer CreateScoreRenderer(Settings settings);

        public IScoreRenderer Renderer { get; private set; }
        public Score Score { get; set; }
        public Track[] Tracks
        {
            get
            {
                var tracks = new FastList<Track>();

                foreach (var track in TrackIndexes)
                {
                    if (track >= 0 && track < Score.Tracks.Count)
                    {
                        tracks.Add(Score.Tracks[track]);
                    }
                }

                if (tracks.Count == 0 && Score.Tracks.Count > 0)
                {
                    tracks.Add(Score.Tracks[0]);
                }

                return tracks.ToArray();
            }
        }


        public abstract void Load(object data);

        public abstract void Tex(string contents);

        public void SetTracks(dynamic tracksData, bool render = true)
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
            TrackIndexes = tracks.ToArray();

            if (render)
            {
                Render();
            }
        }

        protected void ScoreLoaded(Score score, bool render = true)
        {
            Score = score;
            TriggerEvent("loaded", score);
            if (render)
            {
                Render();
            }
        }

        public void TriggerEvent(string name, object details = null)
        {
            if (Element != null)
            {
                dynamic e = document.createEvent("CustomEvent");
                e.initCustomEvent(name, false, false, details);
                Element.dispatchEvent(e);
            }
        }

        public abstract void Render();
    }
}
