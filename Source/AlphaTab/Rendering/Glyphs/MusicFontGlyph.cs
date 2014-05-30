using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class MusicFontGlyph : EffectGlyph
    {
        private readonly float _scale;
        private readonly MusicFontSymbol _symbol;

        public MusicFontGlyph(int x, int y, float scale, MusicFontSymbol symbol) : base(x, y)
        {
            _scale = scale;
            _symbol = symbol;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            canvas.FillMusicFontSymbol(cx + X, cy + Y, _scale*Scale, _symbol);
        }
    }
}
