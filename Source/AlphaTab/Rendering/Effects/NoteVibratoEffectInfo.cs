using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class NoteVibratoEffectInfo : NoteEffectInfoBase
    {
        protected override bool ShouldCreateGlyphForNote(EffectBarRenderer renderer, Note note)
        {
            return note.Vibrato != VibratoType.None || (note.IsTieDestination && note.TieOrigin.Vibrato != VibratoType.None);
        }

        public override int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(15 * renderer.Scale);
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.GroupedOnBeatToPostBeat; }
        }

        public override Glyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new VibratoGlyph(0, (int)(5 * renderer.Scale));
        }
    }
}