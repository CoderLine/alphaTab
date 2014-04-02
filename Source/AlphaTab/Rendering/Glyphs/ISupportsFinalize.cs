using AlphaTab.Rendering.Layout;

namespace AlphaTab.Rendering.Glyphs
{
    public interface ISupportsFinalize
    {
        void FinalizeGlyph(ScoreLayout layout);
    }
}