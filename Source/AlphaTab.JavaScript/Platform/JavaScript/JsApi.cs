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
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Rendering;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public class JsApi : JsApiBase
    {
        public JsApi(HtmlElement element, object options)
            : base(element, options)
        {
        }

        protected override IScoreRenderer CreateScoreRenderer(Settings settings)
        {
            return new ScoreRenderer(settings);
        }

        public override void Load(object data)
        {
            if (Std.InstanceOf<ArrayBuffer>(data))
            {
                ScoreLoaded(ScoreLoader.LoadScoreFromBytes(Std.ArrayBufferToByteArray((ArrayBuffer)data)));
            }
            else if (Std.InstanceOf<Uint8Array>(data))
            {
                ScoreLoaded(ScoreLoader.LoadScoreFromBytes((byte[])data));
            }
            else if (JsTypeOf(data) == JsTypes.@string)
            {
                ScoreLoader.LoadScoreAsync((string)data, s => ScoreLoaded(s), e => console.error(e));
            }
        }

        public override void Tex(string contents)
        {
            var parser = new AlphaTexImporter();
            var data = ByteBuffer.FromBuffer(Std.StringToByteArray(contents));
            parser.Init(data);
            ScoreLoaded(parser.ReadScore());
        }

        public override void Render()
        {
            if (Renderer == null) return;

            // check if font is loaded for HTML5 canvas
            if (Renderer.As<ScoreRenderer>().Canvas is Html5Canvas)
            {
                Action renderAction = null;
                renderAction = () =>
                {
                    // if font is not yet loaded, try again in 1 sec
                    if (!Environment.IsFontLoaded)
                    {
                        HtmlContext.window.setTimeout(() =>
                        {
                            renderAction();
                        }, 1000);
                    }
                    else
                    {
                        // when font is finally loaded, start rendering
                        Renderer.As<ScoreRenderer>().RenderMultiple(Tracks);

                    }
                };
                renderAction();
            }
            else
            {
                Renderer.As<ScoreRenderer>().RenderMultiple(Tracks);
            }
        }
    }

}