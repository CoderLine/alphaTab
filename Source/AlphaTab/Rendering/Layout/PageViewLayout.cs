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
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Util;

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// This layout arranges the bars into a fixed width and dynamic height region. 
    /// </summary>
    public class PageViewLayout : ScoreLayout
    {
        // left top right bottom
        public static readonly float[] PagePadding = { 40, 40, 40, 40 };
        public const float GroupSpacing = 20;

        private FastList<StaveGroup> _groups;
        private FastList<MasterBarsRenderers> _allMasterBarRenderers;
        private MasterBarsRenderers _barsFromPreviousGroup;

        public override string Name { get { return "PageView"; } }
        public PageViewLayout(ScoreRenderer renderer)
            : base(renderer)
        {
        }

        protected override void DoLayoutAndRender()
        {
            var x = PagePadding[0];
            var y = PagePadding[1];
            Width = Renderer.Settings.Width;
            _allMasterBarRenderers = new FastList<MasterBarsRenderers>();

            // 
            // 1. Score Info
            y = LayoutAndRenderScoreInfo(x, y);

            //
            // 2. One result per StaveGroup
            y = LayoutAndRenderScore(x, y);

            Height = y + PagePadding[3];
        }

        public override bool SupportsResize
        {
            get { return true; }
        }

        public override void Resize()
        {
            var x = PagePadding[0];
            var y = PagePadding[1];
            Width = Renderer.Settings.Width;
            var oldHeight = Height;

            // 
            // 1. Score Info
            y = LayoutAndRenderScoreInfo(x, y, oldHeight);

            //
            // 2. One result per StaveGroup
            y = ResizeAndRenderScore(x, y, oldHeight);

            Height = y + PagePadding[3];
        }

        private float LayoutAndRenderScoreInfo(float x, float y, float totalHeight = -1)
        {
            Logger.Info(Name, "Layouting score info");

            var scale = Scale;
            var res = Renderer.RenderingResources;

            var centeredGlyphs = new[]
            {
                HeaderFooterElements.Title, HeaderFooterElements.SubTitle, HeaderFooterElements.Artist,
                HeaderFooterElements.Album, HeaderFooterElements.WordsAndMusic
            };

            for (int i = 0; i < centeredGlyphs.Length; i++)
            {
                if (ScoreInfoGlyphs.ContainsKey(centeredGlyphs[i]))
                {
                    var glyph = ScoreInfoGlyphs[centeredGlyphs[i]];
                    glyph.X = Width / 2f;
                    glyph.Y = y;
                    glyph.TextAlign = TextAlign.Center;
                    y += glyph.Font.Size;
                }
            }

            bool musicOrWords = false;
            float musicOrWordsHeight = 0;
            if (ScoreInfoGlyphs.ContainsKey(HeaderFooterElements.Music))
            {
                var glyph = ScoreInfoGlyphs[HeaderFooterElements.Music];
                glyph.X = Width - PagePadding[2];
                glyph.Y = y;
                glyph.TextAlign = TextAlign.Right;
                musicOrWords = true;
                musicOrWordsHeight = glyph.Font.Size;
            }
            if (ScoreInfoGlyphs.ContainsKey(HeaderFooterElements.Words))
            {
                var glyph = ScoreInfoGlyphs[HeaderFooterElements.Words];
                glyph.X = x;
                glyph.Y = y;
                glyph.TextAlign = TextAlign.Left;
                musicOrWords = true;
                musicOrWordsHeight = glyph.Font.Size;
            }

            if (musicOrWords)
            {
                y += musicOrWordsHeight;
            }

            if (TuningGlyph != null)
            {
                y += 20 * scale;
                TuningGlyph.X = x;
                TuningGlyph.Y = y;
                y += TuningGlyph.Height;
            }

            y += 20 * scale;

            var canvas = Renderer.Canvas;
            canvas.BeginRender(Width, y);
            canvas.Color = res.ScoreInfoColor;
            canvas.TextAlign = TextAlign.Center;
            foreach (var key in ScoreInfoGlyphs)
            {
                ScoreInfoGlyphs[key].Paint(0, 0, canvas);
            }

            if (TuningGlyph != null)
            {
                TuningGlyph.Paint(0, 0, canvas);
            }

            var result = canvas.EndRender();
            Renderer.OnPartialRenderFinished(new RenderFinishedEventArgs
            {
                Width = Width,
                Height = y,
                RenderResult = result,
                TotalWidth = Width,
                TotalHeight = totalHeight < 0 ? y : totalHeight,
                FirstMasterBarIndex = -1,
                LastMasterBarIndex = -1
            });

            return y;
        }

        private float ResizeAndRenderScore(float x, float y, float oldHeight)
        {
            var canvas = Renderer.Canvas;

            // if we have a fixed number of bars per row, we only need to refit them. 
            if (Renderer.Settings.Layout.Get("barsPerRow", -1) != -1)
            {
                for (int i = 0; i < _groups.Count; i++)
                {
                    var group = _groups[i];
                    FitGroup(group);
                    group.FinalizeGroup();

                    y += PaintGroup(group, oldHeight, canvas);
                }
            }
            // if the bars per row are flexible, we need to recreate the stave groups 
            // by readding the existing groups
            else
            {
                _groups = new FastList<StaveGroup>();

                var currentIndex = 0;
                var maxWidth = MaxWidth;

                var group = CreateEmptyStaveGroup();
                group.Index = _groups.Count;
                group.X = x;
                group.Y = y;

                while (currentIndex < _allMasterBarRenderers.Count)
                {
                    // if the current renderer still has space in the current group add it
                    // also force adding in case the group is empty
                    var renderers = _allMasterBarRenderers[currentIndex];
                    if (group.Width + renderers.Width <= maxWidth || group.MasterBarsRenderers.Count == 0)
                    {
                        group.AddMasterBarRenderers(Renderer.Tracks, renderers);
                        // move to next group
                        currentIndex++;
                    }
                    else
                    {
                        // in case we do not have space, we create a new group
                        group.IsFull = true;
                        group.IsLast = false;
                        _groups.Add(group);
                        FitGroup(group);
                        group.FinalizeGroup();
                        y += PaintGroup(group, oldHeight, canvas);

                        // note: we do not increase currentIndex here to have it added to the next group
                        group = CreateEmptyStaveGroup();
                        group.Index = _groups.Count;
                        group.X = x;
                        group.Y = y;
                    }
                }

                // don't forget to finish the last group
                FitGroup(group);
                group.FinalizeGroup();
                y += PaintGroup(group, oldHeight, canvas);
            }

            return y;
        }

        private float LayoutAndRenderScore(float x, float y)
        {
            var score = Renderer.Score;
            var canvas = Renderer.Canvas;

            var startIndex = Renderer.Settings.Layout.Get("start", 1);
            startIndex--; // map to array index
            startIndex = Math.Min(score.MasterBars.Count - 1, Math.Max(0, startIndex));
            var currentBarIndex = startIndex;

            var endBarIndex = Renderer.Settings.Layout.Get("count", score.MasterBars.Count);
            if (endBarIndex < 0) endBarIndex = score.MasterBars.Count;
            endBarIndex = startIndex + endBarIndex - 1; // map count to array index
            endBarIndex = Math.Min(score.MasterBars.Count - 1, Math.Max(0, endBarIndex));

            _groups = new FastList<StaveGroup>();
            while (currentBarIndex <= endBarIndex)
            {
                // create group and align set proper coordinates
                var group = CreateStaveGroup(currentBarIndex, endBarIndex);
                _groups.Add(group);
                group.X = x;
                group.Y = y;

                currentBarIndex = group.LastBarIndex + 1;

                // finalize group (sizing etc).
                FitGroup(group);
                group.FinalizeGroup();

                Logger.Info(Name, "Rendering partial from bar " + group.FirstBarIndex + " to " + group.LastBarIndex);
                y += PaintGroup(group, y, canvas);
            }

            return y;
        }

        private float PaintGroup(StaveGroup group, float totalHeight, ICanvas canvas)
        {
            // paint into canvas
            var height = group.Height + (GroupSpacing * Scale);
            canvas.BeginRender(Width, height);
            Renderer.Canvas.Color = Renderer.RenderingResources.MainGlyphColor;
            Renderer.Canvas.TextAlign = TextAlign.Left;
            // NOTE: we use this negation trick to make the group paint itself to 0/0 coordinates 
            // since we use partial drawing
            group.Paint(0, -group.Y, canvas);

            // calculate coordinates for next group
            totalHeight += height;

            var result = canvas.EndRender();
            var args = new RenderFinishedEventArgs();
            args.TotalWidth = Width;
            args.TotalHeight = totalHeight;
            args.Width = Width;
            args.Height = height;
            args.RenderResult = result;
            args.FirstMasterBarIndex = group.FirstBarIndex;
            args.LastMasterBarIndex = group.LastBarIndex;

            Renderer.OnPartialRenderFinished(args);

            return height;
        }

        /// <summary>
        /// Realignes the bars in this line according to the available space
        /// </summary>
        private void FitGroup(StaveGroup group)
        {
            if (group.IsFull || group.Width > MaxWidth)
            {
                group.ScaleToWidth(MaxWidth);
            }

            Width = Math.Max(Width, group.Width);
        }

        private StaveGroup CreateStaveGroup(int currentBarIndex, int endIndex)
        {
            var group = CreateEmptyStaveGroup();
            group.Index = _groups.Count;

            var barsPerRow = Renderer.Settings.Layout.Get("barsPerRow", -1);

            var maxWidth = MaxWidth;
            var end = endIndex + 1;
            for (int i = currentBarIndex; i < end; i++)
            {
                MasterBarsRenderers renderers;
                if (_barsFromPreviousGroup != null && _barsFromPreviousGroup.MasterBar.Index == i)
                {
                    renderers = group.AddMasterBarRenderers(Renderer.Tracks, _barsFromPreviousGroup);
                }
                else
                {
                    renderers = group.AddBars(Renderer.Tracks, i);
                    _allMasterBarRenderers.Add(renderers);
                }
                _barsFromPreviousGroup = null;

                var groupIsFull = false;

                // can bar placed in this line?
                if (barsPerRow == -1 && ((group.Width) >= maxWidth && group.MasterBarsRenderers.Count != 0))
                {
                    groupIsFull = true;
                }
                else if (group.MasterBarsRenderers.Count == barsPerRow + 1)
                {
                    groupIsFull = true;
                }

                if (groupIsFull)
                {
                    group.RevertLastBar();
                    group.IsFull = true;
                    group.IsLast = false;
                    _barsFromPreviousGroup = renderers;
                    return group;
                }

                group.X = 0;
            }

            group.IsLast = endIndex == group.LastBarIndex;
            return group;
        }

        private float MaxWidth
        {
            get
            {
                return Renderer.Settings.Width - PagePadding[0] - PagePadding[2];
            }
        }
    }
}
