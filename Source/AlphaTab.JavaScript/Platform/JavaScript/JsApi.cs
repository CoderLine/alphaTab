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
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public class JsApi : HtmlContext
    {
        private readonly HtmlElement _element;
        private readonly HtmlElement _canvasElement;
        private int[] _tracks;

        public JsApi(HtmlElement element, dynamic options)
        {
            _element = element;
            dynamic dataset = _element.dataset;

            // load settings
            Settings settings = Settings.FromJson(options);

            #region build tracks array

            // get track data to parse
            dynamic tracksData;
            if (options != null && options.tracks)
            {
                tracksData = options.tracks;
            }
            else if (element != null && element.dataset != null && dataset["tracks"] != null)
            {
                tracksData = dataset["tracks"];
            }
            else
            {
                tracksData = new[] { 0 };
            }

            SetTracks(tracksData, false);

            #endregion

            string contents = "";
            if (element != null)
            {
                // get load contents

                if (element.innerText.As<JsBoolean>())
                {
                    contents = (element.innerText.As<string>()).Trim();
                }
                element.innerHTML = "";

                #region Create context elements (wrapper, canvas etc)

                if (settings.Engine == "html5")
                {
                    _canvasElement = (HtmlElement)document.createElement("canvas");
                }
                else
                {
                    _canvasElement = (HtmlElement)document.createElement("div");
                }

                _canvasElement.className = "alphaTabSurface";
                element.appendChild(_canvasElement);

                #endregion

            }

            #region Renderer Setup

            Renderer = new ScoreRenderer(settings, _canvasElement);
            Renderer.RenderFinished += o => TriggerEvent("rendered");
            Renderer.PostRenderFinished += () => TriggerEvent("post-rendered");
            Renderer.RenderFinished += result =>
            {
                if (Renderer.IsSvg)
                {
                    _canvasElement.innerHTML = result.RenderResult.ToString();
                    _canvasElement.style.width = result.Width + "px";
                    _canvasElement.style.height = result.Height + "px";
                }
            };

            #endregion

            #region Load Default Data

            if (!string.IsNullOrEmpty(contents))
            {
                Tex(contents);
            }
            else if (_element != null && _element.dataset != null && !string.IsNullOrEmpty(dataset["file"]))
            {
                Load(dataset["file"]);
            }

            #endregion
        }

        public IScoreRenderer Renderer { get; private set; }
        public Score Score { get; set; }

        public Track[] Tracks
        {
            get
            {
                FastList<Track> tracks = new FastList<Track>();

                foreach (var track in _tracks)
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

        public void Load(object data)
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

        public void Tex(string contents)
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

        public void SetTracks(dynamic tracksData, bool render = true)
        {
            FastList<int> tracks = new FastList<int>();

            // decode string
            if (JsTypeOf(tracksData) == JsTypes.@string)
            {
                try
                {
                    tracksData = JSON.parse((string)tracksData);
                }
                catch
                {
                    tracksData = new[] { 0 };
                }
            }

            // decode array
            if (JsTypeOf(tracksData) == JsTypes.number)
            {
                tracks.Add((int)tracksData);
            }
            else if (tracksData.length)
            {
                for (var i = 0; i < tracksData.length; i++)
                {
                    int value;
                    if (JsTypeOf(tracksData[i]) == JsTypes.number)
                    {
                        value = (int)tracksData[i];
                    }
                    else
                    {
                        value = Std.ParseInt(tracksData[i].ToString());
                    }

                    if (value >= 0)
                    {
                        tracks.Add(value);
                    }
                }
            }
            _tracks = tracks.ToArray();

            if (render)
            {
                Render();
            }
        }

        public void ScoreLoaded(Score score)
        {
            Score = score;
            TriggerEvent("loaded", score);
            Render();
        }

        private void TriggerEvent(string name, object details = null)
        {
            if (_element != null)
            {
                dynamic e = document.createEvent("CustomEvent");
                e.initCustomEvent(name, false, false, details);
                _element.dispatchEvent(e);
            }
        }

        public void Render()
        {
            if (Renderer != null)
            {
                Renderer.RenderMultiple(Tracks);
            }
        }
    }

}