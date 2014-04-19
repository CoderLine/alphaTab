using System;
using AlphaTab.Collections;

namespace AlphaTab.Platform.Model
{
    [Flags]
    public enum FontStyle
    {
        Plain = 0,
        Bold = 1,
        Italic = 2
    }

    /// <summary>
    /// This container public class can store the definition for a font and it's style.
    /// </summary>
    public class Font
    {
        public string Family { get; set; }
        public float Size { get; set; }
        public FontStyle Style { get; set; }

        public bool IsBold
        {
            get
            {
                return (Style & FontStyle.Bold) != 0;
            }
        }

        public bool IsItalic
        {
            get
            {
                return (Style & FontStyle.Italic) != 0;
            }
        }

        public Font(string family, float size, FontStyle style = FontStyle.Plain)
        {
            Family = family;
            Size = size;
            Style = style;
        }

        public Font Clone()
        {
            return new Font(Family, Size, Style);
        }

        public string ToCssString()
        {
            var buf = new StringBuilder();

            if (IsBold)
            {
                buf.Append("bold ");
            }
            if (IsItalic)
            {
                buf.Append("italic ");
            }

            buf.Append(Size);
            buf.Append("px");
            buf.Append("'");
            buf.Append(Family);
            buf.Append("'");

            return buf.ToString();
        }

    }
}
