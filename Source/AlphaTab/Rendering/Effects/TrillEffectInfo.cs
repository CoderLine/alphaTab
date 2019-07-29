using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class TrillEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId => "trill";

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.IsTrill;
        }

        public override EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TrillGlyph(0, 0);
        }
    }
}
