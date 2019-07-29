using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class PickSlideEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId { get { return "pick-slide"; } }

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.SlideType == SlideType.PickSlideDown || note.SlideType == SlideType.PickSlideUp;
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.GroupedOnBeat; }
        }

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph("P.S.");
        }
    }
}