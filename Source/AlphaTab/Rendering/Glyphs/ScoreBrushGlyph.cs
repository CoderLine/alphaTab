using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class ScoreBrushGlyph : Glyph
    {
        private readonly Beat _beat;

        public ScoreBrushGlyph(Beat beat)
            : base(0, 0)
        {
            _beat = beat;
        }

        public override void DoLayout()
        {
            Width = 10 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            //TODO: Create webfont version

            var scoreBarRenderer = (ScoreBarRenderer)Renderer;
            var lineSize = scoreBarRenderer.LineOffset;
            var startY = cy + Y + (scoreBarRenderer.GetNoteY(_beat.MaxNote) - lineSize);
            var endY = cy + Y + scoreBarRenderer.GetNoteY(_beat.MinNote) + lineSize;
            var arrowX = cx + X + Width / 2;
            var arrowSize = 8 * Scale;

            if (_beat.BrushType != BrushType.None)
            {
                if (_beat.BrushType == BrushType.ArpeggioUp)
                {
                    var lineStartY = startY - arrowSize;
                    var lineEndY = endY - arrowSize;

                    canvas.BeginRotate(cx + X + 2 * Scale, lineEndY, -90);
                    var glyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight);
                    glyph.Renderer = Renderer;
                    glyph.DoLayout();
                    glyph.Width = Math.Abs(lineEndY - lineStartY);
                    glyph.Paint(0, 0, canvas);
                    canvas.EndRotate();

                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, endY);
                    canvas.LineTo(arrowX + arrowSize / 2, endY - arrowSize);
                    canvas.LineTo(arrowX - arrowSize / 2, endY - arrowSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
                else if (_beat.BrushType == BrushType.ArpeggioDown)
                {
                    var lineStartY = startY + arrowSize;
                    var lineEndY = endY + arrowSize;

                    canvas.BeginRotate(cx + X + 7 * Scale, lineStartY, 90);
                    var glyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight);
                    glyph.Renderer = Renderer;
                    glyph.DoLayout();
                    glyph.Width = Math.Abs(lineEndY - lineStartY);
                    glyph.Paint(0, 0, canvas);
                    canvas.EndRotate();

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
