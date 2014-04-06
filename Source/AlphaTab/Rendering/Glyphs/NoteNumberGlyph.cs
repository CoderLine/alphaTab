using System.Globalization;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class NoteNumberGlyph : Glyph
    {
        public const int Padding = 0;

        private readonly string _noteString;
        private readonly bool _isGrace;

        public NoteNumberGlyph(int x, int y, Note n, bool isGrace)
            : base(x, y)
        {
            _isGrace = isGrace;
            _isGrace = isGrace;
            if (!n.IsTieDestination)
            {
                _noteString = n.IsDead ? "X" : n.Fret.ToString();
                if (n.IsGhost)
                {
                    _noteString = "(" + _noteString + ")";
                }
            }
            else if (n.Beat.Index == 0)
            {
                _noteString = "(" + n.TieOrigin.Fret + ")";
            }
            else
            {
                _noteString = "";
            }
        }

        public override void DoLayout()
        {
            var scoreRenderer = Renderer.Layout.Renderer;
            scoreRenderer.Canvas.Font = _isGrace
                ? scoreRenderer.RenderingResources.GraceFont
                : scoreRenderer.RenderingResources.TablatureFont;
            Width = (int)(10 * Scale);
        }

        public void CalculateWidth()
        {
            Width = (int)(Renderer.Layout.Renderer.Canvas.MeasureText(_noteString));
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            if (_noteString != null)
            {
                canvas.FillText(_noteString.ToLower(), cx + X + (Padding * Scale), cy + Y);
            }
        }
    }
}
