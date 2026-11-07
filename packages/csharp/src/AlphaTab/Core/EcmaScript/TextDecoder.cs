using System.Collections.Concurrent;
using System.Text;

namespace AlphaTab.Core.EcmaScript;

internal class TextDecoder
{
    private static readonly ConcurrentDictionary<string, Encoding> EncodingCache = new();

    /// <summary>
    /// The characters of the bytes 0x80 to 0x9F in Windows-1252 as the WHATWG Encoding Standard defines them;
    /// all other bytes are their own code point.
    /// </summary>
    private static readonly char[] Windows1252C1 =
    {
        '€', '\u0081', '‚', 'ƒ', '„', '…', '†', '‡',
        'ˆ', '‰', 'Š', '‹', 'Œ', '\u008D', 'Ž', '\u008F',
        '\u0090', '‘', '’', '“', '”', '•', '–', '—',
        '˜', '™', 'š', '›', 'œ', '\u009D', 'ž', 'Ÿ'
    };

    private readonly Encoding? _encoding;

    public TextDecoder(string encoding)
    {
        // .NET Core only knows Windows-1252 with a registered code pages provider
        if (IsWindows1252(encoding))
        {
            _encoding = null;
            return;
        }

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

    private static bool IsWindows1252(string encoding)
    {
        switch (encoding.ToLowerInvariant())
        {
            case "windows-1252":
            case "cp1252":
            case "x-cp1252":
                return true;
            default:
                return false;
        }
    }

    public string Decode(ArrayBuffer data)
    {
        return Decode(data.Raw, 0, (int)data.ByteLength);
    }

    public string Decode(Uint8Array data)
    {
        return Decode(data.Buffer.Raw, (int)data.ByteOffset, (int)data.Length);
    }

    private string Decode(byte[] data, int offset, int length)
    {
        if (_encoding != null)
        {
            return _encoding.GetString(data, offset, length);
        }

        var chars = new char[length];
        for (var i = 0; i < length; i++)
        {
            var b = data[offset + i];
            chars[i] = b >= 0x80 && b < 0xA0 ? Windows1252C1[b - 0x80] : (char)b;
        }

        return new string(chars);
    }
}
