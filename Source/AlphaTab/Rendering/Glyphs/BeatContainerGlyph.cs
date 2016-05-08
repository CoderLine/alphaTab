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
    public class BeatContainerGlyph : Glyph, ISupportsFinalize
    {
        public Beat Beat { get; set; }
        public BeatGlyphBase PreNotes { get; set; }
        public BeatGlyphBase OnNotes { get; set; }
        public BeatGlyphBase PostNotes { get; set; }
        public FastList<Glyph> Ties { get; set; }

        public float MinWidth { get; set; }
        public float MinStretchForce { get; set; }
        public float ScalingFactor { get; set; }

        public BeatContainerGlyph(Beat beat)
            : base(0, 0)
        {
            Beat = beat;
            Ties = new FastList<Glyph>();
        }

        public void FinalizeGlyph(ScoreLayout layout)
        {
            PreNotes.FinalizeGlyph(layout);
            OnNotes.FinalizeGlyph(layout);
            PostNotes.FinalizeGlyph(layout);
        }

        public void RegisterMaxSizes(BarSizeInfo sizes)
        {
            sizes.UpdatePreNoteSize(PreNotes.Width);
            sizes.UpdateOnNoteSize(OnNotes.Width);
            sizes.UpdatePostNoteSize(PostNotes.Width);
            sizes.UpdateMinStretchForce(MinStretchForce);
        }

        public void ApplySizes(BarSizeInfo sizes)
        {
            PreNotes.Width = sizes.PreNoteSize;

            OnNotes.X = PreNotes.X + PreNotes.Width;
            OnNotes.Width = sizes.OnNoteSize;

            PostNotes.X = OnNotes.X + OnNotes.Width;
            PostNotes.Width = sizes.PostNoteSize;

            var newWidth = PostNotes.X + PostNotes.Width;
            if (Width < newWidth)
            {
                Width = newWidth;
            }
        }

        private float CalculateWidth(float force)
        {
            return force * Scale * ScalingFactor;
        }

        public override void DoLayout()
        {
            PreNotes.X = 0;
            PreNotes.Renderer = Renderer;
            PreNotes.Container = this;
            PreNotes.DoLayout();

            OnNotes.X = PreNotes.X + PreNotes.Width;
            OnNotes.Renderer = Renderer;
            OnNotes.Container = this;
            OnNotes.DoLayout();

            PostNotes.X = OnNotes.X + OnNotes.Width;
            PostNotes.Renderer = Renderer;
            PostNotes.Container = this;
            PostNotes.DoLayout();

            var i = Beat.Notes.Count - 1;
            while (i >= 0)
            {
                CreateTies(Beat.Notes[i--]);
            }

            var minDuration = Beat.Voice.Bar.MinDuration.Value;
            var minDurationTicks = minDuration.ToTicks();
            var ticks = (float)Beat.CalculateDuration();

            ScalingFactor = 1 + Std.Log2(ticks / minDurationTicks);

            MinWidth = PreNotes.Width + OnNotes.Width + PostNotes.Width;
            MinStretchForce = MinWidth / (Scale * ScalingFactor);

            ScaleToForce(Renderer.Settings.StretchForce);
        }

        public void ScaleToForce(float force)
        {
            if (force < MinStretchForce)
            {
                force = MinStretchForce;
            }
            Width = CalculateWidth(force);

            var postNotes = Width - PreNotes.Width - OnNotes.Width;
            if (postNotes > 0 && !Beat.IsEmpty)
            {
                PostNotes.ScaleToWidth(postNotes);
            }
        }

        protected virtual void CreateTies(Note n)
        {
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (Beat.Voice.IsEmpty || Beat.IsRest) return; 
            //canvas.Color = new Color(200, 0, 0, 100);
            //canvas.StrokeRect(cx + X, cy + Y + 15 * Beat.Voice.Index, Width, 10);
            //canvas.Font = new Font("Arial", 10);
            //canvas.Color = new Color(0, 0, 0);
            //canvas.FillText(Beat.Voice.Index + ":" + Beat.Index, cx + X, cy + Y + 15 * Beat.Voice.Index);

            PreNotes.Paint(cx + X, cy + Y, canvas);
            if (Beat.Voice.Index == 0)
            {
                canvas.Color = new Color(200, 0, 0, 100);
                canvas.FillRect(cx + X + PreNotes.X, cy + Y + PreNotes.Y, PreNotes.Width, 10);
            }
            OnNotes.Paint(cx + X, cy + Y, canvas);
            if (Beat.Voice.Index == 0)
            {
                canvas.Color = new Color(0, 200, 0, 100);
                canvas.FillRect(cx + X + OnNotes.X, cy + Y + OnNotes.Y + 10, OnNotes.Width, 10);
            }
            PostNotes.Paint(cx + X, cy + Y, canvas);
            if (Beat.Voice.Index == 0)
            {
                canvas.Color = new Color(0, 0, 200, 100);
                canvas.FillRect(cx + X + PostNotes.X, cy + Y + PostNotes.Y + 20, PostNotes.Width, 10);
            }

            for (int i = 0, j = Ties.Count; i < j; i++)
            {
                var t = Ties[i];
                t.Renderer = Renderer;
                t.Paint(cx, cy + Y, canvas);
            }
        }
    }
}
