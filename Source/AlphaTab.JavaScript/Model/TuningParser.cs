using System.Text.RegularExpressions;
using AlphaTab.Platform;

namespace AlphaTab.Model
{
    public static class TuningParser
    {
        public static Regex TuningRegex = new Regex("([a-g]b?)([0-9])", "i");

        /// <summary>
        /// Checks if the given string is a tuning inticator.
        /// </summary>Checks if the given string is a tuning inticator.
        /// <param name="name"></param>
        /// <returns></returns>
        public static bool IsTuning(string name)
        {
            return TuningRegex.Exec(name) != null;
        }

        public static int GetTuningForText(string str)
        {
            var b = 0;
            string note = null;
            int octave = 0;
            var m = TuningRegex.Exec(str.ToLower());
            if (m != null)
            {
                note = m[1];
                octave = Std.ParseInt(m[2]);
            }
            if (!note.IsNullOrWhiteSpace())
            {
                switch (note)
                {
                    case "c":
                        b = 0;
                        break;
                    case "db":
                        b = 1;
                        break;
                    case "d":
                        b = 2;
                        break;
                    case "eb":
                        b = 3;
                        break;
                    case "e":
                        b = 4;
                        break;
                    case "f":
                        b = 5;
                        break;
                    case "gb":
                        b = 6;
                        break;
                    case "g":
                        b = 7;
                        break;
                    case "ab":
                        b = 8;
                        break;
                    case "a":
                        b = 9;
                        break;
                    case "bb":
                        b = 10;
                        break;
                    case "b":
                        b = 11;
                        break;
                    default:
                        return -1;
                }

                // add octaves
                b += ((octave + 1) * 12);

            }
            else
            {
                return -1;
            }
            return b;
        }

    }
}
