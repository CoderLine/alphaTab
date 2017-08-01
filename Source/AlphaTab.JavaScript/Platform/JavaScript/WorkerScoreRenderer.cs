/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using System;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.Util;
using SharpKit.Html;
using SharpKit.Html.fileapi;
using SharpKit.Html.workers;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public class WorkerScoreRenderer : HtmlContext, IScoreRenderer
    {
        private readonly JsApi _api;
        private readonly Worker _worker;

        public BoundsLookup BoundsLookup { get; private set; }

        public WorkerScoreRenderer(JsApi api, Settings settings)
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
                    var script = "importScripts('" + settings.ScriptFile + "')";
                    var blob = new Blob(new[] { script });
                    _worker = new Worker(window.URL.createObjectURL(blob));
                }
                catch (Exception e)
                {
                    Logger.Error("Rendering", "Failed to create WebWorker: " + e);
                    // TODO: fallback to synchronous mode
                }
            }
            _worker.postMessage(new { cmd = "alphaTab.initialize", settings = settings.ToJson() });
            _worker.addEventListener("message", HandleWorkerMessage, false);
        }

        public void Destroy()
        {
            _worker.terminate();
        }

        public void UpdateSettings(Settings settings)
        {
            _worker.postMessage(new { cmd = "alphaTab.updateSettings", settings = settings.ToJson() });
        }

        public void Invalidate()
        {
            _worker.postMessage(new { cmd = "alphaTab.invalidate" });
        }

        public void Resize(int width)
        {
            _worker.postMessage(new { cmd = "alphaTab.resize", width = width });
        }

        private void HandleWorkerMessage(DOMEvent e)
        {
            var data = e.As<MessageEvent>().data;
            var cmd = data.Member("cmd").As<string>();
            switch (cmd)
            {
                case "alphaTab.preRender":
                    OnPreRender(data.Member("result").As<RenderFinishedEventArgs>());
                    break;
                case "alphaTab.partialRenderFinished":
                    OnPartialRenderFinished(data.Member("result").As<RenderFinishedEventArgs>());
                    break;
                case "alphaTab.renderFinished":
                    OnRenderFinished(data.Member("result").As<RenderFinishedEventArgs>());
                    break;
                case "alphaTab.postRenderFinished":
                    BoundsLookup = BoundsLookup.FromJson(data.Member("boundsLookup"), _api.Score);
                    OnPostRenderFinished();
                    break;
                case "alphaTab.error":
                    OnError(data.Member("type").As<string>(), data.Member("detail").As<Exception>());
                    break;
            }
        }

        public void Render(Score score, int[] trackIndexes)
        {
            var converter = new JsonConverter();
            score = converter.ScoreToJsObject(score);
            _worker.postMessage(new { cmd = "alphaTab.render", score = score, trackIndexes = trackIndexes });
        }

        public event Action<RenderFinishedEventArgs> PreRender;
        protected virtual void OnPreRender(RenderFinishedEventArgs obj)
        {
            var handler = PreRender;
            if (handler != null) handler(obj);
        }

        public event Action<RenderFinishedEventArgs> PartialRenderFinished;
        protected virtual void OnPartialRenderFinished(RenderFinishedEventArgs obj)
        {
            var handler = PartialRenderFinished;
            if (handler != null) handler(obj);
        }

        public event Action<RenderFinishedEventArgs> RenderFinished;
        protected virtual void OnRenderFinished(RenderFinishedEventArgs obj)
        {
            var handler = RenderFinished;
            if (handler != null) handler(obj);
        }

        public event Action<string, Exception> Error;
        protected virtual void OnError(string type, Exception details)
        {
            var handler = Error;
            if (handler != null) handler(type, details);
        }

        public event Action PostRenderFinished;
        protected virtual void OnPostRenderFinished()
        {
            var handler = PostRenderFinished;
            if (handler != null) handler();
        }
    }
}