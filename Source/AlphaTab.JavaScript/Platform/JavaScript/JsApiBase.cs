using System;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public abstract class JsApiBase : HtmlContext
    {
        protected readonly HtmlElement Element;
        protected readonly HtmlElement CanvasElement;
        protected int[] TrackIndexes;

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
                    contents = (element.innerText.As<string>()).Trim();
                    element.innerHTML = "";
                }

                #region Create context elements (wrapper, canvas etc)

                CanvasElement = (HtmlElement)document.createElement("div");

                CanvasElement.className = "alphaTabSurface";
                element.appendChild(CanvasElement);

                #endregion

            }

            #region Renderer Setup

            Renderer = CreateScoreRenderer(settings, options, CanvasElement);
            Renderer.RenderFinished += o => TriggerEvent("rendered");
            Renderer.PostRenderFinished += () => TriggerEvent("post-rendered");
            Renderer.PreRender += () =>
            {
                CanvasElement.innerHTML = "";
            };
            Renderer.PartialRenderFinished += result =>
            {
                Node itemToAppend;
                if (@typeof(result.RenderResult) == "string")
                {
                    var partialResult = (HtmlDivElement) document.createElement("div");
                    partialResult.innerHTML = result.RenderResult.As<string>();
                    itemToAppend = partialResult.firstChild;
                }
                else
                {
                    itemToAppend = (Node) result.RenderResult;
                }

                CanvasElement.style.width = result.TotalWidth + "px";
                CanvasElement.style.height = result.TotalHeight + "px";
                CanvasElement.appendChild(itemToAppend);

            };
            Renderer.RenderFinished += result =>
            {
                CanvasElement.style.width = result.TotalWidth + "px";
                CanvasElement.style.height = result.TotalHeight + "px";
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


            #endregion
        }

        protected abstract IScoreRenderer CreateScoreRenderer(Settings settings, object rawSettings, HtmlElement canvasElement);

        public IScoreRenderer Renderer { get; private set; }
        public Score Score { get; set; }

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

        public void ScoreLoaded(Score score)
        {
            Score = score;
            TriggerEvent("loaded", score);
            Render();
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
