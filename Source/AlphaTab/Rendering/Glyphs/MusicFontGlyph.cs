using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class MusicFontGlyph : EffectGlyph
    {
        protected readonly float GlyphScale;
        protected readonly MusicFontSymbol Symbol;

        public MusicFontGlyph(float x, float y, float glyphScale, MusicFontSymbol symbol)
            : base(x, y)
        {
            GlyphScale = glyphScale;
            Symbol = symbol;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            canvas.FillMusicFontSymbol(cx + X, cy + Y, GlyphScale*Scale, Symbol);
        }
    }
}
