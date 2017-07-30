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

                if (Score != null)
                {
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
                    var settings = Settings.FromJson(data.Member("settings"), null);
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
                case "alphaTab.score":
                    var converter = new JsonConverter();
                    var score = converter.JsObjectToScore(data.Member("score").As<Score>());
                    Score = score;
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
                Error("Import", e);
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
                // Ajax loading of files via string(url) is handled in main thread, not in worker. 
            }
            catch (Exception e)
            {
                Error("Import", e);
            }
        }

        private void Error(string type, Exception e)
        {
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

        private void ScoreLoaded(Score score)
        {
            ModelUtils.ApplyPitchOffsets(_renderer.Settings, score);
            Score = score;
            var json = new JsonConverter();
            PostMessage(new { cmd = "alphaTab.loaded", score = json.ScoreToJsObject(score) });
            Render();
        }

        private void Render()
        {
            try
            {
                _renderer.RenderMultiple(Tracks);
            }
            catch (Exception e)
            {
                Error("render", e);
            }
        }

        [JsMethod(Export = false, InlineCodeExpression = "this._main.postMessage(o)")]
        private void PostMessage(object o)
        {
        }
    }
}