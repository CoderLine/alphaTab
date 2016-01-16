using System;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class HarmonicsEffectInfo : NoteEffectInfoBase
    {
        private Beat _beat;
        private HarmonicType _beatType;

        protected override bool ShouldCreateGlyphForNote(EffectBarRenderer renderer, Note note)
        {
            if (!note.IsHarmonic) return false;
            if (note.Beat != _beat || note.HarmonicType > _beatType)
            {
                _beatType = note.HarmonicType;
            }
            return true;
        }

        public override float GetHeight(EffectBarRenderer renderer)
        {
            return 20 * renderer.Scale;
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.SingleOnBeatToPostBeat; }
        }

        public override EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new TextGlyph(0, 0, HarmonicToString(_beatType), renderer.Resources.EffectFont);
        }

        public static string HarmonicToString(HarmonicType type)
        {
            switch (type)
            {
                case HarmonicType.Natural:
                    return "N.H.";
                case HarmonicType.Artificial:
                    return "A.H.";
                case HarmonicType.Pinch:
                    return "P.H.";
                case HarmonicType.Tap:
                    return "T.H.";
                case HarmonicType.Semi:
                    return "S.H.";
                case HarmonicType.Feedback:
                    return "Fdbk.";
            }
            return "";
        }
    }
}