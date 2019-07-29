using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TempoGlyph : EffectGlyph
    {
        private readonly int _tempo;

        public TempoGlyph(float x, float y, int tempo)
            : base(x, y)
        {
            _tempo = tempo;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 25 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Font = res.MarkerFont;

            canvas.FillMusicFontSymbol(cx + X, cy + Y + Height * 0.8f, Scale * 0.75f, MusicFontSymbol.Tempo);
            canvas.FillText("= " + _tempo, cx + X + Height / 2, cy + Y + canvas.Font.Size / 2);
        }
    }
}
