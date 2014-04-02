using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class FingeringEffectInfo : NoteEffectInfoBase
    {
        private int _maxGlyphCount;

        public override bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            var result = base.ShouldCreateGlyph(renderer, beat);
            if (LastCreateInfo.Count >= _maxGlyphCount) _maxGlyphCount = LastCreateInfo.Count;
            return result;
        }

        protected override bool ShouldCreateGlyphForNote(EffectBarRenderer renderer, Note note)
        {
            return (note.LeftHandFinger != Fingers.NoOrDead && note.LeftHandFinger != Fingers.Unknown) ||
                   (note.RightHandFinger != Fingers.NoOrDead && note.RightHandFinger != Fingers.Unknown);
        }

        public override int GetHeight(EffectBarRenderer renderer)
        {
            return _maxGlyphCount * (int)(20 * renderer.Scale);
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.SingleOnBeatOnly; }
        }

        public override Glyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new DummyEffectGlyph(0, 0, LastCreateInfo.Count + "fingering");
        }
    }
}