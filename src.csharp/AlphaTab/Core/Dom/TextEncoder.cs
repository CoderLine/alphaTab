using System.Text;
using AlphaTab.Core.EcmaScript;

namespace AlphaTab.Core.Dom
{
    internal class TextEncoder
    {
        private readonly Encoding _encoding;

        public TextEncoder()
        {
            _encoding = Encoding.UTF8;
        }

        public Uint8Array Encode(string value)
        {
            return _encoding.GetBytes(value);
        }
    }
}
