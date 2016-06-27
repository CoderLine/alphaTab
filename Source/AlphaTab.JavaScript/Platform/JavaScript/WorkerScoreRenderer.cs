using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering;
using SharpKit.Html;
using SharpKit.Html.fileapi;
using SharpKit.Html.workers;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public class WorkerScoreRenderer : HtmlContext, IScoreRenderer
    {
        private readonly JsWorkerApi _workerApi;
        private readonly Worker _worker;

        public bool IsSvg
        {
            get { return true; }
        }

        public WorkerScoreRenderer(JsWorkerApi workerApi, dynamic rawSettings)
        {
            _workerApi = workerApi;

            string alphaTabScriptFile;

            // explicitly specified file/root path
            if (rawSettings.atRoot)
            {
                alphaTabScriptFile = rawSettings.atRoot;
                // append script name 
                if (!alphaTabScriptFile.EndsWith(".js"))
                {
                    if (!alphaTabScriptFile.EndsWith("/"))
                    {
                        alphaTabScriptFile += "/";
                    }
                    alphaTabScriptFile += "AlphaTab.js";
                }
                if (!alphaTabScriptFile.StartsWith("http") && !alphaTabScriptFile.StartsWith("https"))
                {
                    var root = new StringBuilder();
                    root.Append(window.location.protocol);
                    root.Append("//");
                    root.Append(window.location.hostname);
                    if (window.location.port.As<bool>())
                    {
                        root.Append(":");
                        root.Append(window.location.port);
                    }
                    root.Append(alphaTabScriptFile);
                    alphaTabScriptFile = root.ToString();
                }
            }
            // find automatically
            else
            {
                alphaTabScriptFile = Environment.ScriptFile;
            }


            _worker = new Worker(CreateWorkerUrl());
            _worker.postMessage(new { cmd = "initialize", alphaTabScript = alphaTabScriptFile, settings = rawSettings });
            _worker.addEventListener("message", HandleWorkerMessage, false);
        }

        private string CreateWorkerUrl()
        {
            var source = @"self.onmessage = function(e) {
            if(e.data.cmd == 'initialize') {
                importScripts(e.data.alphaTabScript);
                    new AlphaTab.Platform.JavaScript.JsWorker(self, e.data.settings);
                }
            }";

            JsCode("window.URL = window.URL || window.webkitURL;");
            JsCode("window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder  || window.MozBlobBuilder;");

            Blob blob;
            try
            {
                blob = new Blob(new[] { source }, new { type = "application/javascript" });
            }
            catch
            {
                dynamic builder = JsCode("new BlobBuilder()");
                builder.append(source);
                blob = builder.getBlob();
            }

            return JsCode("URL.createObjectURL(blob)").As<string>();
        }

        public void Load(object data, int[] trackIndexes)
        {
            _worker.postMessage(new { cmd = "load", data = data, indexes = trackIndexes });
        }

        private void HandleWorkerMessage(DOMEvent e)
        {
            var data = e.As<MessageEvent>().data;
            var cmd = data.Member("cmd").As<string>();
            switch (cmd)
            {
                case "preRender":
                    OnPreRender();
                    break;
                case "partialRenderFinished":
                    OnPartialRenderFinished(data.Member("result").As<RenderFinishedEventArgs>());
                    break;
                case "renderFinished":
                    OnRenderFinished(data.Member("result").As<RenderFinishedEventArgs>());
                    break;
                case "postRenderFinished":
                    OnPostRenderFinished();
                    break;
                case "error":
                    console.error(data.Member("exception"));
                    break;
                case "loaded":
                    var score = data.Member("score").As<Score>();
                    if (score.As<bool>())
                    {
                        var jsonConverter = new JsonConverter();
                        score = jsonConverter.JsObjectToScore(score);
                    }
                    _workerApi.TriggerEvent("loaded", score);
                    break;
            }
        }

        public void RenderMultiple(int[] trackIndexes)
        {
            _worker.postMessage(new { cmd = "renderMultiple", data = trackIndexes });
        }

        public event Action PreRender;
        protected virtual void OnPreRender()
        {
            Action handler = PreRender;
            if (handler != null) handler();
        }

        public event Action<RenderFinishedEventArgs> PartialRenderFinished;
        protected virtual void OnPartialRenderFinished(RenderFinishedEventArgs obj)
        {
            Action<RenderFinishedEventArgs> handler = PartialRenderFinished;
            if (handler != null) handler(obj);
        }

        public event Action<RenderFinishedEventArgs> RenderFinished;
        protected virtual void OnRenderFinished(RenderFinishedEventArgs obj)
        {
            Action<RenderFinishedEventArgs> handler = RenderFinished;
            if (handler != null) handler(obj);
        }

        public event Action PostRenderFinished;
        protected virtual void OnPostRenderFinished()
        {
            Action handler = PostRenderFinished;
            if (handler != null) handler();
        }

        public void Tex(string contents)
        {
            _worker.postMessage(new { cmd = "tex", data = contents });
        }

    }
}