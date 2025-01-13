namespace AlphaTab.Core.EcmaScript;

internal static class BigInt
{
    public static long AsUintN(int bits, long value)
    {
        // https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-bigint.asuintn
        return (long)(value % Math.Pow(2, bits));
    }
}
