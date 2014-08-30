using System.Runtime.CompilerServices;

namespace AlphaTab.Collections
{
    [IgnoreNamespace]
    [Imported(ObeysTypeSystem = true)]
    [ScriptName("Array")]
    public class StringBuilder
    {
        [InlineCode("[]")]
        public StringBuilder()
        {
        }

        [ScriptName("push")]
        public void Append(object s)
        {
        }

        [InlineCode("{this}.push(String.fromCharCode({i}))")]
        public void AppendChar(int i)
        {
        }

        [InlineCode("{this}.push('\\r\\n')")]
        public void AppendLine()
        {
        }

        [InlineCode("{this}.join('')")]
        public new string ToString()
        {
            return "";
        }
    }
}
