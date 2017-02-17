using System;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using SharpKit.Html;
using SharpKit.JavaScript;
using WorkerContext = SharpKit.Html.workers.WorkerContext;

namespace AlphaTab.Platform.JavaScript
{
    public class JsWorker
    {
        private ScoreRenderer _renderer;
        private WorkerContext _main;
        private int[] _trackIndexes;

        public Score Score { get; set; }

        public Track[] Tracks
        {
            get
            {
                var tracks = new FastList<Track>();

                foreach (var track in _trackIndexes)
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
            var cmd = data.Member("cmd").As<string>();
            switch (cmd)
            {
                case "alphaTab.initialize":
                    var settings = Settings.FromJson(data.Member("settings"));
                    _renderer = new ScoreRenderer(settings);
                    _renderer.PartialRenderFinished += result => PostMessage(new { cmd = "alphaTab.partialRenderFinished", result = result });
                    _renderer.RenderFinished += result => PostMessage(new { cmd = "alphaTab.renderFinished", result = result });
                    _renderer.PostRenderFinished += () => PostMessage(new { cmd = "alphaTab.postRenderFinished", boundsLookup = _renderer.BoundsLookup.ToJson() });
                    _renderer.PreRender += result => PostMessage(new { cmd = "alphaTab.preRender", result = result });
                    break;
                case "alphaTab.load":
                    Load(data.Member("data"), data.Member("indexes").As<int[]>());
                    break;
                case "alphaTab.invalidate":
                    _renderer.Invalidate();
                    break;
                case "alphaTab.resize":
                    _renderer.Resize(data.Member("width").As<int>());
                    break;
                case "alphaTab.tex":
                    Tex(data.Member("data").As<string>());
                    break;
                case "alphaTab.renderMultiple":
                    RenderMultiple(data.Member("data").As<int[]>());
                    break;
                case "alphaTab.updateSettings":
                    UpdateSettings(data.Member("settings"));
                    break;
            }
        }

        private void UpdateSettings(object settings)
        {
            _renderer.UpdateSettings(Settings.FromJson(settings));
        }

        private void RenderMultiple(int[] trackIndexes)
        {
            _trackIndexes = trackIndexes;
            Render();
        }

        private void Tex(string contents)
        {
            try
            {
                var parser = new AlphaTexImporter();
                var data = ByteBuffer.FromBuffer(Std.StringToByteArray(contents));
                parser.Init(data);
                _trackIndexes = new[] { 0 };
                ScoreLoaded(parser.ReadScore());
            }
            catch (Exception e)
            {
                Error(e);
            }
        }

        private void Load(object data, int[] trackIndexes)
        {
            try
            {
                _trackIndexes = trackIndexes;
                if (Std.InstanceOf<ArrayBuffer>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes(Std.ArrayBufferToByteArray((ArrayBuffer)data)));
                }
                else if (Std.InstanceOf<Uint8Array>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes((byte[])data));
                }
                else if (JsContext.JsTypeOf(data) == JsTypes.@string)
                {
                    ScoreLoader.LoadScoreAsync((string)data, ScoreLoaded, Error);
                }
            }
            catch (Exception e)
            {
                Error(e);
            }
        }

        private void Error(Exception e)
        {
            PostMessage(new { cmd = "alphaTab.error", exception = JSON.parse(JSON.stringify(e)) });
        }

        private void ScoreLoaded(Score score)
        {
            Score = score;
            var json = new JsonConverter();
            PostMessage(new { cmd = "alphaTab.loaded", score = json.ScoreToJsObject(score) });
            Render();
        }

        private void Render()
        {
            _renderer.RenderMultiple(Tracks);
        }

        [JsMethod(Export = false, InlineCodeExpression = "this._main.postMessage(o)")]
        private void PostMessage(object o)
        {
        }
    }
}