using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class BeatVibratoGlyph : GroupedEffectGlyph
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

        protected override float CalculateEndX(BarRendererBase renderer, float cx, GroupedEffectGlyph lastGlyph, BeatXPosition endPosition)
        {
            var endBeat = lastGlyph.Beat.NextBeat;
            if (endBeat == null)
            {
                return base.CalculateEndX(renderer, cx, lastGlyph, endPosition);
            }

            // get the start position of the next beat
            var endBeatRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar(Renderer.Staff.StaveId, endBeat.Voice.Bar);
            if (endBeatRenderer == null)
            {
                return base.CalculateEndX(renderer, cx, lastGlyph, endPosition);
            }

            var endBeatX = endBeatRenderer.GetBeatX(endBeat, BeatXPosition.MiddleNotes);
            return cx + endBeatRenderer.X + endBeatX;
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