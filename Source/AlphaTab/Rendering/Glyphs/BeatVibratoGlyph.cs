using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class BeatVibratoGlyph : GroupedEffectGlyph
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
            for (var i = 0; i < loops; i++)
            {
                canvas.LineTo(startX + _stepSize / 2, cy + Y + Height);
                canvas.LineTo(startX + _stepSize, cy + Y);
                startX += _stepSize;
            }

            canvas.Stroke();
        }
    }
}
