using AlphaTab.Platform;

namespace AlphaTab.Collections
{
    public class StringBuilder
    {
#if CSharp
        private readonly System.Text.StringBuilder _sb;
#else
        private string _sb;
#endif

        public StringBuilder()
        {
#if CSharp
            _sb = new System.Text.StringBuilder();
#else
            _sb = "";
#endif
        }

        public void Append(object s)
        {
#if CSharp
            _sb.Append(s);
#else
            _sb += s;
#endif
        }

        public void AppendChar(int i)
        {
            Append(Std.StringFromCharCode(i));
        }

        public void AppendLine()
        {
            Append("\r\n");
        }

        public override string ToString()
        {
#if CSharp
            return _sb.ToString();
#else
            return _sb;
#endif
        }

    }
}
