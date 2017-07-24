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
namespace AlphaTab.Rendering.Glyphs
{
    public abstract class TimeSignatureGlyph : GlyphGroup
    {
        private readonly int _numerator;
        private readonly int _denominator;
        private readonly bool _isCommon;

        public TimeSignatureGlyph(float x, float y, int numerator, int denominator, bool isCommon)
            : base(x, y)
        {
            _numerator = numerator;
            _denominator = denominator;
            _isCommon = isCommon;
        }

        protected abstract float CommonY { get; }
        protected abstract float NumeratorY { get; }
        protected abstract float DenominatorY { get; }
        protected abstract float CommonScale { get; }
        protected abstract float NumberScale { get; }

        public override void DoLayout()
        {
            if (_isCommon && _numerator == 2 && _denominator == 2)
            {
                var common = new MusicFontGlyph(0, CommonY, CommonScale, MusicFontSymbol.TimeSignatureCutCommon);
                common.Width = 14 * Scale;
                AddGlyph(common);
                base.DoLayout();
            }
            else if (_isCommon && _numerator == 4 && _denominator == 4)
            {
                var common = new MusicFontGlyph(0, CommonY, CommonScale, MusicFontSymbol.TimeSignatureCommon);
                common.Width = 14 * Scale;
                AddGlyph(common);
                base.DoLayout();
            }
            else
            {
                var numerator = new NumberGlyph(0, NumeratorY, _numerator, NumberScale);
                var denominator = new NumberGlyph(0, DenominatorY, _denominator, NumberScale);

                AddGlyph(numerator);
                AddGlyph(denominator);

                base.DoLayout();

                for (int i = 0, j = Glyphs.Count; i < j; i++)
                {
                    var g = Glyphs[i];
                    g.X = (Width - g.Width) / 2;
                }
            }
        }
    }

    public class ScoreTimeSignatureGlyph : TimeSignatureGlyph
    {
        protected override float CommonY
        {
            get
            {
                var renderer = (ScoreBarRenderer)Renderer;
                return renderer.GetScoreY(4);
            }
        }

        protected override float NumeratorY
        {
            get
            {
                return 2 * Scale;
            }
        }

        protected override float DenominatorY
        {
            get
            {
                return 20 * Scale;
            }
        }

        protected override float CommonScale
        {
            get
            {
                return 1;
            }
        }

        protected override float NumberScale
        {
            get
            {
                return 1;
            }
        }

        public ScoreTimeSignatureGlyph(float x, float y, int numerator, int denominator, bool isCommon) 
            : base(x, y, numerator, denominator, isCommon)
        {
        }
    }

    public class TabTimeSignatureGlyph : TimeSignatureGlyph
    {
        protected override float CommonY
        {
            get
            {
                var renderer = (TabBarRenderer)Renderer;
                return renderer.GetTabY(0);
            }
        }

        protected override float NumeratorY
        {
            get
            {
                var renderer = (TabBarRenderer)Renderer;
                var offset = renderer.Bar.Staff.Track.Tuning.Length <= 4 ? 1 / 4f : 1 / 3f;
                return renderer.LineOffset * renderer.Bar.Staff.Track.Tuning.Length * offset * Scale;

            }
        }

        protected override float DenominatorY
        {
            get
            {
                var renderer = (TabBarRenderer)Renderer;
                var offset = renderer.Bar.Staff.Track.Tuning.Length <= 4 ? 3 / 5f : 3 / 5f;
                return renderer.LineOffset * renderer.Bar.Staff.Track.Tuning.Length * offset * Scale;
            }
        }

        protected override float CommonScale
        {
            get
            {
                return 1;
            }
        }

        protected override float NumberScale
        {
            get
            {
                var renderer = (TabBarRenderer)Renderer;
                if (renderer.Bar.Staff.Track.Tuning.Length <= 4)
                {
                    return 0.75f;
                }
                else
                {
                    return 1;
                }
            }
        }

        public TabTimeSignatureGlyph(float x, float y, int numerator, int denominator, bool isCommon) 
            : base(x, y, numerator, denominator, isCommon)
        {
        }
    }
}
