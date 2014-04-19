using System;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class LineRangedGlyph : EffectGlyph
    {
        private const int LineSpacing = 3;
        private const int LineTopPadding = 8;
        private const int LineTopOffset = 6;
        private const int LineSize = 8;
        private bool _isExpanded;
        private readonly string _label;

        public LineRangedGlyph(int x, int y, string label)
            : base(x, y)
        {
            _label = label;
        }

        public override void ExpandTo(Beat beat)
        {
            _isExpanded = true;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            float step = 11 * Scale;

            var res = Renderer.Resources;
            canvas.Font = res.EffectFont;
            canvas.TextAlign = TextAlign.Left;
            var textWidth = canvas.MeasureText(_label);
            canvas.FillText(_label, cx + X, cy + Y);

            // check if we need lines
            if (_isExpanded)
            {
                var lineSpacing = LineSpacing * Scale;
                var startX = cx + X + textWidth + lineSpacing;
                var endX = cx + X + Width - lineSpacing - lineSpacing;
                var lineY = cy + Y + (LineTopPadding * Scale);
                var lineSize = LineSize * Scale;

                if (endX > startX)
                {
                    var lineX = startX;
                    while (lineX < endX)
                    {
                        canvas.BeginPath();
                        canvas.MoveTo(lineX, lineY);
                        canvas.LineTo(Math.Min(lineX + lineSize, endX), lineY);
                        lineX += lineSize + lineSpacing;
                        canvas.Stroke();
                    }
                    canvas.BeginPath();
                    canvas.MoveTo(endX, lineY - LineTopOffset * Scale);
                    canvas.LineTo(endX, lineY + LineTopOffset * Scale);
                    canvas.Stroke();

                }
            }
        }
    }
}
