#if JavaScript
using System;
using System.Html;
using AlphaTab.Platform.Model;


namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// A canvas implementation for HTML5 canvas
    /// </summary>
    public class Html5Canvas : ICanvas
    {
        private readonly CanvasElement _canvas;
        private System.Html.Media.Graphics.CanvasRenderingContext2D _context;
        private Color _color;
        private Font _font;

        public Html5Canvas(dynamic dom)
        {
            _canvas = dom;
            _context = (System.Html.Media.Graphics.CanvasRenderingContext2D)_canvas.GetContext("2d");
            _context.TextBaseline = System.Html.Media.Graphics.TextBaseline.Top;
        }

        public int Width
        {
            get { return _canvas.Width; }
            set
            {
                var lineWidth = _context.LineWidth;
                _canvas.Width = value;
                _context = (System.Html.Media.Graphics.CanvasRenderingContext2D)_canvas.GetContext("2d");
                _context.TextBaseline = System.Html.Media.Graphics.TextBaseline.Top;
                _context.LineWidth = lineWidth;
            }
        }

        public int Height

        {
            get { return _canvas.Height; }
            set
            {
                var lineWidth = _context.LineWidth;
                _canvas.Height = value;
                _context = (System.Html.Media.Graphics.CanvasRenderingContext2D)_canvas.GetContext("2d");
                _context.TextBaseline = System.Html.Media.Graphics.TextBaseline.Top;
                _context.LineWidth = lineWidth;
            }
        }

        public Color Color
        {
            get
            {
                return _color;
            }
            set
            {
                _color = value;
                _context.StrokeStyle = value.ToRgbaString();
                _context.FillStyle = value.ToRgbaString();
            }
        }

        public float LineWidth
        {
            get
            {
                return (float)_context.LineWidth;
            }
            set
            {
                _context.LineWidth = value;
            }
        }

        public void Clear()
        {
            var lineWidth = _context.LineWidth;
            _canvas.Width = _canvas.Width;
            _context.LineWidth = lineWidth;
            // this._context.clearRect(0,0,_width, _height);
        }

        public void FillRect(float x, float y, float w, float h)
        {
            _context.FillRect(x - 0.5, y - 0.5, w, h);
        }

        public void StrokeRect(float x, float y, float w, float h)
        {
            _context.StrokeRect(x - 0.5, y - 0.5, w, h);
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
            _context.MoveTo(x - 0.5, y - 0.5);
        }

        public void LineTo(float x, float y)
        {
            _context.LineTo(x - 0.5, y - 0.5);
        }

        public void QuadraticCurveTo(float cpx, float cpy, float x, float y)
        {
            _context.QuadraticCurveTo(cpx, cpy, x, y);
        }

        public void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y)
        {
            _context.BezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }

        public void Circle(float x, float y, float radius)
        {
            _context.Arc(x, y, radius, 0, Math.PI * 2, true);
        }

        public void Rect(float x, float y, float w, float h)
        {
            _context.Rect(x, y, w, h);
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
            get { return _font; }
            set
            {
                _font = value;
                _context.Font = value.ToCssString();
            }
        }

        public TextAlign TextAlign
        {
            get
            {
                switch (_context.TextAlign)
                {
                    case System.Html.Media.Graphics.TextAlign.Left:
                        return TextAlign.Left;
                    case System.Html.Media.Graphics.TextAlign.Center:
                        return TextAlign.Center;
                    case System.Html.Media.Graphics.TextAlign.Right:
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
                        _context.TextAlign = System.Html.Media.Graphics.TextAlign.Left;
                        break;
                    case TextAlign.Center:
                        _context.TextAlign = System.Html.Media.Graphics.TextAlign.Center;
                        break;
                    case TextAlign.Right:
                        _context.TextAlign = System.Html.Media.Graphics.TextAlign.Right;
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
                    case System.Html.Media.Graphics.TextBaseline.Top:
                        return TextBaseline.Top;
                    case System.Html.Media.Graphics.TextBaseline.Middle:
                        return TextBaseline.Middle;
                    case System.Html.Media.Graphics.TextBaseline.Bottom:
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
                        _context.TextBaseline = System.Html.Media.Graphics.TextBaseline.Top;
                        break;
                    case TextBaseline.Middle:
                        _context.TextBaseline = System.Html.Media.Graphics.TextBaseline.Middle;
                        break;
                    case TextBaseline.Bottom:
                        _context.TextBaseline = System.Html.Media.Graphics.TextBaseline.Bottom;
                        break;
                }
            }
        }

        public void FillText(string text, float x, float y)
        {
            _context.FillText(text, x, y);
        }

        public float MeasureText(string text)
        {
            return (float)_context.MeasureText(text).Width;
        }
    }
}
#endif