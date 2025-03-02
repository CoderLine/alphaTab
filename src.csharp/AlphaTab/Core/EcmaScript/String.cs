namespace AlphaTab.Core.EcmaScript;

internal static class String
{
    public static string FromCharCode(double code)
    {
        return "" + (char) (int) code;
    }
}