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
using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Staves;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This glyph acts as container for handling
    /// multiple voice rendering
    /// </summary>
    public class VoiceContainerGlyph : GlyphGroup, ISupportsFinalize
    {
        public const string KeySizeBeat = "Beat";

        public FastList<BeatContainerGlyph> BeatGlyphs { get; set; }

        public float CurrentForce { get; private set; }
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
            var previousWidth = Width;
            var previousForce = CurrentForce;

            Width = width;
            CurrentForce = previousForce * Width / previousWidth;

            if (BeatGlyphs.Count > 0)
            {
                ScaleToForce(CurrentForce);
            }
        }

        public void ScaleToForce(float force)
        {
            Width = Width * force / CurrentForce;

            // calculate the force we need according to the resizing
            var x = 0f;
            for (int i = 0, j = BeatGlyphs.Count; i < j; i++)
            {
                var b = BeatGlyphs[i];
                b.X = x;
                b.ScaleToForce(force);
                x += b.Width;
            }
        }

        public void RegisterLayoutingInfo(BarLayoutingInfo layoutings)
        {
            layoutings.UpdateVoiceSize(Width);
            for (int i = 0, j = BeatGlyphs.Count; i < j; i++)
            {
                var b = BeatGlyphs[i];
                b.RegisterLayoutingInfo(layoutings);
            }
        }

        public void ApplyLayoutingInfo(BarLayoutingInfo layoutings)
        {
            Width = 0;
            for (int i = 0, j = BeatGlyphs.Count; i < j; i++)
            {
                BeatGlyphs[i].X = (i == 0) ? 0 : BeatGlyphs[i - 1].X + BeatGlyphs[i - 1].Width;
                BeatGlyphs[i].ApplyLayoutingInfo(layoutings);
            }

            if (layoutings.MinStretchForce > CurrentForce)
            {
                ScaleToForce(layoutings.MinStretchForce);
            }

            if (BeatGlyphs.Count > 0)
            {
                Width = BeatGlyphs[BeatGlyphs.Count - 1].X + BeatGlyphs[BeatGlyphs.Count - 1].Width;
            }
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
            CurrentForce = Renderer.Settings.StretchForce;
            MinWidth = Width;
        }

        //public float SpaceToForce(int width)
        //{
        //    if (width < MinWidth || BeatGlyphs.Count == 0)
        //    {
        //        return 0;
        //    }

        //    // sort glyphs by size
        //    var glyphs = BeatGlyphs.Clone();
        //    glyphs.Sort((a, b) =>
        //    {
        //        if (a.MinWidth < b.MinWidth)
        //        {
        //            return -1;
        //        }
        //        if (a.MinWidth > b.MinWidth)
        //        {
        //            return 1;
        //        }
        //        return 0;
        //    });

        //    var xMin = MinWidth;
        //    float springConstant = glyphs[0].SpringConstant;
        //    for (int i = 0; i < glyphs.Count; i++)
        //    {
        //        xMin -= glyphs[i].MinWidth;
        //        var force = (width - xMin) / springConstant;
        //        if (i == glyphs.Count - 1 || force < glyphs[i + 1].MinStretchForce)
        //        {
        //            return force;
        //        }
        //        springConstant = 1 / ((1 / springConstant) + (1 / glyphs[i + 1].SpringConstant));
        //    }

        //    return 0;
        //}

        //public float TicksToSpace(int ticks)
        //{
        //    return Phi(ticks) * Renderer.Settings.StretchForce;
        //}

        //private float Phi(int ticks)
        //{
        //    float minDurationTicks = Voice.Bar.MinDuration.Value.ToTicks();
        //    const float a = 1;
        //    return 1 + a * Std.Log2(ticks / minDurationTicks);
        //}

        //public float TicksToSpringConstant(int ticks)
        //{
        //    return 1/(Phi(ticks)*Renderer.Settings.StretchForce);
        //}


        public void FinalizeGlyph(ScoreLayout layout)
        {
            for (int i = 0, j = BeatGlyphs.Count; i < j; i++)
            {
                BeatGlyphs[i].FinalizeGlyph(layout);
            }
        }

        //private static Random Random = new Random();
        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            canvas.Color = new Color((byte)Std.Random(255), (byte)Std.Random(255), (byte)Std.Random(255), 128);
            canvas.FillRect(cx + X, cy + Y, Width, 100);
            for (int i = 0, j = BeatGlyphs.Count; i < j; i++)
            {
                BeatGlyphs[i].Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
