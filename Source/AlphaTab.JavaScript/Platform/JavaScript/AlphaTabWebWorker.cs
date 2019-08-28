using System;
using AlphaTab.Haxe;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Util;

namespace AlphaTab.Platform.JavaScript
{
    internal class AlphaTabWebWorker
    {
        private ScoreRenderer _renderer;
        private readonly DedicatedWorkerGlobalScope _main;

        public AlphaTabWebWorker(DedicatedWorkerGlobalScope main)
        {
            _main = main;
            _main.AddEventListener("message", (Action<Event>)HandleMessage, false);
        }

        public static void Init()
        {
            new AlphaTabWebWorker(Lib.Global);
        }

        private void HandleMessage(Event e)
        {
            var data = ((MessageEvent)e).Data;
            var cmd = data ? data.cmd : "";
            switch (cmd)
            {
                case "alphaTab.initialize":
                    var settings = new Settings();
                    settings.LoadFromJson(data.settings);
                    Logger.LogLevel = settings.Core.LogLevel;
                    _renderer = new ScoreRenderer(settings);
                    _renderer.PartialRenderFinished += result => _main.PostMessage(new
                    {
                        cmd = "alphaTab.partialRenderFinished",
                        result = result
                    });
                    _renderer.RenderFinished += result => _main.PostMessage(new
                    {
                        cmd = "alphaTab.renderFinished",
                        result = result
                    });
                    _renderer.PostRenderFinished += () => _main.PostMessage(new
                    {
                        cmd = "alphaTab.postRenderFinished",
                        boundsLookup = _renderer.BoundsLookup.ToJson()
                    });
                    _renderer.PreRender += resize => _main.PostMessage(new
                    {
                        cmd = "alphaTab.preRender",
                        resize = resize
                    });
                    _renderer.Error += Error;
                    break;
                case "alphaTab.invalidate":
                    _renderer.Render();
                    break;
                case "alphaTab.resizeRender":
                    _renderer.ResizeRender();
                    break;
                case "alphaTab.setWidth":
                    _renderer.Width = data.width;
                    break;
                case "alphaTab.renderScore":
                    var score = JsonConverter.JsObjectToScore(data.score, _renderer.Settings);
                    RenderMultiple(score, data.trackIndexes);
                    break;
                case "alphaTab.updateSettings":
                    UpdateSettings(data.settings);
                    break;
            }
        }

        private void UpdateSettings(object json)
        {
            var settings = new Settings();
            settings.LoadFromJson(json);
            _renderer.UpdateSettings(settings);
        }

        private void RenderMultiple(Score score, int[] trackIndexes)
        {
            try
            {
                _renderer.RenderScore(score, trackIndexes);
            }
            catch (Exception e)
            {
                Error("render", e);
            }
        }

        private void Error(string type, Exception e)
        {
            Logger.Error(type, "An unexpected error occurred in worker", e);

            var error = Json.Parse(Json.Stringify(e));

            dynamic e2 = e;

            if (e2.message)
            {
                error.message = e2.message;
            }

            if (e2.stack)
            {
                error.stack = e2.stack;
            }

            if (e2.constructor && e2.constructor.name)
            {
                error.type = e2.constructor.name;
            }

            _main.PostMessage(new
            {
                cmd = "alphaTab.error",
                error = new
                {
                    type = type,
                    detail = error
                }
            });
        }
    }
}
