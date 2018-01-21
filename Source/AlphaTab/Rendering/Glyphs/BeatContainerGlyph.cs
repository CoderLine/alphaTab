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

using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Staves;

namespace AlphaTab.Rendering.Glyphs
{
    public class BeatContainerGlyph : Glyph
    {
        public VoiceContainerGlyph VoiceContainer { get; set; }

        public Beat Beat { get; set; }
        public BeatGlyphBase PreNotes { get; set; }
        public BeatOnNoteGlyphBase OnNotes { get; set; }
        public FastList<Glyph> Ties { get; set; }

        public float MinWidth { get; set; }
        public float OnTimeX { get; set; }


        public BeatContainerGlyph(Beat beat, VoiceContainerGlyph voiceContainer)
            : base(0, 0)
        {
            Beat = beat;
            Ties = new FastList<Glyph>();
            VoiceContainer = voiceContainer;
        }

        public virtual void RegisterLayoutingInfo(BarLayoutingInfo layoutings)
        {
            var preBeatStretch = PreNotes.Width + OnNotes.Width / 2;
            layoutings.AddBeatSpring(Beat, MinWidth, preBeatStretch);
            // store sizes for special renderers like the EffectBarRenderer
            layoutings.SetPreBeatSize(Beat, PreNotes.Width);
            layoutings.SetOnBeatSize(Beat, OnNotes.Width);
        }

        public virtual void ApplyLayoutingInfo(BarLayoutingInfo info)
        {
            PreNotes.Width = info.GetPreBeatSize(Beat);
            OnNotes.Width = info.GetOnBeatSize(Beat);
            OnNotes.X = PreNotes.X + PreNotes.Width;
            OnTimeX = OnNotes.X + OnNotes.Width / 2;
            OnNotes.UpdateBeamingHelper();
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
            var i = Beat.Notes.Count - 1;
            while (i >= 0)
            {
                CreateTies(Beat.Notes[i--]);
            }

            MinWidth = PreNotes.Width + OnNotes.Width;
            if (!Beat.IsRest)
            {
                if (OnNotes.BeamingHelper.Beats.Count == 1)
                {
                    // make space for footer 
                    if (Beat.Duration >= Duration.Eighth)
                    {
                        MinWidth += 20 * Scale;
                    }
                }
                else
                {
                    // ensure some space for small notes
                    switch (Beat.Duration)
                    {
                        case Duration.OneHundredTwentyEighth:
                        case Duration.TwoHundredFiftySixth:
                            MinWidth += 10 * Scale;
                            break;
                    }
                }
            }


            Width = MinWidth;
            OnTimeX = OnNotes.X + OnNotes.Width / 2;
        }


        public virtual void ScaleToWidth(float beatWidth)
        {
            OnNotes.UpdateBeamingHelper();
            Width = beatWidth;
        }

        protected virtual void CreateTies(Note n)
        {
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (Beat.Voice.IsEmpty) return;

            var isEmptyGlyph = PreNotes.IsEmpty && OnNotes.IsEmpty && Ties.Count == 0;
            if (isEmptyGlyph) return;

            canvas.BeginGroup("b" + Beat.Id);

            var oldColor = canvas.Color;
            //canvas.Color = new Color((byte)Platform.Random(255), (byte)Platform.Random(255), (byte)Platform.Random(255), 100);
            //canvas.FillRect(cx + X, cy + Y, Width, Renderer.Height);
            //canvas.Color = oldColor;

            //canvas.Color = new Color(200, 0, 0, 100);
            //canvas.StrokeRect(cx + X, cy + Y + 15 * Beat.Voice.Index, Width, 10);
            //canvas.Font = new Font("Arial", 10);
            //canvas.Color = new Color(0, 0, 0);
            //canvas.FillText(Beat.Voice.Index + ":" + Beat.Index, cx + X, cy + Y + 15 * Beat.Voice.Index);

            //if (Beat.Voice.Index == 0)
            //{
            //    canvas.Color = new Color(200, 200, 0, 100);
            //    canvas.StrokeRect(cx + X, cy + Y + PreNotes.Y + 30, Width, 10);
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

            // paint the ties relative to the whole staff, 
            // reason: we have possibly multiple staves involved and need to calculate the correct positions.
            var staffX = cx - VoiceContainer.X - Renderer.X;
            var staffY = cy - VoiceContainer.Y - Renderer.Y;

            for (int i = 0, j = Ties.Count; i < j; i++)
            {
                var t = Ties[i];
                t.Renderer = Renderer;
                t.Paint(staffX, staffY, canvas);
            }

            canvas.EndGroup();
        }

    }
}
