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

using AlphaTab.Model;
using AlphaTab.Rendering;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public class JsWorkerApi : JsApiBase
    {
        private Score _workerScore; 

        public JsWorkerApi(HtmlElement element, object options)
            : base(element, options)
        {
        }

        protected override IScoreRenderer CreateScoreRenderer(Settings settings)
        {
            var renderer = new WorkerScoreRenderer(settings);
            renderer.ScoreLoaded += score =>
            {
                _workerScore = score;
                ScoreLoaded(score, false);
            };
            renderer.PostRenderFinished += () =>
            {
                Element.className = Element.className.replace(" loading", "")
                                            .replace(" rendering", "");
            };
            return renderer;
        }

        public override void Load(object data)
        {
            Element.className += " loading";

            if (JsTypeOf(data) == JsTypes.@string)
            {
                var fileLoader = new JsFileLoader();
                fileLoader.LoadBinaryAsync((string)data, b =>
                {
                    Renderer.As<WorkerScoreRenderer>().Load(b, TrackIndexes);
                }, e =>
                {
                    console.error(e);
                });
            }
            else
            {
                Renderer.As<WorkerScoreRenderer>().Load(data, TrackIndexes);
            }
        }

        public override void Render()
        {
            if (Renderer != null)
            {
                Element.className += " rendering";
                if (_workerScore != Score)
                {
                    Renderer.As<WorkerScoreRenderer>().SetScore(Score);
                }
                Renderer.As<WorkerScoreRenderer>().RenderMultiple(TrackIndexes);
            }
        }

        public override void Tex(string contents)
        {
            Element.className += " loading";
            Renderer.As<WorkerScoreRenderer>().Tex(contents);
        }
    }
}