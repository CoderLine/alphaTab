using System;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Model;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.Util;
using Haxe;

namespace AlphaTab.Platform.JavaScript
{
    internal class AlphaTabWorkerScoreRenderer<T> : IScoreRenderer
    {
        private readonly AlphaTabApi<T> _api;
        private readonly Worker _worker;
        private int _width;

        public BoundsLookup BoundsLookup { get; private set; }

        public AlphaTabWorkerScoreRenderer(AlphaTabApi<T> api, Settings settings)
        {
            _api = api;
            try
            {
                _worker = new Worker(settings.ScriptFile);
            }
            catch
            {
                // fallback to blob worker
                try
                {
                    HaxeString script = "importScripts('" + settings.ScriptFile + "')";
                    var blob = new Blob(new[]
                    {
                        script
                    });
                    _worker = new Worker(URL.CreateObjectURL(blob));
                }
                catch (Exception e)
                {
                    Logger.Error("Rendering", "Failed to create WebWorker: " + e);
                    // TODO: fallback to synchronous mode
                }
            }

            _worker.PostMessage(new
            {
                cmd = "alphaTab.initialize",
                settings = settings.ToJson()
            });
            _worker.AddEventListener("message", (Action<Event>)(HandleWorkerMessage));
        }

        public void Destroy()
        {
            _worker.Terminate();
        }

        public void UpdateSettings(Settings settings)
        {
            _worker.PostMessage(new
            {
                cmd = "alphaTab.updateSettings",
                settings = settings.ToJson()
            });
        }

        public void Render()
        {
            _worker.PostMessage(new
            {
                cmd = "alphaTab.render"
            });
        }

        public void ResizeRender()
        {
            _worker.PostMessage(new
            {
                cmd = "alphaTab.resizeRender"
            });
        }

        public int Width
        {
            get => _width;
            set
            {
                _width = value;
                _worker.PostMessage(new
                {
                    cmd = "alphaTab.setWidth",
                    width = value
                });
            }
        }

        private void HandleWorkerMessage(Event e)
        {
            var data = ((MessageEvent)e).Data;
            string cmd = data.cmd;
            switch (cmd)
            {
                case "alphaTab.preRender":
                    OnPreRender();
                    break;
                case "alphaTab.partialRenderFinished":
                    OnPartialRenderFinished(data.result);
                    break;
                case "alphaTab.renderFinished":
                    OnRenderFinished(data.result);
                    break;
                case "alphaTab.postRenderFinished":
                    BoundsLookup = Rendering.Utils.BoundsLookup.FromJson(data.boundsLookup, _api.Score);
                    OnPostRenderFinished();
                    break;
                case "alphaTab.error":
                    OnError(data.type, data.detail);
                    break;
            }
        }

        public void RenderScore(Score score, int[] trackIndexes)
        {
            var jsObject = JsonConverter.ScoreToJsObject(score);
            _worker.PostMessage(new
            {
                cmd = "alphaTab.renderScore",
                score = jsObject,
                trackIndexes = trackIndexes,
                fonts = FontSizes.FontSizeLookupTables
            });
        }

        public event Action PreRender;

        protected virtual void OnPreRender()
        {
            var handler = PreRender;
            if (handler != null)
            {
                handler();
            }
        }

        public event Action<RenderFinishedEventArgs> PartialRenderFinished;

        protected virtual void OnPartialRenderFinished(RenderFinishedEventArgs obj)
        {
            var handler = PartialRenderFinished;
            if (handler != null)
            {
                handler(obj);
            }
        }

        public event Action<RenderFinishedEventArgs> RenderFinished;

        protected virtual void OnRenderFinished(RenderFinishedEventArgs obj)
        {
            var handler = RenderFinished;
            if (handler != null)
            {
                handler(obj);
            }
        }

        public event Action<string, Exception> Error;

        protected virtual void OnError(string type, Exception details)
        {
            var handler = Error;
            if (handler != null)
            {
                handler(type, details);
            }
        }

        public event Action PostRenderFinished;

        protected virtual void OnPostRenderFinished()
        {
            var handler = PostRenderFinished;
            if (handler != null)
            {
                handler();
            }
        }
    }
}
