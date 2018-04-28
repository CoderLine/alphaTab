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

namespace AlphaTab.Rendering.Glyphs
{
    public class NoteVibratoGlyph : GroupedEffectGlyph
    {
        public const int SlightWaveOffset = 10;
        public const float SlightWaveSize = 8.5f;

        private readonly VibratoType _type;
        private readonly float _scale;
        private MusicFontSymbol _symbol;
        private float _symbolSize;
        private float _symbolOffset;

        public NoteVibratoGlyph(float x, float y, VibratoType type, float scale = 1.2f)
            : base(BeatXPosition.EndBeat)
        {
            _type = type;
            _scale = scale;
            X = x;
            Y = y;
        }

        public override void DoLayout()
        {
            base.DoLayout();

            var symbolHeight = 0f;
            switch (_type)
            {
                case VibratoType.Slight:
                    _symbol = MusicFontSymbol.WaveHorizontalSlight;
                    _symbolSize = SlightWaveSize * _scale;
                    _symbolOffset = SlightWaveOffset * _scale;
                    symbolHeight = 6 * _scale;
                    break;
                case VibratoType.Wide:
                    _symbol = MusicFontSymbol.WaveHorizontalWide;
                    _symbolSize = 10 * _scale;
                    _symbolOffset = 7 * _scale;
                    symbolHeight = 10 * _scale;
                    break;
            }

            Height = symbolHeight * Scale;
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            var startX = cx + X;
            var width = endX - startX;
            var step = _symbolSize * Scale;
            var loops = (int)Math.Max(1, width / step);

            var loopX = 0f;
            for (var i = 0; i < loops; i++)
            {
                canvas.FillMusicFontSymbol(cx + X + loopX, cy + Y + _symbolOffset, _scale, _symbol);
                loopX += step;
            }
        }
    }

    public class BeatVibratoGlyph : GroupedEffectGlyph
    {
        private readonly VibratoType _type;
        private float _stepSize;

        public BeatVibratoGlyph(VibratoType type)
            : base(BeatXPosition.EndBeat)
        {
            _type = type;
        }

        public override void DoLayout()
        {
            base.DoLayout();

            switch (_type)
            {
                case VibratoType.Slight:
                    _stepSize = 12 * Scale;
                    break;
                case VibratoType.Wide:
                    _stepSize = 23 * Scale;
                    break;
            }

            Height = 18 * Scale;
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            var startX = cx + X;
            var width = endX - startX;
            var loops = (int)Math.Max(1, width / _stepSize);

            canvas.BeginPath();
            canvas.MoveTo(startX, cy + Y);
            for (int i = 0; i < loops; i++)
            {
                canvas.LineTo(startX + _stepSize / 2, cy + Y + Height);
                canvas.LineTo(startX + _stepSize, cy + Y);
                startX += _stepSize;
            }

            canvas.Stroke();
        }
    }
}
