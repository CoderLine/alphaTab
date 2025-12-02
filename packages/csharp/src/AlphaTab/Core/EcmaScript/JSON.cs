using AlphaTab.Platform;

namespace AlphaTab.Core.EcmaScript;

internal static class JSON
{
    public static string Stringify(string value)
    {
        return Json.QuoteJsonString(value);
    }
}
