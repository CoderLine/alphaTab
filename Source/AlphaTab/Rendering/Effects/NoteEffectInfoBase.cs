using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    abstract class NoteEffectInfoBase : IEffectBarRendererInfo
    {
        protected FastList<Note> LastCreateInfo;

        public virtual bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            LastCreateInfo = new FastList<Note>();
            for (int i = 0, j = beat.Notes.Count; i < j; i++)
            {
                var n = beat.Notes[i];
                if (ShouldCreateGlyphForNote(n))
                {
                    LastCreateInfo.Add(n);
                }
            }
            return LastCreateInfo.Count > 0;
        }

        protected abstract bool ShouldCreateGlyphForNote(Note note);

        public abstract string EffectId { get; }
        public virtual bool HideOnMultiTrack { get { return false; } }
        public virtual bool CanShareBand { get { return true; } }
        public abstract EffectBarGlyphSizing SizingMode { get; }
        public abstract EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat);

        public virtual bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}