using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// Effect-Glyphs implementing this public interface get notified
    /// as they are expanded over multiple beats.
    /// </summary>
    public interface IMultiBeatEffectGlyph
    {
        void ExpandTo(Beat beat);
    }
}
