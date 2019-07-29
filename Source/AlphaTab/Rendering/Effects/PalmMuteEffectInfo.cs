using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class PalmMuteEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId => "palm-mute";

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.IsPalmMute;
        }

        public override EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeat;

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph("P.M.");
        }
    }
}
