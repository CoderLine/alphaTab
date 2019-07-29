using System;
using AlphaTab.Collections;
using AlphaTab.Platform.Model;

namespace AlphaTab.Platform.Svg
{
    /// <summary>
    /// This public class stores text widths for several fonts and allows width calculation 
    /// </summary>
    partial class FontSizes
    {
        public static byte[] Georgia;
        public static byte[] Arial;

        internal static FastDictionary<string, byte[]> FontSizeLookupTables;

        private static void Init()
        {
            Georgia = new byte[] { 3, 4, 5, 7, 7, 9, 8, 2, 4, 4, 5, 7, 3, 4, 3, 5, 7, 5, 6, 6, 6, 6, 6, 6, 7, 6, 3, 3, 7, 7, 7, 5, 10, 7, 7, 7, 8, 7, 7, 8, 9, 4, 6, 8, 7, 10, 8, 8, 7, 8, 8, 6, 7, 8, 7, 11, 8, 7, 7, 4, 5, 4, 7, 7, 6, 6, 6, 5, 6, 5, 4, 6, 6, 3, 3, 6, 3, 10, 6, 6, 6, 6, 5, 5, 4, 6, 5, 8, 6, 5, 5, 5, 4, 5, 7, 6, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 3, 4, 6, 7, 6, 7, 4, 6, 6, 10, 6, 6, 7, 0, 10, 7, 5, 7, 6, 6, 6, 6, 6, 3, 6, 6, 6, 6, 12, 12, 12, 5, 7, 7, 7, 7, 7, 7, 11, 7, 7, 7, 7, 7, 4, 4, 4, 4, 8, 8, 8, 8, 8, 8, 8, 7, 8, 8, 8, 8, 8, 7, 7, 6, 6, 6, 6, 6, 6, 6, 8, 5, 5, 5, 5, 5, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 7, 6, 6, 6, 6, 6, 5, 6 };
            Arial = new byte[] { 3, 3, 4, 6, 6, 10, 7, 2, 4, 4, 4, 6, 3, 4, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 11, 7, 7, 8, 8, 7, 7, 9, 8, 3, 6, 7, 6, 9, 8, 9, 7, 9, 8, 7, 7, 8, 7, 10, 7, 7, 7, 3, 3, 3, 5, 6, 4, 6, 6, 6, 6, 6, 3, 6, 6, 2, 2, 6, 2, 9, 6, 6, 6, 6, 4, 6, 3, 6, 6, 8, 6, 6, 6, 4, 3, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 6, 6, 6, 6, 3, 6, 4, 8, 4, 6, 6, 0, 8, 6, 4, 6, 4, 4, 4, 6, 6, 4, 4, 4, 4, 6, 9, 9, 9, 7, 7, 7, 7, 7, 7, 7, 11, 8, 7, 7, 7, 7, 3, 3, 3, 3, 8, 8, 9, 9, 9, 9, 9, 6, 9, 8, 8, 8, 8, 7, 7, 7, 6, 6, 6, 6, 6, 6, 10, 6, 6, 6, 6, 6, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 7, 6, 6, 6, 6, 6, 6 };

            FontSizeLookupTables = new FastDictionary<string, byte[]>();
            FontSizeLookupTables["Arial"] = Arial;
            FontSizeLookupTables["'Arial'"] = Arial;
            FontSizeLookupTables["\"Arial\""] = Arial;
            FontSizeLookupTables["Georgia"] = Georgia;
            FontSizeLookupTables["'Georgia'"] = Georgia;
            FontSizeLookupTables["\"Georgia\""] = Georgia;
        }

        public const int ControlChars = 0x20;

        public static float MeasureString(string s, string family, float size, FontStyle style)
        {
            if (FontSizeLookupTables == null)
            {
                Init();
            }

            byte[] data;
            int dataSize = 11;
            if (FontSizeLookupTables.ContainsKey(family))
            {
                data = FontSizeLookupTables[family];
            }
            else
            {
                // TODO: on-the-fly-generation for all canvas types
                data = new byte[] { 8 };
            }

            float factor = 1;
            if ((style & FontStyle.Italic) != 0)
            {
                factor *= 1.2f;
            }
            if ((style & FontStyle.Bold) != 0)
            {
                factor *= 1.2f;
            }

            var stringSize = 0f;

            for (int i = 0; i < s.Length; i++)
            {
                var code = Math.Min(data.Length - 1, s[i] - ControlChars);
                if (code >= 0)
                {
                    stringSize += ((data[code] * size) / dataSize);
                }
            }

            return stringSize * factor;
        }
    }
}
