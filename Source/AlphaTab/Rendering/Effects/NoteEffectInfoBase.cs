using System.Collections.Generic;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    abstract public class NoteEffectInfoBase : IEffectBarRendererInfo
    {
        protected FastList<Note> LastCreateInfo;

        public bool HideOnMultiTrack { get { return false; } }
        public virtual bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            LastCreateInfo = new FastList<Note>();
            for (int i = 0; i < beat.Notes.Count; i++)
            {
                var n = beat.Notes[i];
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
        public abstract EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat);

        public virtual bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}