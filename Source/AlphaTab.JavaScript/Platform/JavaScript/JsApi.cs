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
using AlphaTab.Model;
using AlphaTab.Rendering;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public class JsApi : JsApiBase
    {
        public Track[] Tracks
        {
            get
            {
                var tracks = new FastList<Track>();

                foreach (var track in TrackIndexes)
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

        public JsApi(HtmlElement element, object options)
            : base(element, options)
        {
        }

        protected override IScoreRenderer CreateScoreRenderer(Settings settings, object rawSettings, HtmlElement canvasElement)
        {
            return new ScoreRenderer(settings, canvasElement);
        }

        public override void Load(object data)
        {
            try
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
                    ScoreLoader.LoadScoreAsync((string)data, ScoreLoaded, e => console.error(e));
                }
            }
            catch (Exception e)
            {
                console.error(e);
            }
        }

        public override void Tex(string contents)
        {
            try
            {
                var parser = new AlphaTexImporter();
                var data = ByteBuffer.FromBuffer(Std.StringToByteArray(contents));
                parser.Init(data);
                ScoreLoaded(parser.ReadScore());
            }
            catch (Exception e)
            {
                console.error(e);
            }
        }

        public override void Render()
        {
            if (Renderer != null)
            {
                Renderer.As<ScoreRenderer>().RenderMultiple(Tracks);
            }
        }
    }

}