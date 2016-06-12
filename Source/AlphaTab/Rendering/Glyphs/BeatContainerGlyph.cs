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
        public VoiceContainerGlyph VoiceContainer { get; set; }

        public Beat Beat { get; set; }
        public BeatGlyphBase PreNotes { get; set; }
        public BeatOnNoteGlyphBase OnNotes { get; set; }
        public BeatGlyphBase PostNotes { get; set; }
        public FastList<Glyph> Ties { get; set; }

        public float MinWidth { get; set; }
        public float MinStretchForce { get; set; }
        public float OnTimeX { get; set; }

        public BeatContainerGlyph(Beat beat, VoiceContainerGlyph voiceContainer)
            : base(0, 0)
        {
            Beat = beat;
            Ties = new FastList<Glyph>();
            VoiceContainer = voiceContainer;
        }

        public void FinalizeGlyph(ScoreLayout layout)
        {
            PreNotes.FinalizeGlyph(layout);
            OnNotes.FinalizeGlyph(layout);
            PostNotes.FinalizeGlyph(layout);
        }

        public void RegisterLayoutingInfo(BarLayoutingInfo layoutings)
        {
            var preBeatStretch = PreNotes.Width + OnNotes.Width / 2;
            var postBeatStretch = OnNotes.Width / 2 + PostNotes.Width;
            layoutings.AddBeatSpring(Beat, MinWidth, preBeatStretch, postBeatStretch);
        }

        public void ApplyLayoutingInfo(BarLayoutingInfo layoutings)
        {
            //PreNotes.Width = layoutings.PreNoteSize;

            //OnNotes.X = PreNotes.X + PreNotes.Width;
            //OnNotes.Width = layoutings.OnNoteSize;

            //PostNotes.X = OnNotes.X + OnNotes.Width;
            //PostNotes.Width = layoutings.PostNoteSize;

            //var newWidth = PostNotes.X + PostNotes.Width;
            //if (Width < newWidth)
            //{
            //    Width = newWidth;
            //}
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

            MinWidth = PreNotes.Width + OnNotes.Width + PostNotes.Width;
            Width = MinWidth;
            OnTimeX = OnNotes.X + OnNotes.Width / 2;
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

            //if (Beat.Voice.Index == 0)
            //{
            //    canvas.Color = new Color(200, 200, 0, 100);
            //    canvas.StrokeRect(cx + X, cy + Y + PreNotes.Y - 10, Width, 10);
            //}


            PreNotes.Paint(cx + X, cy + Y, canvas);
            //if (Beat.Voice.Index == 0)
            //{
            //    canvas.Color = new Color(200, 0, 0, 100);
            //    canvas.StrokeRect(cx + X + PreNotes.X, cy + Y + PreNotes.Y, PreNotes.Width, 10);
            //}
            OnNotes.Paint(cx + X, cy + Y, canvas);
            //if (Beat.Voice.Index == 0)
            //{
            //    canvas.Color = new Color(0, 200, 0, 100);
            //    canvas.StrokeRect(cx + X + OnNotes.X, cy + Y + OnNotes.Y + 10, OnNotes.Width, 10);
            //}
            PostNotes.Paint(cx + X, cy + Y, canvas);
            //if (Beat.Voice.Index == 0)
            //{
            //    canvas.Color = new Color(0, 0, 200, 100);
            //    canvas.StrokeRect(cx + X + PostNotes.X, cy + Y + PostNotes.Y + 20, PostNotes.Width, 10);
            //}

            for (int i = 0, j = Ties.Count; i < j; i++)
            {
                var t = Ties[i];
                t.Renderer = Renderer;
                t.Paint(cx, cy + Y, canvas);
            }
        }
    }
}
