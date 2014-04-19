using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class LetRingEffectInfo : NoteEffectInfoBase
    {
        protected override bool ShouldCreateGlyphForNote(EffectBarRenderer renderer, Note note)
        {
            return note.IsLetRing;
        }

        public override int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(15 * renderer.Scale);
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.GroupedOnBeatToPostBeat; }
        }

        public override EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new LineRangedGlyph(0, 0, "LetRing");
        }
    }
}