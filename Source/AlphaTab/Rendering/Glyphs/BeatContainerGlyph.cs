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
            sizes.UpdatePostNoteSize(PostNotes.Width);
        }

        public void ApplySizes(BarSizeInfo sizes)
        {
            PreNotes.Width = sizes.PreNoteSize;

            OnNotes.X = PreNotes.X + PreNotes.Width;

            PostNotes.X = OnNotes.X + OnNotes.Width;
            PostNotes.Width = sizes.PostNoteSize;

            Width = CalculateWidth();
        }

        private float CalculateWidth()
        {
            var minDuration = Beat.Voice.Bar.MinDuration.Value;
            var minDurationTicks = minDuration.ToTicks();
            var ticks = (float)Beat.CalculateDuration();

            var factor = 1 + Std.Log2(ticks / minDurationTicks);
            //switch (minDuration)
            //{
            //    case Duration.Whole:
            //        factor = 0.5f;
            //        break;
            //    case Duration.Half:
            //        factor = 0.3f;
            //        break;
            //    case Duration.Quarter:
            //        factor = 1f;
            //        break;
            //    case Duration.Eighth:
            //        factor = 1f;
            //        break;
            //    case Duration.Sixteenth:
            //        factor = 1f;
            //        break;
            //    case Duration.ThirtySecond:
            //        factor = 1f;
            //        break;
            //    case Duration.SixtyFourth:
            //        factor = 1f;
            //        break;
            //}

            //var quarters = Beat.CalculateDuration() / MidiUtils.QuarterTime;
            var width = 30 * Scale * factor;
            Width = width;
            Console.WriteLine("Ticks:" + ticks + ", MinDuration:" + minDurationTicks + ",Factor: " + factor + ", Width:" + width);


            return width;
        }

        public override void DoLayout()
        {
            PreNotes.X = 0;
            PreNotes.Index = 0;
            PreNotes.Renderer = Renderer;
            PreNotes.Container = this;
            PreNotes.DoLayout();

            OnNotes.X = PreNotes.X + PreNotes.Width;
            OnNotes.Index = 1;
            OnNotes.Renderer = Renderer;
            OnNotes.Container = this;
            OnNotes.DoLayout();

            PostNotes.X = OnNotes.X + OnNotes.Width;
            PostNotes.Index = 2;
            PostNotes.Renderer = Renderer;
            PostNotes.Container = this;
            PostNotes.DoLayout();

            var i = Beat.Notes.Count - 1;
            while (i >= 0)
            {
                CreateTies(Beat.Notes[i--]);
            }

            Width = CalculateWidth();
        }

        protected virtual void CreateTies(Note n)
        {
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            //canvas.Color = new Color(200, 0, 0, 100);
            //canvas.StrokeRect(cx + X, cy + Y + 15 * Beat.Voice.Index, Width, 10);
            //canvas.Font = new Font("Arial", 10);
            //canvas.Color = new Color(0, 0, 0);
            //canvas.FillText(Beat.Voice.Index + ":" + Beat.Index, cx + X, cy + Y + 15 * Beat.Voice.Index);

            PreNotes.Paint(cx + X, cy + Y, canvas);
            //canvas.Color = new Color(200, 0, 0, 100);
            //canvas.FillRect(cx + X + PreNotes.X, cy + Y + PreNotes.Y, PreNotes.Width, 10);

            OnNotes.Paint(cx + X, cy + Y, canvas);
            //canvas.Color new Color(0, 200, 0, 100);
            //canvas.FillRect(cx + X + OnNotes.X, cy + Y + OnNotes.Y + 10, OnNotes.Width, 10);

            PostNotes.Paint(cx + X, cy + Y, canvas);
            //canvas.Color = new Color(0, 0, 200, 100);
            //canvas.FillRect(cx + X + PostNotes.X, cy + Y + PostNotes.Y + 20, PostNotes.Width, 10);

            for (int i = 0, j = Ties.Count; i < j; i++)
            {
                var t = Ties[i];
                t.Renderer = Renderer;
                t.Paint(cx, cy + Y, canvas);
            }
        }
    }
}
