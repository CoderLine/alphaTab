using System;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Util;
using SharpKit.Html;
using SharpKit.JavaScript;
using WorkerContext = SharpKit.Html.workers.WorkerContext;

namespace AlphaTab.Platform.JavaScript
{
    public class JsWorker
    {
        private ScoreRenderer _renderer;
        private WorkerContext _main;

        public JsWorker(SharpKit.Html.workers.WorkerContext main)
        {
            _main = main;
            _main.addEventListener("message", HandleMessage, false);
        }

        static JsWorker()
        {
            if (!HtmlContext.self.document.As<bool>())
            {
                new JsWorker(HtmlContext.self.As<WorkerContext>());
            }
        }


        private void HandleMessage(DOMEvent e)
        {
            var data = e.As<MessageEvent>().data;
            var cmd = data.As<bool>() ? data.Member("cmd").As<string>() : "";
            switch (cmd)
            {
                case "alphaTab.initialize":
                    var settings = Settings.FromJson(data.Member("settings"), null);
                    _renderer = new ScoreRenderer(settings);
                    _renderer.PartialRenderFinished += result => PostMessage(new { cmd = "alphaTab.partialRenderFinished", result = result });
                    _renderer.RenderFinished += result => PostMessage(new { cmd = "alphaTab.renderFinished", result = result });
                    _renderer.PostRenderFinished += () => PostMessage(new { cmd = "alphaTab.postRenderFinished", boundsLookup = _renderer.BoundsLookup.ToJson() });
                    _renderer.PreRender += result => PostMessage(new { cmd = "alphaTab.preRender", result = result });
                    _renderer.Error += Error;
                    break;
                case "alphaTab.invalidate":
                    _renderer.Invalidate();
                    break;
                case "alphaTab.resize":
                    _renderer.Resize(data.Member("width").As<int>());
                    break;
                case "alphaTab.render":
                    var converter = new JsonConverter();
                    var score = converter.JsObjectToScore(data.Member("score").As<Score>());
                    RenderMultiple(score, data.Member("trackIndexes").As<int[]>());
                    break;
                case "alphaTab.updateSettings":
                    UpdateSettings(data.Member("settings"));
                    break;
            }
        }

        private void UpdateSettings(object settings)
        {
            _renderer.UpdateSettings(Settings.FromJson(settings, null));
        }

        private void RenderMultiple(Score score, int[] trackIndexes)
        {
            try
            {
                _renderer.Render(score, trackIndexes);
            }
            catch (Exception e)
            {
                Error("render", e);
            }
        }

        private void Error(string type, Exception e)
        {
            Logger.Error(type, "An unexpected error occurred in worker", e);

            dynamic error = JSON.parse(JSON.stringify(e));
            if (e.Member("message").As<bool>())
            {
                error.message = e.Member("message");
            }
            if (e.Member("stack").As<bool>())
            {
                error.stack = e.Member("stack");
            }
            if (e.Member("constructor").As<bool>() && e.Member("constructor").Member("name").As<bool>())
            {
                error.type = e.Member("constructor").Member("name");
            }
            PostMessage(new { cmd = "alphaTab.error", error = new { type = type, detail = error } });
        }

        [JsMethod(Export = false, InlineCodeExpression = "this._main.postMessage(o)")]
        private void PostMessage(object o)
        {
        }
    }
}