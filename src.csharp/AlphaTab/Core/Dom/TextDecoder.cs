using System.Text;
using AlphaTab.Core.EcmaScript;

namespace AlphaTab.Core.Dom
{
    public class TextDecoder
    {
        private readonly Encoding _encoding;

        public TextDecoder(string encoding)
        {
            _encoding = Encoding.GetEncoding(encoding);
        }

        public string Decode(ArrayBuffer data)
        {
            return _encoding.GetString(data.Raw.Array, data.Raw.Offset, data.Raw.Count);
        }
    }
}
