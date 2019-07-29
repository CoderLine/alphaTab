using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class NoteVibratoGlyph : GroupedEffectGlyph
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
}
