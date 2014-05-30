using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class DynamicsGlyph : EffectGlyph
    {
        private const float GlyphScale = 0.8f;

        private readonly DynamicValue _dynamics;

        public DynamicsGlyph(int x, int y, DynamicValue dynamics)
            : base(x, y)
        {
            _dynamics = dynamics;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            Glyph[] glyphs;

            switch (_dynamics)
            {
                case DynamicValue.PPP:
                    glyphs = new[] { P, P, P };
                    break;
                case DynamicValue.PP:
                    glyphs = new[] { P, P };
                    break;
                case DynamicValue.P:
                    glyphs = new[] { P };
                    break;
                case DynamicValue.MP:
                    glyphs = new[] { M, P };
                    break;
                case DynamicValue.MF:
                    glyphs = new[] { M, F };
                    break;
                case DynamicValue.F:
                    glyphs = new[] { F };
                    break;
                case DynamicValue.FF:
                    glyphs = new[] { F, F };
                    break;
                case DynamicValue.FFF:
                    glyphs = new[] { F, F, F };
                    break;
                default:
                    return;
            }

            var glyphWidth = 0;
            foreach (var g in glyphs)
            {
                glyphWidth += g.Width;
            }

            var startX = (Width - glyphWidth) / 2;

            foreach (var g in glyphs)
            {
                g.X = startX;
                g.Y = 0;
                g.Renderer = Renderer;

                g.Paint(cx + X, cy + Y, canvas);
                startX += g.Width;
            }
        }

        private Glyph P
        {
            get
            {
                var p = new MusicFontGlyph(0, 0, GlyphScale, MusicFontSymbol.DynamicP);
                p.Width = (int)(7 * Scale);
                return p;
            }
        }

        private Glyph M
        {
            get
            {
                var m = new MusicFontGlyph(0, 0, GlyphScale, MusicFontSymbol.DynamicM);
                m.Width = (int)(7 * Scale);
                return m;
            }
        }

        private Glyph F
        {
            get
            {
                var f = new MusicFontGlyph(0, 0, GlyphScale, MusicFontSymbol.DynamicF);
                f.Width = (int)(7 * Scale);
                return f;
            }
        }
    }
}
