using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class TempoGlyph : EffectGlyph
    {
        private readonly int _tempo;

        public TempoGlyph(int x, int y, int tempo)
            : base(x, y)
        {
            _tempo = tempo;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Font = res.MarkerFont;

            canvas.FillMusicFontSymbol(cx+ X, cy + Y, 1, MusicFontSymbol.Tempo);
            canvas.FillText("" + _tempo, cx + X + (30 * Scale), cy + X + (7 * Scale));
        }
    }
}
