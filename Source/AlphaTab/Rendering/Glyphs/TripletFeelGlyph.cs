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
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TripletFeelGlyph : EffectGlyph
    {
        private const float NoteScale = 0.40f;
        private const int NoteHeight = 12;
        private const int NoteSeparation = 12;
        private const int BarHeight = 2;
        private const int BarSeparation = 3;

        private readonly TripletFeel _tripletFeel;

        public TripletFeelGlyph(TripletFeel tripletFeel) : base(0, 0)
        {
            _tripletFeel = tripletFeel;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 25 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            cx += X;
            cy += Y;

            var noteY = cy + Height * 0.75f;
            canvas.Font = Renderer.Resources.EffectFont;

            canvas.FillText("(", cx, cy + Height * 0.3f);

            var leftNoteX = cx + (10 * Scale);
            var rightNoteX = cx + (40 * Scale);

            switch (_tripletFeel)
            {
                case TripletFeel.NoTripletFeel:
                    RenderBarNote(leftNoteX, noteY, NoteScale, canvas, new[] { BarType.Full });
                    RenderBarNote(rightNoteX, noteY, NoteScale, canvas, new[] { BarType.Full });
                    break;

                case TripletFeel.Triplet8th:
                    RenderBarNote(leftNoteX, noteY, NoteScale, canvas, new[] { BarType.Full });

                    canvas.FillMusicFontSymbol(rightNoteX, noteY, NoteScale, MusicFontSymbol.Tempo);
                    canvas.FillMusicFontSymbol(rightNoteX + (NoteSeparation * Scale), noteY, NoteScale, MusicFontSymbol.NoteEighth);

                    RenderTriplet(rightNoteX, cy, canvas);
                    break;

                case TripletFeel.Triplet16th:
                    RenderBarNote(leftNoteX, noteY, NoteScale, canvas, new[] { BarType.Full, BarType.Full });

                    RenderBarNote(rightNoteX, noteY, NoteScale, canvas, new[] { BarType.Full, BarType.PartialRight });
                    RenderTriplet(rightNoteX, cy, canvas);
                    break;

                case TripletFeel.Dotted8th:
                    RenderBarNote(leftNoteX, noteY, NoteScale, canvas, new[] { BarType.Full });

                    RenderBarNote(rightNoteX, noteY, NoteScale, canvas, new[] { BarType.Full, BarType.PartialRight });
                    canvas.FillCircle(rightNoteX + (9 * Scale), noteY, Scale);
                    break;

                case TripletFeel.Dotted16th:
                    RenderBarNote(leftNoteX, noteY, NoteScale, canvas, new[] { BarType.Full, BarType.Full });

                    RenderBarNote(rightNoteX, noteY, NoteScale, canvas, new[] { BarType.Full, BarType.Full, BarType.PartialRight });
                    canvas.FillCircle(rightNoteX + (9 * Scale), noteY, Scale);
                    break;

                case TripletFeel.Scottish8th:
                    RenderBarNote(leftNoteX, noteY, NoteScale, canvas, new[] { BarType.Full });

                    RenderBarNote(rightNoteX, noteY, NoteScale, canvas, new[] { BarType.Full, BarType.PartialLeft, });
                    canvas.FillCircle(rightNoteX + (NoteSeparation * Scale) + (8 * Scale), noteY, Scale);
                    break;

                case TripletFeel.Scottish16th:
                    RenderBarNote(leftNoteX, noteY, NoteScale, canvas, new[] { BarType.Full, BarType.Full });

                    RenderBarNote(rightNoteX, noteY, NoteScale, canvas, new[] { BarType.Full, BarType.Full, BarType.PartialLeft, });
                    canvas.FillCircle(rightNoteX + (NoteSeparation * Scale) + (8 * Scale), noteY, Scale);
                    break;
            }

            canvas.FillText("=", cx + (30 * Scale), cy + (5 * Scale));
            canvas.FillText(")", cx + (65 * Scale), cy + Height * 0.3f);
        }

        private enum BarType
        {
            Full,
            PartialLeft,
            PartialRight
        }

        private void RenderBarNote(float cx, float noteY, float noteScale, ICanvas canvas, BarType[] bars)
        {
            canvas.FillMusicFontSymbol(cx, noteY, noteScale, MusicFontSymbol.Tempo);
            var partialBarWidth = (NoteSeparation / 2f) * Scale;
            for (int i = 0; i < bars.Length; i++)
            {
                switch (bars[i])
                {
                    case BarType.Full:
                        canvas.FillRect(cx + (4 * Scale), noteY - (NoteHeight * Scale) + (BarSeparation * Scale * i), NoteSeparation * Scale, BarHeight * Scale);
                        break;
                    case BarType.PartialLeft:
                        canvas.FillRect(cx + (4 * Scale), noteY - (NoteHeight * Scale) + (BarSeparation * Scale * i), partialBarWidth, BarHeight * Scale);
                        break;
                    case BarType.PartialRight:
                        canvas.FillRect(cx + (4 * Scale) + partialBarWidth, noteY - (NoteHeight * Scale) + (BarSeparation * Scale * i), partialBarWidth, BarHeight * Scale);
                        break;
                }
            }
            canvas.FillMusicFontSymbol(cx + (NoteSeparation * Scale), noteY, noteScale, MusicFontSymbol.Tempo);
        }

        private void RenderTriplet(float cx, float cy, ICanvas canvas)
        {
            cy += 2 * Scale;
            var font = Renderer.Resources.EffectFont;
            canvas.Font = new Font(font.Family, font.Size * 0.8f, font.Style);

            var rightX = cx + NoteSeparation * Scale + 3 * Scale;

            canvas.BeginPath();
            canvas.MoveTo(cx, cy + (3 * Scale));
            canvas.LineTo(cx, cy);
            canvas.LineTo(cx + (5 * Scale), cy);

            canvas.MoveTo(rightX + (5 * Scale), cy + (3 * Scale));
            canvas.LineTo(rightX + (5 * Scale), cy);
            canvas.LineTo(rightX, cy);

            canvas.Stroke();

            canvas.FillText("3", cx + (7 * Scale), cy - (10 * Scale));

            canvas.Font = font;
        }
    }
}
