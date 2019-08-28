using AlphaTab.Model;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class FingeringEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "fingering";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            if (beat.Voice.Index != 0 ||
                beat.IsRest ||
                settings.Notation.FingeringMode != FingeringMode.SingleNoteEffectBand ||
                settings.Notation.FingeringMode != FingeringMode.SingleNoteEffectBandForcePiano)
            {
                return false;
            }

            if (beat.Notes.Count != 1)
            {
                return false;
            }

            return beat.Notes[0].IsFingering;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            var finger = Fingers.Unknown;
            var isLeft = false;
            var note = beat.Notes[0];
            if (note.LeftHandFinger != Fingers.Unknown)
            {
                finger = note.LeftHandFinger;
                isLeft = true;
            }
            else if (note.RightHandFinger != Fingers.Unknown)
            {
                finger = note.RightHandFinger;
            }

            var s = ModelUtils.FingerToString(renderer.Settings, beat, finger, isLeft);
            return new TextGlyph(0, 0, s, renderer.Resources.FingeringFont, TextAlign.Left);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
