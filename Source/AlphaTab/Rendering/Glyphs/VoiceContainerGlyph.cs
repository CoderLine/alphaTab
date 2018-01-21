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
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Staves;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This glyph acts as container for handling
    /// multiple voice rendering
    /// </summary>
    public class VoiceContainerGlyph : GlyphGroup
    {
        public const string KeySizeBeat = "Beat";

        public FastList<BeatContainerGlyph> BeatGlyphs { get; set; }

        public Voice Voice { get; set; }
        public float MinWidth { get; set; }

        public VoiceContainerGlyph(float x, float y, Voice voice)
            : base(x, y)
        {
            Voice = voice;
            BeatGlyphs = new FastList<BeatContainerGlyph>();
        }

        public void ScaleToWidth(float width)
        {
            var force = Renderer.LayoutingInfo.SpaceToForce(width);
            ScaleToForce(force);
        }

        private void ScaleToForce(float force)
        {
            Width = Renderer.LayoutingInfo.CalculateVoiceWidth(force);
            var positions = Renderer.LayoutingInfo.BuildOnTimePositions(force);
            var beatGlyphs = BeatGlyphs;
            for (int i = 0, j = beatGlyphs.Count; i < j; i++)
            {
                var currentBeatGlyph = beatGlyphs[i];
                var time = currentBeatGlyph.Beat.AbsoluteStart;
                currentBeatGlyph.X = positions[time] - currentBeatGlyph.OnTimeX;

                // size always previousl glyph after we know the position
                // of the next glyph
                if (i > 0)
                {
                    var beatWidth = currentBeatGlyph.X - beatGlyphs[i - 1].X;
                    beatGlyphs[i - 1].ScaleToWidth(beatWidth);
                }

                // for the last glyph size based on the full width
                if (i == j - 1)
                {
                    float beatWidth = Width - beatGlyphs[beatGlyphs.Count - 1].X;
                    currentBeatGlyph.ScaleToWidth(beatWidth);
                }
            }
        }

        public void RegisterLayoutingInfo(BarLayoutingInfo info)
        {
            info.UpdateVoiceSize(Width);
            var beatGlyphs = BeatGlyphs;
            foreach (var b in beatGlyphs)
            {
                b.RegisterLayoutingInfo(info);
            }
        }

        public void ApplyLayoutingInfo(BarLayoutingInfo info)
        {
            var beatGlyphs = BeatGlyphs;
            foreach (var b in beatGlyphs)
            {
                b.ApplyLayoutingInfo(info);
            }
            ScaleToForce(Math.Max(Renderer.Settings.StretchForce, info.MinStretchForce));
        }

        public override void AddGlyph(Glyph g)
        {
            g.X = BeatGlyphs.Count == 0
                ? 0
                : BeatGlyphs[BeatGlyphs.Count - 1].X + BeatGlyphs[BeatGlyphs.Count - 1].Width;
            g.Renderer = Renderer;
            g.DoLayout();
            BeatGlyphs.Add((BeatContainerGlyph)g);
            Width = g.X + g.Width;
        }

        public override void DoLayout()
        {
            MinWidth = Width;
        }

        //private static Random Random = new Random();
        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            //canvas.Color = new Color((byte)Platform.Random(255), (byte)Platform.Random(255), (byte)Platform.Random(255), 80);
            //canvas.FillRect(cx + X, cy + Y, Width, 100);

            //if (Voice.Index == 0)
            //{
            //    PaintSprings(cx + X, cy + Y, canvas);
            //}
            canvas.Color = Voice.Index == 0
                ? Renderer.ScoreRenderer.RenderingResources.MainGlyphColor
                : Renderer.ScoreRenderer.RenderingResources.SecondaryGlyphColor;

            for (int i = 0, j = BeatGlyphs.Count; i < j; i++)
            {
                BeatGlyphs[i].Paint(cx + X, cy + Y, canvas);
            }
        }

        //private void PaintSprings(float x, float y, ICanvas canvas)
        //{
        //    var sortedSprings = new FastList<Spring>();
        //    var xMin = 0f;
        //    Platform.Foreach(_layoutings.Springs.Values, spring =>
        //    {
        //        sortedSprings.Add(spring);
        //        if (spring.SpringWidth < xMin)
        //        {
        //            xMin = spring.SpringWidth;
        //        }
        //    });

        //    sortedSprings.Sort((a, b) =>
        //    {
        //        if (a.TimePosition < b.TimePosition)
        //        {
        //            return -1;
        //        }
        //        if (a.TimePosition > b.TimePosition)
        //        {
        //            return 1;
        //        }
        //        return 0;
        //    });

        //    y += 40;


        //    var positions = _layoutings.BuildOnTimePositions();
        //    var keys = positions.Keys;
        //    canvas.Color = new Color(255, 0, 0);
        //    for (int i = 0; i < keys.Length; i++)
        //    {
        //        var time = Platform.ParseInt(keys[i]);
        //        var springX = positions[time];
        //        var spring = _layoutings.Springs[time];

        //        canvas.BeginPath();
        //        canvas.MoveTo(x + springX, y);
        //        canvas.LineTo(x + springX, y + 10);
        //        canvas.Stroke();

        //        canvas.BeginPath();
        //        canvas.MoveTo(x + springX, y + 5);
        //        canvas.LineTo(x + springX + _layoutings.CalculateWidth(spring.SpringConstant), y + 5);
        //        canvas.Stroke();
        //    }
        //}
    }

}
