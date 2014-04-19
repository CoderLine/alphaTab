using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// Effect-Glyphs implementing this public interface get notified
    /// as they are expanded over multiple beats.
    /// </summary>
    public class EffectGlyph : Glyph
    {
        protected EffectGlyph(int x, int y)
            : base(x, y)
        {
        }

        public virtual void ExpandTo(Beat beat)
        {
            
        }
    }
}
