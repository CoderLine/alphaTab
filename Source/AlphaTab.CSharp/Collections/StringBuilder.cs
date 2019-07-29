using System;
using System.Globalization;

namespace AlphaTab.Collections
{
    internal class StringBuilder
    {
        private readonly System.Text.StringBuilder _sb;

        public StringBuilder()
        {
            _sb = new System.Text.StringBuilder();
        }

        public void Append(object s)
        {
            _sb.Append(Convert.ToString(s, CultureInfo.InvariantCulture));
        }

        public void AppendChar(int i)
        {
            _sb.Append(Platform.Platform.StringFromCharCode(i));
        }

        public void AppendLine(string s = "")
        {
            _sb.Append(s).Append("\r\n");
        }

        public override string ToString()
        {
            return _sb.ToString();
        }
    }
}
