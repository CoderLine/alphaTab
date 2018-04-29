/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class OttavaGlyph : GroupedEffectGlyph
    {
        private Ottavia _ottava;
        private bool _aboveStaff;

        public OttavaGlyph(Ottavia ottava, bool aboveStaff)
            : base(BeatXPosition.PostNotes)
        {
            _ottava = ottava;
            _aboveStaff = aboveStaff;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 13 * Scale;
        }

        protected override void PaintNonGrouped(float cx, float cy, ICanvas canvas)
        {
            PaintOttava(cx, cy, canvas);
        }

        private float PaintOttava(float cx, float cy, ICanvas canvas)
        {
            float size = 0;
            switch (_ottava)
            {
                case Ottavia._15ma:
                    size = 37 * Scale;
                    canvas.FillMusicFontSymbol(cx + X - size / 2, cy + Y + Height, 0.8f, MusicFontSymbol.Ottava15ma);
                    break;
                case Ottavia._8va:
                    size = 26 * Scale;
                    canvas.FillMusicFontSymbol(cx + X - size / 2, cy + Y + Height, 0.8f, MusicFontSymbol.Ottava8va);
                    break;
                case Ottavia._8vb:
                    size = 23 * Scale;
                    canvas.FillMusicFontSymbol(cx + X - size / 2, cy + Y + Height, 0.8f, MusicFontSymbol.Ottava8vb);
                    break;
                case Ottavia._15mb:
                    size = 36 * Scale;
                    // NOTE: SMUFL does not have a glyph for 15mb so we build it
                    canvas.FillMusicFontSymbols(cx + X - size / 2, cy + Y + Height, 0.8f, new[]
                    {
                        MusicFontSymbol.Ottava15,
                        MusicFontSymbol.OttavaMBaseline,
                        MusicFontSymbol.OttavaBBaseline,
                    });
                    break;
            }

            return size / 2;
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            var size = PaintOttava(cx, cy, canvas);

            var lineSpacing = LineRangedGlyph.LineSpacing * Scale;
            var startX = cx + X + size + lineSpacing;
            var lineY = cy + Y;
            lineY += _aboveStaff ? 2 * Scale : Height - 2 * Scale;

            var lineSize = LineRangedGlyph.LineSize * Scale;


            if (endX > startX)
            {
                var lineX = startX;
                while (lineX < endX)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(lineX, (int)lineY);
                    canvas.LineTo(Math.Min(lineX + lineSize, endX), (int)lineY);
                    lineX += lineSize + lineSpacing;
                    canvas.Stroke();
                }

                canvas.BeginPath();
                if (_aboveStaff)
                {
                    canvas.MoveTo(endX, lineY);
                    canvas.LineTo(endX, cy + Y + Height);
                }
                else
                {
                    canvas.MoveTo(endX, lineY);
                    canvas.LineTo(endX, cy + Y);
                }

                canvas.Stroke();
            }
        }

    }

    public class LineRangedGlyph : GroupedEffectGlyph
    {
        public const float LineSpacing = 3;
        public const float LineTopPadding = 8;
        public const float LineTopOffset = 6;
        public const float LineSize = 8;
        private readonly string _label;

        public LineRangedGlyph(string label)
            : base(BeatXPosition.PostNotes)
        {
            _label = label;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = Renderer.Resources.EffectFont.Size;
        }

        protected override void PaintNonGrouped(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Font = res.EffectFont;
            canvas.TextAlign = TextAlign.Left;
            canvas.FillText(_label, cx + X, cy + Y);
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            PaintNonGrouped(cx, cy, canvas);

            var lineSpacing = LineSpacing * Scale;
            var textWidth = canvas.MeasureText(_label);
            var startX = cx + X + textWidth + lineSpacing;
            var lineY = cy + Y + (LineTopPadding * Scale);
            var lineSize = LineSize * Scale;

            if (endX > startX)
            {
                var lineX = startX;
                while (lineX < endX)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(lineX, (int)lineY);
                    canvas.LineTo(Math.Min(lineX + lineSize, endX), (int)lineY);
                    lineX += lineSize + lineSpacing;
                    canvas.Stroke();
                }
                canvas.BeginPath();
                canvas.MoveTo(endX, (int)(lineY - LineTopOffset * Scale));
                canvas.LineTo(endX, (int)(lineY + LineTopOffset * Scale));
                canvas.Stroke();
            }
        }
    }
}
