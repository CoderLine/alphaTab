using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreBrushGlyph : Glyph
    {
        private readonly Beat _beat;

        public ScoreBrushGlyph(Beat beat)
            : base(0, 0)
        {
            _beat = beat;
        }

        public override void DoLayout()
        {
            Width = (int)(10 * Scale);
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var scoreBarRenderer = (ScoreBarRenderer)Renderer;
            var lineSize = scoreBarRenderer.LineOffset;
            var res = Renderer.Resources;
            var startY = cy + Y + (int)(scoreBarRenderer.GetNoteY(_beat.MaxNote) - lineSize / 2);
            var endY = cy + Y + scoreBarRenderer.GetNoteY(_beat.MinNote) + lineSize;
            var arrowX = cx + X + Width / 2;
            var arrowSize = 8 * Scale;

            if (_beat.BrushType != BrushType.None)
            {
                if (_beat.BrushType == BrushType.ArpeggioUp || _beat.BrushType == BrushType.ArpeggioDown)
                {
                    var size = (int)(15 * Scale);
                    var steps = (int)(Math.Abs(endY - startY) / size);
                    for (var i = 0; i < steps; i++)
                    {
                        var arrow = new SvgGlyph((int)(3 * Scale), 0, MusicFont.WaveVertical, 1, 1);
                        arrow.Renderer = Renderer;
                        arrow.DoLayout();

                        arrow.Paint(cx + X, startY + (i * size), canvas);
                    }
                }

                if (_beat.BrushType == BrushType.ArpeggioUp)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, endY);
                    canvas.LineTo((int)(arrowX + arrowSize / 2), (int)(endY - arrowSize));
                    canvas.LineTo((int)(arrowX - arrowSize / 2), (int)(endY - arrowSize));
                    canvas.ClosePath();
                    canvas.Fill();
                }
                else if (_beat.BrushType == BrushType.ArpeggioDown)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, startY);
                    canvas.LineTo((int)(arrowX + arrowSize / 2), (int)(startY + arrowSize));
                    canvas.LineTo((int)(arrowX - arrowSize / 2), (int)(startY + arrowSize));
                    canvas.ClosePath();
                    canvas.Fill();
                }
            }
        }
    }
}
