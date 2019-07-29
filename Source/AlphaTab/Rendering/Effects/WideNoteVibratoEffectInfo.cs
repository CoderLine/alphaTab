using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class WideNoteVibratoEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId { get { return "wide-note-vibrato"; } }

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.Vibrato == VibratoType.Wide || (note.IsTieDestination && note.TieOrigin.Vibrato == VibratoType.Wide);
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.GroupedOnBeatToEnd; }
        }

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new NoteVibratoGlyph(0, 0, VibratoType.Wide);
        }
    }
}