/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using SharpKit.Html;
using SharpKit.Html.fileapi;
using SharpKit.Html.workers;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public class WorkerScoreRenderer : HtmlContext, IScoreRenderer
    {
        private readonly Worker _worker;

        public BoundsLookup BoundsLookup { get; private set; }
        public Score Score { get; private set; }

        public WorkerScoreRenderer(Settings settings)
        {
            _worker = new Worker(CreateWorkerUrl());
            _worker.postMessage(new { cmd = "initialize", settings = settings.ToJson() });
            _worker.addEventListener("message", HandleWorkerMessage, false);
        }

        private string CreateWorkerUrl()
        {
            var source = @"self.onmessage = function(e) {
                if(e.data.cmd == 'initialize') {
                    importScripts(e.data.settings.atRoot);
                    new AlphaTab.Platform.JavaScript.JsWorker(self, e.data.settings);
                }
            }";

            JsCode("window.URL = window.URL || window.webkitURL;");
            JsCode("window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder  || window.MozBlobBuilder;");

            Blob blob;
            try
            {
                blob = new Blob(new[] {source}, new {type = "application/javascript"});
            }
            catch
            {
                dynamic builder = JsCode("new BlobBuilder()");
                builder.append(source);
                blob = builder.getBlob();
            }

            return JsCode("URL.createObjectURL(blob)").As<string>();

        }

        public void UpdateSettings(Settings settings)
        {
            _worker.postMessage(new { cmd = "updateSettings", settings = settings.ToJson() });
        }

        public void Invalidate()
        {
            _worker.postMessage(new { cmd = "invalidate" });
        }

        public void Resize(int width)
        {
            _worker.postMessage(new { cmd = "resize", width = width  });
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
                    OnPreRender(data.Member("result").As<RenderFinishedEventArgs>());
                    break;
                case "partialRenderFinished":
                    OnPartialRenderFinished(data.Member("result").As<RenderFinishedEventArgs>());
                    break;
                case "renderFinished":
                    OnRenderFinished(data.Member("result").As<RenderFinishedEventArgs>());
                    break;
                case "postRenderFinished":
                    BoundsLookup = BoundsLookup.FromJson(data.Member("boundsLookup"), Score);
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
                    Score = score;
                    OnLoaded(score);
                    break;
            }
        }

        public void RenderMultiple(int[] trackIndexes)
        {
            _worker.postMessage(new { cmd = "renderMultiple", data = trackIndexes });
        }

        public event Action<RenderFinishedEventArgs> PreRender;
        protected virtual void OnPreRender(RenderFinishedEventArgs obj)
        {
            Action<RenderFinishedEventArgs> handler = PreRender;
            if (handler != null) handler(obj);
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

        public event Action<Score> ScoreLoaded;
        protected virtual void OnLoaded(Score score)
        {
            Action<Score> handler = ScoreLoaded;
            if (handler != null) handler(score);
        }

        public void Tex(string contents)
        {
            _worker.postMessage(new { cmd = "tex", data = contents });
        }

    }
}