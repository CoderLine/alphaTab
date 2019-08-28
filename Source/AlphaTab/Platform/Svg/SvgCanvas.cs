using AlphaTab.Collections;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Platform.Svg
{
    /// <summary>
    ///  A canvas implementation storing SVG data
    /// </summary>
    internal abstract class SvgCanvas : ICanvas
    {
        protected const float BlurCorrection = 0;

        protected StringBuilder Buffer;
        private StringBuilder _currentPath;
        private bool _currentPathIsEmpty;

        public Color Color { get; set; }
        public float LineWidth { get; set; }
        public Font Font { get; set; }
        public TextAlign TextAlign { get; set; }
        public TextBaseline TextBaseline { get; set; }
        public Settings Settings { get; set; }

        public SvgCanvas()
        {
            _currentPath = new StringBuilder();
            _currentPathIsEmpty = true;
            Color = new Color(255, 255, 255);
            LineWidth = 1;
            Font = new Font("Arial", 10);
            TextAlign = TextAlign.Left;
            TextBaseline = TextBaseline.Top;
        }

        public virtual void BeginRender(float width, float height)
        {
            Buffer = new StringBuilder();

            Buffer.Append("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"");
            Buffer.Append(width);
            Buffer.Append("px\" height=\"");
            Buffer.Append((int)height);
            Buffer.Append("px\" class=\"alphaTabSurfaceSvg\">\n");
            _currentPath = new StringBuilder();
            _currentPathIsEmpty = true;
        }

        public void BeginGroup(string identifier)
        {
            Buffer.Append("<g class=\"" + identifier + "\">");
        }

        public void EndGroup()
        {
            Buffer.Append("</g>");
        }

        public virtual object EndRender()
        {
            Buffer.Append("</svg>");
            return Buffer.ToString();
        }

        public void FillRect(float x, float y, float w, float h)
        {
            if (w > 0)
            {
                Buffer.Append("<rect x=\"" + ((int)x - BlurCorrection) + "\" y=\"" + ((int)y - BlurCorrection) +
                              "\" width=\"" + w + "\" height=\"" + h + "\" fill=\"" + Color.Rgba + "\" />\n");
            }
        }

        public void StrokeRect(float x, float y, float w, float h)
        {
            Buffer.Append("<rect x=\""
                          + ((int)x - BlurCorrection)
                          + "\" y=\""
                          + ((int)y - BlurCorrection)
                          + "\" width=\""
                          + w
                          + "\" height=\""
                          + h
                          + "\" stroke=\"" + Color.Rgba + "\"");
            if (LineWidth != 1)
            {
                Buffer.Append(" stroke-width=\"" + LineWidth + "\"");
            }

            Buffer.Append(" fill=\"transparent\" />\n");
        }

        public void BeginPath()
        {
        }

        public void ClosePath()
        {
            _currentPath.Append(" z");
        }

        public void MoveTo(float x, float y)
        {
            _currentPath.Append(" M" + (x - BlurCorrection) + "," + (y - BlurCorrection));
        }

        public void LineTo(float x, float y)
        {
            _currentPathIsEmpty = false;
            _currentPath.Append(" L" + (x - BlurCorrection) + "," + (y - BlurCorrection));
        }

        public void QuadraticCurveTo(float cpx, float cpy, float x, float y)
        {
            _currentPathIsEmpty = false;
            _currentPath.Append(" Q" + cpx + "," + cpy + "," + x + "," + y);
        }

        public void BezierCurveTo(float cp1X, float cp1Y, float cp2X, float cp2Y, float x, float y)
        {
            _currentPathIsEmpty = false;
            _currentPath.Append(" C" + cp1X + "," + cp1Y + "," + cp2X + "," + cp2Y + "," + x + "," + y);
        }

        public void FillCircle(float x, float y, float radius)
        {
            _currentPathIsEmpty = false;
            //
            // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
            _currentPath.Append(" M" + (x - radius) + "," + y + " A1,1 0 0,0 " + (x + radius) + "," + y +
                                " A1,1 0 0,0 " + (x - radius) + "," + y + " z");
            Fill();
        }

        public void Fill()
        {
            if (!_currentPathIsEmpty)
            {
                Buffer.Append("<path d=\"" + _currentPath + "\"");
                if (Color.Rgba != Color.BlackRgb)
                {
                    Buffer.Append(" fill=\"" + Color.Rgba + "\"");
                }

                Buffer.Append(" style=\"stroke: none\"/>");
            }

            _currentPath = new StringBuilder();
            _currentPathIsEmpty = true;
        }

        public void Stroke()
        {
            if (!_currentPathIsEmpty)
            {
                var s = "<path d=\"" + _currentPath + "\" stroke=\"" + Color.Rgba + "\"";
                if (LineWidth != 1)
                {
                    s += " stroke-width=\"" + LineWidth + "\"";
                }

                s += " style=\"fill: none\" />";
                Buffer.Append(s);
            }

            _currentPath = new StringBuilder();
            _currentPathIsEmpty = true;
        }

        public void FillText(string text, float x, float y)
        {
            if (text == "")
            {
                return;
            }

            var s = "<text x=\"" + (int)x + "\" y=\"" + (int)y + "\" style=\"stroke: none; font:" +
                    Font.ToCssString(Settings.Display.Scale) + "\" "
                    + " dominant-baseline=\"" + GetSvgBaseLine() + "\"";
            if (Color.Rgba != Color.BlackRgb)
            {
                s += " fill=\"" + Color.Rgba + "\"";
            }

            if (TextAlign != TextAlign.Left)
            {
                s += " text-anchor=\"" + GetSvgTextAlignment(TextAlign) + "\"";
            }

            s += ">" + text + "</text>";
            Buffer.Append(s);
        }

        protected string GetSvgTextAlignment(TextAlign textAlign)
        {
            switch (textAlign)
            {
                case TextAlign.Left: return "start";
                case TextAlign.Center: return "middle";
                case TextAlign.Right: return "end";
            }

            return "";
        }

        private string GetSvgBaseLine()
        {
            switch (TextBaseline)
            {
                case TextBaseline.Top: return "hanging";
                case TextBaseline.Middle: return "middle";
                case TextBaseline.Bottom: return "bottom";
                default: return "";
            }
        }

        public float MeasureText(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            return FontSizes.MeasureString(text, Font.Family, Font.Size, Font.Style);
        }

        public abstract void FillMusicFontSymbol(
            float x,
            float y,
            float scale,
            MusicFontSymbol symbol,
            bool centerAtPosition = false);

        public abstract void FillMusicFontSymbols(
            float x,
            float y,
            float scale,
            MusicFontSymbol[] symbols,
            bool centerAtPosition = false);

        public virtual object OnRenderFinished()
        {
            // nothing to do
            return null;
        }

        public void BeginRotate(float centerX, float centerY, float angle)
        {
            Buffer.Append("<g transform=\"translate(" + centerX + " ," + centerY + ") rotate( " + angle + ")\">");
        }

        public void EndRotate()
        {
            Buffer.Append("</g>");
        }
    }
}
