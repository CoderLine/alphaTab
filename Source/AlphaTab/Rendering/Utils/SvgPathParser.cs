using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Utils
{
    /// <summary>
    /// A utility which can parse and deliver single tokens from a svg pathdata string
    /// </summary>
    public class SvgPathParser
    {
        private int _currentIndex;

        [IntrinsicProperty]
        public string Svg { get; set; }
        [IntrinsicProperty]
        public string LastCommand { get; set; }
        [IntrinsicProperty]
        public string CurrentToken { get; set; }

        public SvgPathParser(string svg)
        {
            Svg = svg;
        }

        public void Reset()
        {
            _currentIndex = 0;
            NextToken();
        }

        public bool Eof
        {
            get
            {
                return _currentIndex >= Svg.Length;
            }
        }

        public string GetString()
        {
            var t = CurrentToken;
            NextToken();
            return t;
        }

        public int GetNumber()
        {
            return int.Parse(GetString());
        }

        public bool CurrentTokenIsNumber
        {
            get
            {
                return Std.IsStringNumber(CurrentToken);
            }
        }

        public int NextChar()
        {
            if (Eof) return 0;
            return Svg[_currentIndex++];
        }

        public int PeekChar()
        {
            if (Eof) return 0;
            return Svg[_currentIndex];
        }

        public void NextToken()
        {
            var token = new StringBuilder();

            int c;
            bool skipChar;

            // skip leading spaces and separators
            do
            {
                c = NextChar();
                skipChar = Std.IsWhiteSpace(c) || c == ',';
            } while (!Eof && skipChar);

            // read token itself 
            if (!Eof || !skipChar)
            {
                token.AppendChar(c);
                if (Std.IsCharNumber(c)) // do we have a number?
                {
                    c = PeekChar(); // get first upcoming character
                    while (!Eof && (Std.IsCharNumber(c, false) || c == '.')) // while we have number characters add them 
                    {
                        token.AppendChar(NextChar());
                        // peek next character for check
                        c = PeekChar();
                    }
                }
                else
                {
                    LastCommand = token.ToString();
                }
            }

            CurrentToken = token.ToString();
        }
    }
}
