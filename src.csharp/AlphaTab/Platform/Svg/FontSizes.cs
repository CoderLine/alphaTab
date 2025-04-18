﻿namespace AlphaTab.Platform.Svg;

partial class FontSizes
{
    public static void GenerateFontLookup(string family)
    {
        if (FontSizeLookupTables.Has(family))
        {
            return;
        }

        // TODO: maybe allow fallback to GDI/Skia based on availability?
        FontSizeLookupTables.Set(family, new FontSizeDefinition(new Uint8Array(new[] {8}), 1.2));
    }
}