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
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;
using Staff = AlphaTab.Rendering.Staves.Staff;

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// This is the base public class for creating new layouting engines for the score renderer. 
    /// </summary>
    public abstract class ScoreLayout
    {
        private readonly FastDictionary<string, FastDictionary<string, BarRendererBase>> _barRendererLookup;

        public ScoreRenderer Renderer { get; set; }

        public float Width { get; set; }
        public float Height { get; set; }

        protected ScoreLayout(ScoreRenderer renderer)
        {
            Renderer = renderer;
            _barRendererLookup = new FastDictionary<string, FastDictionary<string, BarRendererBase>>();
        }

        public abstract void DoLayoutAndRender();

        public float Scale
        {
            get
            {
                return Renderer.Settings.Scale;
            }
        }

        protected StaveGroup CreateEmptyStaveGroup()
        {
            var group = new StaveGroup();
            group.Layout = this;

            var isFirstTrack = true;
            for (var trackIndex = 0; trackIndex < Renderer.Tracks.Length; trackIndex++)
            {
                var track = Renderer.Tracks[trackIndex];
                for (int staveIndex = 0; staveIndex < track.Staves.Count; staveIndex++)
                {
                    for (var renderStaveIndex = 0; renderStaveIndex < Renderer.Settings.Staves.Count; renderStaveIndex++)
                    {
                        var s = Renderer.Settings.Staves[renderStaveIndex];
                        if (Environment.StaveFactories.ContainsKey(s.Id))
                        {
                            var factory = Environment.StaveFactories[s.Id](this);
                            if (factory.CanCreate(track) && (isFirstTrack || !factory.HideOnMultiTrack) && (staveIndex == 0 || !factory.HideOnMultiTrack))
                            {
                                group.AddStave(track, new Staff(track.Staves[staveIndex], s.Id, factory, s.AdditionalSettings));
                            }
                        }
                    }
                }
                isFirstTrack = false;
            }
            return group;
        }

        private string GetBarRendererId(int trackId, int barId)
        {
            return trackId + "-" + barId;
        }


        public void RegisterBarRenderer(string key, BarRendererBase renderer)
        {
            if (!_barRendererLookup.ContainsKey(key))
            {
                _barRendererLookup[key] = new FastDictionary<string, BarRendererBase>();
            }
            _barRendererLookup[key][GetBarRendererId(renderer.Bar.Staff.Track.Index, renderer.Bar.Index)] = renderer;
        }

        public void UnregisterBarRenderer(string key, BarRendererBase renderer)
        {
            if (_barRendererLookup.ContainsKey(key))
            {
                var lookup = _barRendererLookup[key];
                lookup.Remove(GetBarRendererId(renderer.Bar.Staff.Track.Index, renderer.Bar.Index));
            }
        }

        public BarRendererBase GetRendererForBar(string key, Bar bar)
        {
            var barRendererId = GetBarRendererId(bar.Staff.Track.Index, bar.Index);
            if (_barRendererLookup.ContainsKey(key) && _barRendererLookup[key].ContainsKey(barRendererId))
            {
                return _barRendererLookup[key][barRendererId];
            }
            return null;
        }

        public event Action<RenderFinishedEventArgs> PartialRenderFinished;
        protected virtual void OnPartialRenderFinished(RenderFinishedEventArgs e)
        {
            if (PartialRenderFinished != null)
            {
                PartialRenderFinished(e);
            }
        }

        public void RenderAnnotation()
        {
            // attention, you are not allowed to remove change this notice within any version of this library without permission!
            var msg = "Rendered using alphaTab (http://www.alphaTab.net)";

            var canvas = Renderer.Canvas;
            var resources = Renderer.RenderingResources;

            var height = (resources.CopyrightFont.Size * 2);
            Height += height;
            var x = Width / 2;

            canvas.BeginRender(Width, height);
            canvas.Color = resources.MainGlyphColor;
            canvas.Font = resources.CopyrightFont;
            canvas.TextAlign = TextAlign.Center;
            canvas.FillText(msg, x, 0);
            var result = canvas.EndRender();
            OnPartialRenderFinished(new RenderFinishedEventArgs
            {
                Width = Width,
                Height = height,
                RenderResult = result,
                TotalWidth = Width,
                TotalHeight = Height
            });
        }
    }
}
