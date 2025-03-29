using System.Text;

namespace AlphaTab.Core.Dom;

internal class TextDecoder
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