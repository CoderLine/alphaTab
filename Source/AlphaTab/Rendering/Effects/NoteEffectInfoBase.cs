using System.Collections.Generic;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    abstract public class NoteEffectInfoBase : IEffectBarRendererInfo
    {
        protected List<Note> LastCreateInfo;

        public bool HideOnMultiTrack { get { return false; } }
        public virtual bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            LastCreateInfo = new List<Note>();
            foreach (var n in beat.Notes)
            {
                if (ShouldCreateGlyphForNote(renderer, n))
                {
                    LastCreateInfo.Add(n);
                }
            }
            return LastCreateInfo.Count > 0;
        }

        protected abstract bool ShouldCreateGlyphForNote(EffectBarRenderer renderer, Note note);

        public abstract EffectBarGlyphSizing SizingMode { get; }
        public abstract int GetHeight(EffectBarRenderer renderer);
        public abstract Glyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat);

        public virtual bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}