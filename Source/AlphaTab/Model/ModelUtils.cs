using AlphaTab.Audio;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class contains some utilities for working with model public classes
    /// </summary>
    internal static class ModelUtils
    {
        public static int GetIndex(this Duration duration)
        {
            var index = 0;
            var value = (int)duration;
            if (value < 0)
            {
                return index;
            }

            return (int)Platform.Platform.Log2((int)duration);
        }

        public static bool KeySignatureIsFlat(int ks)
        {
            return ks < 0;
        }

        public static bool KeySignatureIsNatural(int ks)
        {
            return ks == 0;
        }

        public static bool KeySignatureIsSharp(int ks)
        {
            return ks > 0;
        }

        public static void ApplyPitchOffsets(Settings settings, Score score)
        {
            for (var i = 0; i < score.Tracks.Count; i++)
            {
                if (i < settings.Notation.DisplayTranspositionPitches.Length)
                {
                    foreach (var staff in score.Tracks[i].Staves)
                    {
                        staff.DisplayTranspositionPitch = -settings.Notation.DisplayTranspositionPitches[i];
                    }
                }

                if (i < settings.Notation.TranspositionPitches.Length)
                {
                    foreach (var staff in score.Tracks[i].Staves)
                    {
                        staff.TranspositionPitch = -settings.Notation.TranspositionPitches[i];
                    }
                }
            }
        }

        public static string FingerToString(Settings settings, Beat beat, Fingers finger, bool leftHand)
        {
            if (settings.Notation.FingeringMode == FingeringMode.ScoreForcePiano ||
                settings.Notation.FingeringMode == FingeringMode.SingleNoteEffectBandForcePiano ||
                GeneralMidi.IsPiano(beat.Voice.Bar.Staff.Track.PlaybackInfo.Program))
            {
                switch (finger)
                {
                    case Fingers.Unknown:
                    case Fingers.NoOrDead:
                        return null;
                    case Fingers.Thumb:
                        return "1";
                    case Fingers.IndexFinger:
                        return "2";
                    case Fingers.MiddleFinger:
                        return "3";
                    case Fingers.AnnularFinger:
                        return "4";
                    case Fingers.LittleFinger:
                        return "5";
                    default:
                        return null;
                }
            }

            if (leftHand)
            {
                switch (finger)
                {
                    case Fingers.Unknown:
                    case Fingers.NoOrDead:
                        return "0";
                    case Fingers.Thumb:
                        return "T";
                    case Fingers.IndexFinger:
                        return "1";
                    case Fingers.MiddleFinger:
                        return "2";
                    case Fingers.AnnularFinger:
                        return "3";
                    case Fingers.LittleFinger:
                        return "4";
                    default:
                        return null;
                }
            }

            switch (finger)
            {
                case Fingers.Unknown:
                case Fingers.NoOrDead:
                    return null;
                case Fingers.Thumb:
                    return "p";
                case Fingers.IndexFinger:
                    return "i";
                case Fingers.MiddleFinger:
                    return "m";
                case Fingers.AnnularFinger:
                    return "a";
                case Fingers.LittleFinger:
                    return "c";
                default:
                    return null;
            }
        }
    }
}
