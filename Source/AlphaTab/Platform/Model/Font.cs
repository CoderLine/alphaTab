using System;
using AlphaTab.Collections;
using AlphaTab.Util;

namespace AlphaTab.Platform.Model
{
    /// <summary>
    /// This container public class can store the definition for a font and it's style.
    /// </summary>
    public partial class Font
    {
        private string _css;
        private float _cssScale;

        /// <summary>
        /// Gets or sets the font family name. 
        /// </summary>
        public string Family { get; set; }

        /// <summary>
        /// Gets or sets the font size in pixels. 
        /// </summary>
        public float Size { get; set; }

        /// <summary>
        /// Gets or sets the font style. 
        /// </summary>
        public FontStyle Style { get; set; }

        /// <summary>
        /// Gets a value indicating whether the font is bold. 
        /// </summary>
        public bool IsBold => (Style & FontStyle.Bold) != 0;

        /// <summary>
        /// Gets a value indicating whether the font is italic. 
        /// </summary>
        public bool IsItalic => (Style & FontStyle.Italic) != 0;

        /// <summary>
        /// Initializes a new instance of the <see cref="Font"/> class.
        /// </summary>
        /// <param name="family">The family.</param>
        /// <param name="size">The size.</param>
        /// <param name="style">The style.</param>
        public Font(string family, float size, FontStyle style = FontStyle.Plain)
        {
            Family = family;
            Size = size;
            Style = style;
            _css = ToCssString(1f);
        }

        internal Font Clone()
        {
            return new Font(Family, Size, Style);
        }

        internal string ToCssString(float scale)
        {
            if (_css == null || !(Math.Abs(scale - _cssScale) < 0.01))
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

                buf.Append(Size * scale);
                buf.Append("px ");
                buf.Append("'");
                buf.Append(Family);
                buf.Append("'");

                _css = buf.ToString();
                _cssScale = scale;
            }

            return _css;
        }
    }
}
