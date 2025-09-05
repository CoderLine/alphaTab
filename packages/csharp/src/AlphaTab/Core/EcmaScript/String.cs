using System.Text;

namespace AlphaTab.Core.EcmaScript;

internal static class String
{
    public static string FromCharCode(double code)
    {
        return "" + (char) (int) code;
    }

    public static string FromCodePoint(double code)
    {
        return char.ConvertFromUtf32((int)code);
    }
}
