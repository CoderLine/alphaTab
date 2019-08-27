namespace AlphaTab.Platform.Svg
{
    /// <summary>
    /// This public class stores text widths for several fonts and allows width calculation
    /// </summary>
    internal partial class FontSizes
    {
        public static void GenerateFontLookup(string family)
        {
            if (FontSizeLookupTables == null)
            {
                Init();
            }

            if (FontSizeLookupTables.ContainsKey(family))
            {
                return;
            }

            // TODO: maybe allow fallback to GDI/Skia based on availability?
            FontSizeLookupTables[family] = new byte[]
            {
                8
            };
        }
    }
}
