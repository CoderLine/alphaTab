using System;
using System.Configuration;
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
            // first try blob worker
            try
            {
                HaxeString script = "importScripts('" + settings.Core.ScriptFile + "')";
                var blob = new Blob(new[]
                {
                    script
                });
                _worker = new Worker(URL.CreateObjectURL(blob));
            }
            catch (Exception e)
            {
                // fallback to direct worker
                try
                {
                    _worker = new Worker(settings.Core.ScriptFile);
                }
                catch
                {
                    Logger.Error("Rendering", "Failed to create WebWorker: " + e);
                    // TODO: fallback to synchronous mode
                }
            }



            _worker.PostMessage(new
            {
                cmd = "alphaTab.initialize",
                settings = SerializeSettingsForWorker(settings)
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
                settings = SerializeSettingsForWorker(settings)
            });
        }

        private object SerializeSettingsForWorker(Settings settings)
        {
            dynamic json = Settings.ToJson(settings);

            // cut out player settings, they are only needed on UI thread side
            json.player = null;

            return json;
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
                    OnPreRender(data.resize);
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
                fontSizes = FontSizes.FontSizeLookupTables
            });
        }

        public event Action<bool> PreRender;

        protected virtual void OnPreRender(bool resize)
        {
            var handler = PreRender;
            if (handler != null)
            {
                handler(resize);
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
