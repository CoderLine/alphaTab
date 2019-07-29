using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class HarmonicsEffectInfo : NoteEffectInfoBase
    {
        private readonly HarmonicType _harmonicType;
        private Beat _beat;
        private string _effectId;

        public override string EffectId => _effectId;

        public HarmonicsEffectInfo(HarmonicType harmonicType)
        {
            _harmonicType = harmonicType;
            switch (harmonicType)
            {
                case HarmonicType.Natural:
                    _effectId = "harmonics-natural";
                    break;
                case HarmonicType.Artificial:
                    _effectId = "harmonics-artificial";
                    break;
                case HarmonicType.Pinch:
                    _effectId = "harmonics-pinch";
                    break;
                case HarmonicType.Tap:
                    _effectId = "harmonics-tap";
                    break;
                case HarmonicType.Semi:
                    _effectId = "harmonics-semi";
                    break;
                case HarmonicType.Feedback:
                    _effectId = "harmonics-feedback";
                    break;
            }
        }


        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            if (!note.IsHarmonic || note.HarmonicType != _harmonicType)
            {
                return false;
            }

            if (note.Beat != _beat)
            {
                _beat = note.Beat;
            }

            return true;
        }

        public override EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeat;

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph(HarmonicToString(_harmonicType));
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
