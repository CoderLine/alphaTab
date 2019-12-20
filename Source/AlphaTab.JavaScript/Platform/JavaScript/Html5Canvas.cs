using System;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;
using TextAlign = AlphaTab.Platform.Model.TextAlign;

namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// A canvas implementation for HTML5 canvas
    /// </summary>
    internal class Html5Canvas : ICanvas
    {
        protected const float BlurCorrection = 0;

        private CanvasElement _measureCanvas;
        private CanvasRenderingContext2D _measureContext;

        private CanvasElement _canvas;
        private CanvasRenderingContext2D _context;
        private Color _color;
        private Font _font;
        private Font _musicFont;
        private float _lineWidth;

        public Settings Settings { get; set; }

        public Html5Canvas()
        {
            _color = new Color(0, 0, 0);
            var fontElement = Browser.Document.CreateElement("span");
            fontElement.ClassList.Add("at");
            Browser.Document.Body.AppendChild(fontElement);
            var style = Browser.Window.GetComputedStyle(fontElement);
            string family = style.FontFamily;
            if (family.StartsWith("\"") || family.StartsWith("'"))
            {
                family = family.Substring(1, family.Length - 2);
            }

            _musicFont = new Font(family, Platform.ParseFloat(style.FontSize));

            _measureCanvas = (CanvasElement)Browser.Document.CreateElement("canvas");
            _measureCanvas.Width = 10;
            _measureCanvas.Height = 10;
            _measureCanvas.Style.Width = 10 + "px";
            _measureCanvas.Style.Height = 10 + "px";
            _measureContext = (CanvasRenderingContext2D)_measureCanvas.GetContext("2d");
            _measureContext.TextBaseline = "top";
        }

        public virtual object OnRenderFinished()
        {
            // nothing to do
            return null;
        }

        public void BeginRender(float width, float height)
        {
            _canvas = (CanvasElement)Browser.Document.CreateElement("canvas");
            _canvas.Width = (int)width;
            _canvas.Height = (int)height;
            _canvas.Style.Width = width + "px";
            _canvas.Style.Height = height + "px";
            _context = (CanvasRenderingContext2D)_canvas.GetContext("2d");
            _context.TextBaseline = "top";
            _context.LineWidth = _lineWidth;
        }

        public object EndRender()
        {
            var result = _canvas;
            _canvas = null;
            return result;
        }

        public Color Color
        {
            get => _color;
            set
            {
                if (_color.Rgba == value.Rgba)
                {
                    return;
                }

                _color = value;
                _context.StrokeStyle = value.Rgba;
                _context.FillStyle = value.Rgba;
            }
        }

        public float LineWidth
        {
            get => _lineWidth;
            set
            {
                _lineWidth = value;
                if (_context != null)
                {
                    _context.LineWidth = value;
                }
            }
        }

        public void FillRect(float x, float y, float w, float h)
        {
            if (w > 0)
            {
                _context.FillRect(((int)x - BlurCorrection), ((int)y - BlurCorrection), w, h);
            }
        }

        public void StrokeRect(float x, float y, float w, float h)
        {
            _context.StrokeRect((x - BlurCorrection), (y - BlurCorrection), w, h);
        }

        public void BeginPath()
        {
            _context.BeginPath();
        }

        public void ClosePath()
        {
            _context.ClosePath();
        }

        public void MoveTo(float x, float y)
        {
            _context.MoveTo((x - BlurCorrection), (y - BlurCorrection));
        }

        public void LineTo(float x, float y)
        {
            _context.LineTo((x - BlurCorrection), (y - BlurCorrection));
        }

        public void QuadraticCurveTo(float cpx, float cpy, float x, float y)
        {
            _context.QuadraticCurveTo(cpx, cpy, x, y);
        }

        public void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y)
        {
            _context.BezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }

        public void FillCircle(float x, float y, float radius)
        {
            _context.BeginPath();
            _context.Arc(x, y, radius, 0, (Math.PI * 2), true);
            Fill();
        }

        public void Fill()
        {
            _context.Fill();
        }

        public void Stroke()
        {
            _context.Stroke();
        }

        public Font Font
        {
            get => _font;
            set
            {
                _font = value;
                if (_context != null)
                {
                    _context.Font = value.ToCssString(Settings.Display.Scale);
                }

                _measureContext.Font = value.ToCssString(Settings.Display.Scale);
            }
        }

        public TextAlign TextAlign
        {
            get
            {
                switch (_context.TextAlign)
                {
                    case "left":
                        return TextAlign.Left;
                    case "center":
                        return TextAlign.Center;
                    case "right":
                        return TextAlign.Right;
                    default:
                        return TextAlign.Left;
                }
            }
            set
            {
                switch (value)
                {
                    case TextAlign.Left:
                        _context.TextAlign = "left";
                        break;
                    case TextAlign.Center:
                        _context.TextAlign = "center";
                        break;
                    case TextAlign.Right:
                        _context.TextAlign = "right";
                        break;
                }
            }
        }

        public TextBaseline TextBaseline
        {
            get
            {
                switch (_context.TextBaseline)
                {
                    case "top":
                        return TextBaseline.Top;
                    case "middle":
                        return TextBaseline.Middle;
                    case "bottom":
                        return TextBaseline.Bottom;
                    default:
                        return TextBaseline.Top;
                }
            }
            set
            {
                switch (value)
                {
                    case TextBaseline.Top:
                        _context.TextBaseline = "top";
                        break;
                    case TextBaseline.Middle:
                        _context.TextBaseline = "middle";
                        break;
                    case TextBaseline.Bottom:
                        _context.TextBaseline = "bottom";
                        break;
                }
            }
        }

        public void BeginGroup(string identifier)
        {
        }

        public void EndGroup()
        {
        }

        public void FillText(string text, float x, float y)
        {
            x = (int)x;
            y = (int)y;
            _context.FillText(text, x, y);
        }

        public float MeasureText(string text)
        {
            return (float)_measureContext.MeasureText(text).Width;
        }

        public void FillMusicFontSymbol(
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

            FillMusicFontSymbolText(x, y, scale, Platform.StringFromCharCode((int)symbol), centerAtPosition);
        }

        public void FillMusicFontSymbols(
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
                    s += Platform.StringFromCharCode((int)symbol);
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
            x = (int)x;
            y = (int)y;
            var textAlign = _context.TextAlign;
            var baseLine = _context.TextBaseline;
            var font = _context.Font;
            _context.Font = _musicFont.ToCssString(scale);
            _context.TextBaseline = "middle";
            if (centerAtPosition)
            {
                _context.TextAlign = "center";
            }

            _context.FillText(symbols, x, y);
            _context.TextBaseline = baseLine;
            _context.Font = font;
            _context.TextAlign = textAlign;
        }

        public void BeginRotate(float centerX, float centerY, float angle)
        {
            _context.Save();
            _context.Translate(centerX, centerY);
            _context.Rotate(angle * Math.PI / 180.0f);
        }

        public void EndRotate()
        {
            _context.Restore();
        }
    }
}
