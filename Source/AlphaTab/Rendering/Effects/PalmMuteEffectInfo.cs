using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class PalmMuteEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId { get { return "palm-mute"; } }

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.IsPalmMute;
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.GroupedOnBeat; }
        }

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph("P.M.");
        }
    }
}