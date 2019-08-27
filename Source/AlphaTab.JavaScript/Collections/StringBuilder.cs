using Phase;
using Phase.Attributes;

namespace AlphaTab.Collections
{
    [Abstract("String")]
    [NativeConstructors]
    internal class StringBuilder
    {
        [Inline]
        public StringBuilder()
        {
            Script.Write("this = \"\";");
        }

        [Inline]
        public void Append(object s)
        {
            Script.Write("this += Std.string(s);");
        }

        [Inline]
        public void AppendChar(int i)
        {
            Script.Write("this += String.fromCharCode(i.toHaxeInt());");
        }

        [Inline]
        public void AppendLine(string s = "")
        {
            Script.Write("this += s + \"\\r\\n\";");
        }

        [Inline]
        public override string ToString()
        {
            return Script.Write<string>("this");
        }
    }
}
