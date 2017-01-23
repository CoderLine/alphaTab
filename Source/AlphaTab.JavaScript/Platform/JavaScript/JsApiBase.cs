using System;
using AlphaTab.Collections;
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

    public abstract class JsApiBase : HtmlContext
    {
        protected readonly HtmlElement Element;
        protected readonly HtmlElement CanvasElement;
        protected readonly Settings Settings;
        protected int[] TrackIndexes;
        protected bool AutoSize;
        private int _visibilityCheckerInterval;
        private int _visibilityCheckerIntervalId;

        protected bool IsElementVisible
        {
            get { return !!(Element.offsetWidth.As<bool>() || Element.offsetHeight.As<bool>() || Element.getClientRects().length.As<bool>()); }
        }

        protected JsApiBase(HtmlElement element, dynamic options)
        {
            Element = element;
            dynamic dataset = Element.dataset;

            // load settings
            var settings = Settings = Settings.FromJson(options);

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
                CanvasElement.style.lineHeight = "0";
                element.appendChild(CanvasElement);

                #endregion

                #region Auto Sizing

                AutoSize = settings.Width < 0;
                if (AutoSize)
                {
                    settings.Width = element.offsetWidth;
                    int timeoutId = 0;
                    window.addEventListener("resize", e =>
                    {
                        // resize throttle
                        window.clearTimeout(timeoutId);
                        timeoutId = window.setTimeout(() =>
                        {
                            if (element.offsetWidth != settings.Width)
                            {
                                TriggerResize();
                            }
                        }, 100);
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
                CanvasElement.innerHTML = "";
                AppendRenderResult(result);
            };
            Renderer.PartialRenderFinished += AppendRenderResult;
            Renderer.RenderFinished += AppendRenderResult;

            #endregion

            #region Load Default Data

            Action initialRender = () =>
            {
                // rendering was possibly delayed due to invisible element
                // in this case we need the correct width for autosize
                if (AutoSize)
                {
                    Settings.Width = Element.offsetWidth;
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
                else if (Element != null && Element.dataset != null && !string.IsNullOrEmpty(dataset["file"]))
                {
                    Load(dataset["file"]);
                }
                else if (Element != null && !string.IsNullOrEmpty(Element.getAttribute("data-file")))
                {
                    Load(Element.getAttribute("data-file"));
                }
            };

            _visibilityCheckerInterval = options.visibilityCheckInterval || 500;
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
                resizeEventInfo.OldWidth = Settings.Width;
                resizeEventInfo.NewWidth = Element.offsetWidth;
                resizeEventInfo.Settings = Settings;
                TriggerEvent("resize", resizeEventInfo);
                Settings.Width = resizeEventInfo.NewWidth;
                Renderer.UpdateSettings(Settings);
                Renderer.Resize(Element.offsetWidth);
            }
            // if there is no "invisibility timer" we set up one, if there is already a timer scheduled, it will trigger the proper rendering. 
            else if (_visibilityCheckerIntervalId == 0)
            {
                Logger.Warning("Rendering", "AlphaTab container was invisible while autosizing, checking for element visibility in " + _visibilityCheckerInterval + "ms intervals");
                _visibilityCheckerIntervalId = setInterval(TriggerResize, _visibilityCheckerInterval);
            }
        }

        private void AppendRenderResult(RenderFinishedEventArgs result)
        {
            CanvasElement.style.width = result.TotalWidth + "px";
            CanvasElement.style.height = result.TotalHeight + "px";

            if (result.RenderResult != null)
            {
                Node itemToAppend;
                if (@typeof(result.RenderResult) == "string")
                {
                    var partialResult = (HtmlDivElement)document.createElement("div");
                    partialResult.innerHTML = result.RenderResult.As<string>();
                    itemToAppend = partialResult.firstChild;
                }
                else
                {
                    itemToAppend = (Node)result.RenderResult;
                }
                CanvasElement.appendChild(itemToAppend);
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
