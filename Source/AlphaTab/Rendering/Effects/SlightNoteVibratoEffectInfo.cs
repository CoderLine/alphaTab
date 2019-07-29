using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class SlightNoteVibratoEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId { get { return "slight-note-vibrato"; } }

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.Vibrato == VibratoType.Slight || (note.IsTieDestination && note.TieOrigin.Vibrato == VibratoType.Slight);
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.GroupedOnBeatToEnd; }
        }

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new NoteVibratoGlyph(0, 0, VibratoType.Slight);
        }
    }
}