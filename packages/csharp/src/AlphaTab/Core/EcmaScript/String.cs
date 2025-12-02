﻿using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Core.EcmaScript;

internal static class String
{
    public static string FromCharCode(double code)
    {
        return "" + (char)(int)code;
    }

    public static string FromCodePoint(double code)
    {
        return char.ConvertFromUtf32((int)code);
    }

    public static string FromCodePoint(IList<double> codes)
    {
        return string.Concat(codes.Select(c => char.ConvertFromUtf32((int)c)).ToArray());
    }
}
