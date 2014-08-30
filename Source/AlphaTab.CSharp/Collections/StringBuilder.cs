using AlphaTab.Platform;

namespace AlphaTab.Collections
{
    public class StringBuilder
    {
        private readonly System.Text.StringBuilder _sb;

        public StringBuilder()
        {
            _sb = new System.Text.StringBuilder();
        }

        public void Append(object s)
        {
            _sb.Append(s);
        }

        public void AppendChar(int i)
        {
            _sb.Append(Std.StringFromCharCode(i));
        }

        public void AppendLine()
        {
            _sb.Append("\r\n");
        }

        public override string ToString()
        {
            return _sb.ToString();
        }
    }
}
