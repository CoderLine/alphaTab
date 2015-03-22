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
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// This layout arranges the bars into a fixed width and dynamic height region. 
    /// </summary>
    public class PageViewLayout : ScoreLayout
    {
        // left top right bottom
        public static readonly float[] PagePadding = { 40, 40, 40, 40 };
        public const float WidthOn100 = 950;
        public const float GroupSpacing = 20;

        private FastList<StaveGroup> _groups;

        public PageViewLayout(ScoreRenderer renderer)
            : base(renderer)
        {
        }

        public override void DoLayoutAndRender()
        {
            var x = PagePadding[0];
            var y = PagePadding[1];
            var autoSize = Renderer.Settings.Layout.Get("autoSize", true);
            if (autoSize || Renderer.Settings.Width <= 0)
            {
                Width = WidthOn100 * Scale;
            }
            else
            {
                Width = Renderer.Settings.Width;
            }

            // 
            // 1. Score Info

            y = LayoutAndRenderScoreInfo(x, y);

            //
            // 2. One result per StaveGroup
            y = LayoutAndRenderScore(x, y);

            Height = y + PagePadding[3];
        }

        private float LayoutAndRenderScoreInfo(float x, float y)
        {
            HeaderFooterElements flags = Renderer.Settings.Layout.Get("hideInfo", false) ? HeaderFooterElements.None : HeaderFooterElements.All;
            var score = Renderer.Score;
            var scale = Scale;

            var canvas = Renderer.Canvas;
            var res = Renderer.RenderingResources;

            var glyphs = new FastList<TextGlyph>();

            string str;
            if (!string.IsNullOrEmpty(score.Title) && (flags & HeaderFooterElements.Title) != 0)
            {
                glyphs.Add(new TextGlyph(Width / 2f, y, score.Title, res.TitleFont, TextAlign.Center));
                y += (35 * scale);
            }
            if (!string.IsNullOrEmpty(score.SubTitle) && (flags & HeaderFooterElements.SubTitle) != 0)
            {
                glyphs.Add(new TextGlyph(Width / 2f, y, score.SubTitle, res.SubTitleFont, TextAlign.Center));
                y += (20 * scale);
            }
            if (!string.IsNullOrEmpty(score.Artist) && (flags & HeaderFooterElements.Artist) != 0)
            {
                glyphs.Add(new TextGlyph(Width / 2f, y, score.Artist, res.SubTitleFont, TextAlign.Center));
                y += (20 * scale);
            }
            if (!string.IsNullOrEmpty(score.Album) && (flags & HeaderFooterElements.Album) != 0)
            {
                glyphs.Add(new TextGlyph(Width / 2f, y, score.Album, res.SubTitleFont, TextAlign.Center));
                y += (20 * scale);
            }
            if (!string.IsNullOrEmpty(score.Music) && score.Music == score.Words && (flags & HeaderFooterElements.WordsAndMusic) != 0)
            {
                glyphs.Add(new TextGlyph(Width / 2f, y, "Music and Words by " + score.Words, res.WordsFont, TextAlign.Center));
                y += (20 * scale);
            }
            else
            {
                if (!string.IsNullOrEmpty(score.Music) && (flags & HeaderFooterElements.Music) != 0)
                {
                    glyphs.Add(new TextGlyph(Width - PagePadding[2], y, "Music by " + score.Music, res.WordsFont, TextAlign.Right));
                }
                if (!string.IsNullOrEmpty(score.Words) && (flags & HeaderFooterElements.Words) != 0)
                {
                    glyphs.Add(new TextGlyph(x, y, "Words by " + score.Music, res.WordsFont, TextAlign.Left));
                }
                y += (20 * scale);
            }

            y += (20 * scale);

            // tuning info
            if (Renderer.Tracks.Length == 1 && !Renderer.Tracks[0].IsPercussion)
            {
                var tuning = Tuning.FindTuning(Renderer.Tracks[0].Tuning);
                if (tuning != null)
                {
                    // Name
                    glyphs.Add(new TextGlyph(x, y, tuning.Name, res.EffectFont, TextAlign.Left));

                    y += (15 * scale);

                    if (!tuning.IsStandard)
                    {
                        // Strings
                        var stringsPerColumn = (int)Math.Ceiling(Renderer.Tracks[0].Tuning.Length / 2.0);

                        var currentX = x;
                        var currentY = y;

                        for (int i = 0, j = Renderer.Tracks[0].Tuning.Length; i < j; i++)
                        {
                            str = "(" + (i + 1) + ") = " + Tuning.GetTextForTuning(Renderer.Tracks[0].Tuning[i], false);
                            glyphs.Add(new TextGlyph(currentX, currentY, str, res.EffectFont, TextAlign.Left));
                            currentY += (15 * scale);
                            if (i == stringsPerColumn - 1)
                            {
                                currentY = y;
                                currentX += (43 * scale);
                            }
                        }

                        y += (stringsPerColumn * (15 * scale));
                    }
                }
            }
            y += 25 * scale;

            canvas.BeginRender(Width, y);
            canvas.Color = res.ScoreInfoColor;
            canvas.TextAlign = TextAlign.Center;
            for (int i = 0; i < glyphs.Count; i++)
            {
                glyphs[i].Paint(0, 0, canvas);
            }

            var result = canvas.EndRender();
            OnPartialRenderFinished(new RenderFinishedEventArgs
            {
                Width = Width,
                Height = y,
                RenderResult = result,
                TotalWidth = Width,
                TotalHeight = y
            });

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

            if (Renderer.Settings.Staves.Count > 0)
            {
                while (currentBarIndex <= endBarIndex)
                {
                    // create group and align set proper coordinates
                    var group = CreateStaveGroup(currentBarIndex, endBarIndex);
                    _groups.Add(group);
                    group.X = x;
                    group.Y = y;

                    // finalize group (sizing etc).
                    FitGroup(group);
                    group.FinalizeGroup(this);

                    // paint into canvas
                    var height = group.Height + (GroupSpacing * Scale);
                    canvas.BeginRender(Width, height);
                    Renderer.Canvas.Color = Renderer.RenderingResources.MainGlyphColor;
                    Renderer.Canvas.TextAlign = TextAlign.Left;
                    // NOTE: we use this negation trick to make the group paint itself to 0/0 coordinates 
                    // since we use partial drawing
                    group.Paint(0, -group.Y, canvas);
                    
                    // calculate coordinates for next group
                    y += height;
                    currentBarIndex = group.LastBarIndex + 1;

                    var result = canvas.EndRender();
                    OnPartialRenderFinished(new RenderFinishedEventArgs
                    {
                        TotalWidth = Width,
                        TotalHeight = y,
                        Width = Width,
                        Height = height,
                        RenderResult = result
                    });
                }

            }

            return y;
        }

        /// <summary>
        /// Realignes the bars in this line according to the available space
        /// </summary>
        private void FitGroup(StaveGroup group)
        {
            // calculate additional space for each bar (can be negative!)
            float barSpace = 0f;
            float freeSpace = MaxWidth - group.Width;

            if (freeSpace != 0 && group.MasterBars.Count > 0)
            {
                barSpace = freeSpace / group.MasterBars.Count;
            }

            if (group.IsFull || barSpace < 0)
            {
                // add it to the measures
                group.ApplyBarSpacing(barSpace);
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
                group.AddBars(Renderer.Tracks, i);

                var groupIsFull = false;

                // can bar placed in this line?
                if (barsPerRow == -1 && ((group.Width) >= maxWidth && group.MasterBars.Count != 0))
                {
                    groupIsFull = true;
                }
                else if (group.MasterBars.Count == barsPerRow + 1)
                {
                    groupIsFull = true;
                }

                if (groupIsFull)
                {
                    group.RevertLastBar();
                    group.IsFull = true;
                    return group;
                }

                group.X = 0;
            }

            return group;
        }

        private float MaxWidth
        {
            get
            {
                var autoSize = Renderer.Settings.Layout.Get("autoSize", true);
                var width = autoSize ? SheetWidth : Renderer.Settings.Width;
                return width - PagePadding[0] - PagePadding[2];
            }
        }

        private float SheetWidth
        {
            get
            {
                return (WidthOn100 * Scale);
            }
        }

        public override void BuildBoundingsLookup(BoundingsLookup lookup)
        {
            for (int i = 0, j = _groups.Count; i < j; i++)
            {
                _groups[i].BuildBoundingsLookup(lookup);
            }
        }
    }
}
