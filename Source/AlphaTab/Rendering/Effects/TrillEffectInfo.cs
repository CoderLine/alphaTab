using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class TrillEffectInfo : NoteEffectInfoBase
    {
        protected override bool ShouldCreateGlyphForNote(EffectBarRenderer renderer, Note note)
        {
            return note.IsTrill;
        }

        public override int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(20 * renderer.Scale);
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.SingleOnBeatToPostBeat; }
        }

        public override Glyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new TrillGlyph();
        }
    }
}