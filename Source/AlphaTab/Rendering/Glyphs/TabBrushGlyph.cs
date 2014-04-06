using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBrushGlyph : Glyph
    {
        private readonly Beat _beat;

        public TabBrushGlyph(Beat beat)
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
            TabBarRenderer tabBarRenderer = (TabBarRenderer)Renderer;
            var res = Renderer.Resources;
            var startY = cy + X + (int)(tabBarRenderer.GetNoteY(_beat.MaxNote) - res.TablatureFont.Size / 2);
            var endY = cy + Y + tabBarRenderer.GetNoteY(_beat.MinNote) + res.TablatureFont.Size / 2;
            var arrowX = cx + X + Width / 2;
            var arrowSize = 8 * Scale;

            canvas.Color = res.MainGlyphColor;
            if (_beat.BrushType != BrushType.None)
            {
                if (_beat.BrushType == BrushType.BrushUp || _beat.BrushType == BrushType.BrushDown)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, startY);
                    canvas.LineTo(arrowX, endY);
                    canvas.Stroke();
                }
                else
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

                if (_beat.BrushType == BrushType.BrushUp || _beat.BrushType == BrushType.ArpeggioUp)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, endY);
                    canvas.LineTo(arrowX + arrowSize / 2, endY - arrowSize);
                    canvas.LineTo(arrowX - arrowSize / 2, endY - arrowSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
                else
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, startY);
                    canvas.LineTo(arrowX + arrowSize / 2, startY + arrowSize);
                    canvas.LineTo(arrowX - arrowSize / 2, startY + arrowSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
            }
        }
    }
}
