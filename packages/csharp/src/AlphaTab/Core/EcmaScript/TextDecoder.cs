using System.Collections.Concurrent;
using System.Text;

namespace AlphaTab.Core.EcmaScript;

internal class TextDecoder
{
    private static readonly ConcurrentDictionary<string, Encoding> EncodingCache = new();
    private readonly Encoding _encoding;

    public TextDecoder(string encoding)
    {
        _encoding = EncodingCache.GetOrAdd(encoding, s =>
        {
            try
            {
                return Encoding.GetEncoding(encoding);
            }
            catch
            {
                return Encoding.Default;
            }
        });
    }

    public string Decode(ArrayBuffer data)
    {
        return _encoding.GetString(data.Raw, 0, (int)data.ByteLength);
    }

    public string Decode(Uint8Array data)
    {
        return _encoding.GetString(data.Buffer.Raw, (int)data.ByteOffset, (int)data.Length);
    }
}
