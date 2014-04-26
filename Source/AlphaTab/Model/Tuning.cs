using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using AlphaTab.Collections;
using AlphaTab.Platform;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class represents a predefined string tuning.
    /// </summary>
    public class Tuning
    {
#if CSharp
        public static Regex TuningRegex = new Regex("([a-g]b?)([0-9])", RegexOptions.IgnoreCase | RegexOptions.Compiled);
#elif JavaScript
        public static Regex TuningRegex = new Regex("([a-g]b?)([0-9])", "i");
#endif


        private static FastList<Tuning> _sevenStrings;
        private static FastList<Tuning> _sixStrings;
        private static FastList<Tuning> _fiveStrings;
        private static FastList<Tuning> _fourStrings;
        private static FastDictionary<int, Tuning> _defaultTunings; 

        /// <summary>
        /// Checks if the given string is a tuning inticator.
        /// </summary>Checks if the given string is a tuning inticator.
        /// <param name="name"></param>
        /// <returns></returns>
        public static bool IsTuning(string name)
        {
#if CSharp
            return TuningRegex.IsMatch(name);
#elif JavaScript
            return TuningRegex.Exec(name) != null;
#endif
        }

        public static string GetTextForTuning(int tuning, bool includeOctave)
        {
            var octave = tuning / 12;
            var note = tuning % 12;
            var notes = new[] { "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B" };
            var result = notes[note];
            if (includeOctave)
            {
                result += octave;
            }

            return result;
        }


        public static int GetTuningForText(string str)
        {
            var b = 0;
            string note = null;
            int octave = 0;
#if CSharp
            Match m = TuningRegex.Match(str.ToLower());
            if (m.Success)
            {
                note = m.Groups[1].Value;
                octave = Std.ParseInt(m.Groups[2].Value);
            }
#elif JavaScript
            var m = TuningRegex.Exec(str.ToLower());
            if(m != null) 
            {
                note = m[1];
                octave = Std.ParseInt(m[2]);
            }
#endif
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

        public static Tuning GetDefaultTuningFor(int stringCount)
        {
            if (_sevenStrings == null)
            {
                Initialize();
            }

            if (_defaultTunings.ContainsKey(stringCount))
                return _defaultTunings[stringCount];
            return null;
        }

        public static FastList<Tuning> GetPresetsFor(int stringCount)
        {
            if (_sevenStrings == null)
            {
                Initialize();
            }

            switch (stringCount)
            {
                case 7:
                    return _sevenStrings;
                case 6:
                    return _sixStrings;
                case 5:
                    return _fiveStrings;
                case 4:
                    return _fourStrings;
            }
            return new FastList<Tuning>();
        }

        private static void Initialize()
        {
            _sevenStrings = new FastList<Tuning>();
            _sixStrings = new FastList<Tuning>();
            _fiveStrings = new FastList<Tuning>();
            _fourStrings = new FastList<Tuning>();
            _defaultTunings = new FastDictionary<int, Tuning>();

            _defaultTunings[7] = new Tuning("Guitar 7 strings", new[] {64, 59, 55, 50, 45, 40, 35}, true);
            _sevenStrings.Add(_defaultTunings[7]);

            _defaultTunings[6] = new Tuning("Guitar Standard Tuning", new[] { 64, 59, 55, 50, 45, 40 }, true);
            _sixStrings.Add(_defaultTunings[6]);

            _sixStrings.Add(new Tuning("Guitar Tune down ½ step", new[] { 63, 58, 54, 49, 44, 39 }, false));
            _sixStrings.Add(new Tuning("Guitar Tune down 1 step", new[] { 62, 57, 53, 48, 43, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Tune down 2 step", new[] { 60, 55, 51, 46, 41, 36 }, false));
            _sixStrings.Add(new Tuning("Guitar Dropped D Tuning", new[] { 64, 59, 55, 50, 45, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Dropped D Tuning variant", new[] { 64, 57, 55, 50, 45, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Double Dropped D Tuning", new[] { 62, 59, 55, 50, 45, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Dropped E Tuning", new[] { 66, 61, 57, 52, 47, 40 }, false));
            _sixStrings.Add(new Tuning("Guitar Dropped C Tuning", new[] { 62, 57, 53, 48, 43, 36 }, false));

            _sixStrings.Add(new Tuning("Guitar Open C Tuning", new[] { 64, 60, 55, 48, 43, 36 }, false));
            _sixStrings.Add(new Tuning("Guitar Open Cm Tuning", new[] { 63, 60, 55, 48, 43, 36 }, false));
            _sixStrings.Add(new Tuning("Guitar Open C6 Tuning", new[] { 64, 57, 55, 48, 43, 36 }, false));
            _sixStrings.Add(new Tuning("Guitar Open Cmaj7 Tuning", new[] { 64, 59, 55, 52, 43, 36 }, false));
            _sixStrings.Add(new Tuning("Guitar Open D Tuning", new[] { 62, 57, 54, 50, 45, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Open Dm Tuning", new[] { 62, 57, 53, 50, 45, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Open D5 Tuning", new[] { 62, 57, 50, 50, 45, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Open D6 Tuning", new[] { 62, 59, 54, 50, 45, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Open Dsus4 Tuning", new[] { 62, 57, 55, 50, 45, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Open E Tuning", new[] { 64, 59, 56, 52, 47, 40 }, false));
            _sixStrings.Add(new Tuning("Guitar Open Em Tuning", new[] { 64, 59, 55, 52, 47, 40 }, false));
            _sixStrings.Add(new Tuning("Guitar Open Esus11 Tuning", new[] { 64, 59, 55, 52, 45, 40 }, false));
            _sixStrings.Add(new Tuning("Guitar Open F Tuning", new[] { 65, 60, 53, 48, 45, 41 }, false));
            _sixStrings.Add(new Tuning("Guitar Open G Tuning", new[] { 62, 59, 55, 50, 43, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Open Gm Tuning", new[] { 62, 58, 55, 50, 43, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Open G6 Tuning", new[] { 64, 59, 55, 50, 43, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Open Gsus4 Tuning", new[] { 62, 60, 55, 50, 43, 38 }, false));
            _sixStrings.Add(new Tuning("Guitar Open A Tuning", new[] { 64, 61, 57, 52, 45, 40 }, false));
            _sixStrings.Add(new Tuning("Guitar Open Am Tuning", new[] { 64, 60, 57, 52, 45, 40 }, false));
            _sixStrings.Add(new Tuning("Guitar Nashville Tuning", new[] { 64, 59, 67, 62, 57, 52 }, false));
            _sixStrings.Add(new Tuning("Bass 6 Strings Tuning", new[] { 48, 43, 38, 33, 28, 23 }, false));
            _sixStrings.Add(new Tuning("Lute or Vihuela Tuning", new[] { 64, 59, 54, 50, 45, 40 }, false));

            _defaultTunings[5] = new Tuning("Bass 5 Strings Tuning", new[] { 43, 38, 33, 28, 23 }, true);
            _fiveStrings.Add(_defaultTunings[5]);
            _fiveStrings.Add(new Tuning("Banjo Dropped C Tuning", new[] { 62, 59, 55, 48, 67 }, false));
            _fiveStrings.Add(new Tuning("Banjo Open D Tuning", new[] { 62, 57, 54, 50, 69 }, false));
            _fiveStrings.Add(new Tuning("Banjo Open G Tuning", new[] { 62, 59, 55, 50, 67 }, false));
            _fiveStrings.Add(new Tuning("Banjo G Minor Tuning", new[] { 62, 58, 55, 50, 67 }, false));
            _fiveStrings.Add(new Tuning("Banjo G Modal Tuning", new[] { 62, 57, 55, 50, 67 }, false));

            _defaultTunings[4] = new Tuning("Bass Standard Tuning", new[] { 43, 38, 33, 28 }, true);
            _fourStrings.Add(_defaultTunings[4]);
            _fourStrings.Add(new Tuning("Bass Tune down ½ step", new[] { 42, 37, 32, 27 }, false));
            _fourStrings.Add(new Tuning("Bass Tune down 1 step", new[] { 41, 36, 31, 26 }, false));
            _fourStrings.Add(new Tuning("Bass Tune down 2 step", new[] { 39, 34, 29, 24 }, false));
            _fourStrings.Add(new Tuning("Bass Dropped D Tuning", new[] { 43, 38, 33, 26 }, false));
            _fourStrings.Add(new Tuning("Ukulele C Tuning", new[] { 45, 40, 36, 43 }, false));
            _fourStrings.Add(new Tuning("Ukulele G Tuning", new[] { 52, 47, 43, 38 }, false));
            _fourStrings.Add(new Tuning("Mandolin Standard Tuning", new[] { 64, 57, 50, 43 }, false));
            _fourStrings.Add(new Tuning("Mandolin or Violin Tuning", new[] { 76, 69, 62, 55 }, false));
            _fourStrings.Add(new Tuning("Viola Tuning", new[] { 69, 62, 55, 48 }, false));
            _fourStrings.Add(new Tuning("Cello Tuning", new[] { 57, 50, 43, 36 }, false));
        }

        public static Tuning FindTuning(FastList<int> strings)
        {
            var tunings = GetPresetsFor(strings.Count);
            for (int t = 0; t < tunings.Count; t++)
            {
                var tuning = tunings[t];
                var equals = true;
                for (int i = 0; i < strings.Count; i++)
                {
                    if (strings[i] != tuning.Tunings[i])
                    {
                        equals = false;
                        break;
                    }
                }

                if (equals)
                {
                    return tuning;
                }
            }

            return null;
        }

        [IntrinsicProperty]
        public bool IsStandard { get; set; }
        [IntrinsicProperty]
        public string Name { get; set; }
        [IntrinsicProperty]
        public FastList<int> Tunings { get; set; }

        public Tuning(string name, int[] tuning, bool isStandard) 
        {
            IsStandard = isStandard;
            Name = name;
            Tunings = new FastList<int>();
            Tunings.AddRange(tuning);
        }
    }
}