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
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Staves;
using AlphaTab.Util;
using Staff = AlphaTab.Rendering.Staves.Staff;

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// This is the base public class for creating new layouting engines for the score renderer. 
    /// </summary>
    public abstract class ScoreLayout
    {
        private readonly FastDictionary<string, FastDictionary<int, BarRendererBase>> _barRendererLookup;

        public ScoreRenderer Renderer { get; set; }

        public abstract string Name { get; }
        public float Width { get; set; }
        public float Height { get; set; }

        protected FastDictionary<HeaderFooterElements, TextGlyph> ScoreInfoGlyphs;
        protected TuningGlyph TuningGlyph;


        protected ScoreLayout(ScoreRenderer renderer)
        {
            Renderer = renderer;
            _barRendererLookup = new FastDictionary<string, FastDictionary<int, BarRendererBase>>();
        }


        public abstract bool SupportsResize { get; }
        public abstract void Resize();

        public void LayoutAndRender()
        {
            CreateScoreInfoGlyphs();
            DoLayoutAndRender();
        }

        protected abstract void DoLayoutAndRender();

        private void CreateScoreInfoGlyphs()
        {
            Logger.Info("ScoreLayout", "Creating score info glyphs");

            var flags = Renderer.Settings.Layout.Get("hideInfo", false) ? HeaderFooterElements.None : HeaderFooterElements.All;
            var score = Renderer.Score;
            var res = Renderer.RenderingResources;

            ScoreInfoGlyphs = new FastDictionary<HeaderFooterElements, TextGlyph>();
            if (!string.IsNullOrEmpty(score.Title) && (flags & HeaderFooterElements.Title) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.Title] = new TextGlyph(0, 0, score.Title, res.TitleFont, TextAlign.Center);
            }
            if (!string.IsNullOrEmpty(score.SubTitle) && (flags & HeaderFooterElements.SubTitle) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.SubTitle] = new TextGlyph(0, 0, score.SubTitle, res.SubTitleFont, TextAlign.Center);
            }
            if (!string.IsNullOrEmpty(score.Artist) && (flags & HeaderFooterElements.Artist) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.Artist] = new TextGlyph(0, 0, score.Artist, res.SubTitleFont, TextAlign.Center);
            }
            if (!string.IsNullOrEmpty(score.Album) && (flags & HeaderFooterElements.Album) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.Album] = new TextGlyph(0, 0, score.Album, res.SubTitleFont, TextAlign.Center);
            }
            if (!string.IsNullOrEmpty(score.Music) && score.Music == score.Words && (flags & HeaderFooterElements.WordsAndMusic) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.WordsAndMusic] = new TextGlyph(0, 0, "Music and Words by " + score.Words, res.WordsFont, TextAlign.Center);
            }
            else
            {
                if (!string.IsNullOrEmpty(score.Music) && (flags & HeaderFooterElements.Music) != 0)
                {
                    ScoreInfoGlyphs[HeaderFooterElements.Music] = new TextGlyph(0, 0, "Music by " + score.Music, res.WordsFont, TextAlign.Right);
                }
                if (!string.IsNullOrEmpty(score.Words) && (flags & HeaderFooterElements.Words) != 0)
                {
                    ScoreInfoGlyphs[HeaderFooterElements.Words] = new TextGlyph(0, 0, "Words by " + score.Music, res.WordsFont, TextAlign.Left);
                }
            }

            // tuning info
            if (Renderer.Tracks.Length == 1 && !Renderer.Tracks[0].IsPercussion && !Renderer.Settings.Layout.Get("hideTuning", false))
            {
                var tuning = Tuning.FindTuning(Renderer.Tracks[0].Tuning);
                if (tuning != null)
                {
                    TuningGlyph = new TuningGlyph(0, 0, Scale, Renderer.RenderingResources, tuning);
                }
            }
        }

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

            for (var trackIndex = 0; trackIndex < Renderer.Tracks.Length; trackIndex++)
            {
                var track = Renderer.Tracks[trackIndex];
                string staveProfile;
                // use optimal profile for track 
                if (track.IsPercussion)
                {
                    staveProfile = Environment.StaveProfileScore;
                }
                else if (track.IsStringed)
                {
                    staveProfile = Renderer.Settings.Staves.Id;
                }
                else
                {
                    staveProfile = Environment.StaveProfileScore;
                }

                var profile = Environment.StaveProfiles.ContainsKey(staveProfile)
                    ? Environment.StaveProfiles[staveProfile]
                    : Environment.StaveProfiles["default"];

                for (int staveIndex = 0; staveIndex < track.Staves.Count; staveIndex++)
                {
                    for (var renderStaveIndex = 0; renderStaveIndex < profile.Length; renderStaveIndex++)
                    {
                        var factory = profile[renderStaveIndex];
                        var staff = track.Staves[staveIndex];
                        if (factory.CanCreate(track, staff))
                        {
                            group.AddStaff(track, new Staff(trackIndex, staff, factory));
                        }
                    }
                }
            }
            return group;
        }

        public void RegisterBarRenderer(string key, BarRendererBase renderer)
        {
            if (!_barRendererLookup.ContainsKey(key))
            {
                _barRendererLookup[key] = new FastDictionary<int, BarRendererBase>();
            }
            _barRendererLookup[key][renderer.Bar.Id] = renderer;
        }

        public void UnregisterBarRenderer(string key, BarRendererBase renderer)
        {
            if (_barRendererLookup.ContainsKey(key))
            {
                var lookup = _barRendererLookup[key];
                lookup.Remove(renderer.Bar.Id);
            }
        }

        public BarRendererBase GetRendererForBar(string key, Bar bar)
        {
            var barRendererId = bar.Id;
            if (_barRendererLookup.ContainsKey(key) && _barRendererLookup[key].ContainsKey(barRendererId))
            {
                return _barRendererLookup[key][barRendererId];
            }
            return null;
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
            canvas.FillText(msg, x, resources.CopyrightFont.Size);
            var result = canvas.EndRender();
            Renderer.OnPartialRenderFinished(new RenderFinishedEventArgs
            {
                Width = Width,
                Height = height,
                RenderResult = result,
                TotalWidth = Width,
                TotalHeight = Height,
                FirstMasterBarIndex = -1,
                LastMasterBarIndex = -1
            });
        }
    }
}
