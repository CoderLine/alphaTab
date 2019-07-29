using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Platform.Svg
{
    /// <summary>
    /// This SVG canvas renders the music symbols by adding a CSS class 'at' to all elements. 
    /// </summary>
    internal class CssFontSvgCanvas : SvgCanvas
    {
        public override void FillMusicFontSymbol(
            float x,
            float y,
            float scale,
            MusicFontSymbol symbol,
            bool centerAtPosition = false)
        {
            if (symbol == MusicFontSymbol.None)
            {
                return;
            }

            FillMusicFontSymbolText(x, y, scale, "&#" + (int)symbol + ";", centerAtPosition);
        }

        public override void FillMusicFontSymbols(
            float x,
            float y,
            float scale,
            MusicFontSymbol[] symbols,
            bool centerAtPosition = false)
        {
            var s = "";
            foreach (var symbol in symbols)
            {
                if (symbol != MusicFontSymbol.None)
                {
                    s += "&#" + (int)symbol + ";";
                }
            }

            FillMusicFontSymbolText(x, y, scale, s, centerAtPosition);
        }

        private void FillMusicFontSymbolText(
            float x,
            float y,
            float scale,
            string symbols,
            bool centerAtPosition = false)
        {
            Buffer.Append("<g transform=\"translate(" + ((int)x - BlurCorrection) + " " + ((int)y - BlurCorrection) +
                          ")\" class=\"at\" ><text");
            if (scale != 1)
            {
                Buffer.Append(" style=\"font-size: " + scale * 100 + "%; stroke:none\"");
            }
            else
            {
                Buffer.Append(" style=\"stroke:none\"");
            }

            if (Color.Rgba != Model.Color.BlackRgb)
            {
                Buffer.Append(" fill=\"" + Color.Rgba + "\"");
            }

            if (centerAtPosition)
            {
                Buffer.Append(" text-anchor=\"" + GetSvgTextAlignment(Model.TextAlign.Center) + "\"");
            }

            Buffer.Append(">" + symbols + "</text></g>");
        }
    }
}
