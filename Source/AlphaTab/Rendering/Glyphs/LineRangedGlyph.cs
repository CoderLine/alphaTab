using System;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class LineRangedGlyph : GroupedEffectGlyph
    {
        public const float LineSpacing = 3;
        public const float LineTopPadding = 4;
        public const float LineTopOffset = 5;
        public const float LineSize = 8;
        private readonly string _label;

        public LineRangedGlyph(string label)
            : base(BeatXPosition.OnNotes)
        {
            _label = label;
        }

        public override void DoLayout()
        {
            if (Renderer.Settings.Notation.ExtendLineEffectsToBeatEnd)
            {
                EndPosition = BeatXPosition.EndBeat;
                ForceGroupedRendering = true;
            }

            base.DoLayout();
            Height = Renderer.Resources.EffectFont.Size;
        }

        protected override void PaintNonGrouped(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Font = res.EffectFont;
            var x = canvas.TextAlign;
            canvas.TextAlign = TextAlign.Center;
            canvas.FillText(_label, cx + X, cy + Y);
            canvas.TextAlign = x;
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            PaintNonGrouped(cx, cy, canvas);

            var lineSpacing = LineSpacing * Scale;
            var textWidth = canvas.MeasureText(_label);
            var startX = cx + X + textWidth / 2f + lineSpacing;
            var lineY = cy + Y + LineTopPadding * Scale;
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
