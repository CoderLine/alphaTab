using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class PickSlideEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId => "pick-slide";

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.SlideType == SlideType.PickSlideDown || note.SlideType == SlideType.PickSlideUp;
        }

        public override EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeat;

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph("P.S.");
        }
    }
}
