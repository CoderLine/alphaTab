using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class SlightNoteVibratoEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId => "slight-note-vibrato";

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.Vibrato == VibratoType.Slight ||
                   note.IsTieDestination && note.TieOrigin.Vibrato == VibratoType.Slight;
        }

        public override EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeatToEnd;

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new NoteVibratoGlyph(0, 0, VibratoType.Slight);
        }
    }
}
