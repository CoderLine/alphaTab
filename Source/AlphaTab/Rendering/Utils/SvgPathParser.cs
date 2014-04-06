using System.Runtime.CompilerServices;
using System.Text;

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
                return IsStringNumber(CurrentToken);
            }
        }

        public char NextChar()
        {
            if (Eof) return '\0';
            return Svg[_currentIndex++];
        }

        public char PeekChar()
        {
            if (Eof) return '\0';
            return Svg[_currentIndex];
        }

        public void NextToken()
        {
            var token = new StringBuilder();

            char c;
            bool skipChar;

            // skip leading spaces and separators
            do
            {
                c = NextChar();
                skipChar = IsWhiteSpace(c) || c == ',';
            } while (!Eof && skipChar);

            // read token itself 
            if (!Eof || !skipChar)
            {
                token.Append(c);
                if (IsCharNumber(c)) // do we have a number?
                {
                    c = PeekChar(); // get first upcoming character
                    while (!Eof && (IsCharNumber(c, false) || c == '.')) // while we have number characters add them 
                    {
                        token.Append(NextChar());
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

        private static bool IsStringNumber(string s, bool allowSign = true)
        {
            if (s.Length == 0) return false;
            var c = s[0];
            return IsCharNumber(c, allowSign);
        }

        private static bool IsCharNumber(char c, bool allowSign = true)
        {
            return (allowSign && c == 0x2D) || (c >= 0x30 && c <= 0x39);
        }

        private static bool IsWhiteSpace(char c)
        {
            return c == ' ' || c == '\t' || c == '\r' || c == '\n';
        }
    }
}
