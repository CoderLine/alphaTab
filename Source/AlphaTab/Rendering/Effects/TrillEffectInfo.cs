using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class TrillEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId { get { return "trill"; } }

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.IsTrill;
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.SingleOnBeat; }
        }

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TrillGlyph(0, 0);
        }
    }
}