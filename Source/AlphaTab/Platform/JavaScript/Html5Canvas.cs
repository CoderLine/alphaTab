using System;
using AlphaTab.Platform.Model;

namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// A canvas implementation for HTML5 canvas
    /// </summary>
    public class Html5Canvas : ICanvas
    {
        private readonly dynamic /*HTMLCanvasElement*/ _canvas;
        private dynamic /*CanvasRenderingContext2D*/ _context;
        private Color _color;
        private Font _font;

        public Html5Canvas(dynamic dom)
        {
            _canvas = dom;
            _context = dom.getContext("2d");
            _context.textBaseline = "top";
        }

        public int Width
        {
            get { return (int)_canvas.width; }
            set
            {
                var lineWidth = _context.lineWidth;
                _canvas.width = (ulong)value;
                _context = _canvas.getContext("2d");
                _context.textBaseline = "top";
                _context.lineWidth = lineWidth;
            }
        }

        public int Height
        {
            get { return (int)_canvas.height; }
            set
            {
                var lineWidth = _context.lineWidth;
                _canvas.height = (ulong)value;
                _context = _canvas.getContext("2d");
                _context.textBaseline = "top";
                _context.lineWidth = lineWidth;
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
                _context.strokeStyle = value.ToRgbaString();
                _context.fillStyle = value.ToRgbaString();
            }
        }

        public float LineWidth
        {
            get
            {
                return (float)_context.lineWidth;
            }
            set
            {
                _context.lineWidth = value;
            }
        }

        public void Clear()
        {
            var lineWidth = _context.lineWidth;
            _canvas.width = _canvas.width;
            _context.lineWidth = lineWidth;
            // this._context.clearRect(0,0,_width, _height);
        }

        public void FillRect(float x, float y, float w, float h)
        {
            _context.fillRect(x - 0.5, y - 0.5, w, h);
        }

        public void StrokeRect(float x, float y, float w, float h)
        {
            _context.strokeRect(x - 0.5, y - 0.5, w, h);
        }

        public void BeginPath()
        {
            _context.beginPath();
        }

        public void ClosePath()
        {
            _context.closePath();
        }

        public void MoveTo(float x, float y)
        {
            _context.moveTo(x - 0.5, y - 0.5);
        }

        public void LineTo(float x, float y)
        {
            _context.moveTo(x - 0.5, y - 0.5);
        }

        public void QuadraticCurveTo(float cpx, float cpy, float x, float y)
        {
            _context.quadraticCurveTo(cpx, cpy, x, y);
        }

        public void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y)
        {
            _context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }

        public void Circle(float x, float y, float radius)
        {
            _context.arc(x, y, radius, 0, Math.PI, true);
        }

        public void Rect(float x, float y, float w, float h)
        {
            _context.rect(x, y, w, h);
        }

        public void Fill()
        {
            _context.fill();
        }

        public void Stroke()
        {
            _context.stroke();
        }

        public Font Font
        {
            get { return _font; }
            set
            {
                _font = value;
                _context.font = value.ToCssString();
            }
        }

        public TextAlign TextAlign
        {
            get
            {
                switch ((string)_context.textAlign)
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
                        _context.textAlign = "left";
                        break;
                    case TextAlign.Center:
                        _context.textAlign = "center";
                        break;
                    case TextAlign.Right:
                        _context.textAlign = "right";
                        break;
                }
            }
        }

        public TextBaseline TextBaseline
        {
            get
            {
                switch ((string)_context.textBaseline)
                {
                    case "top":
                        return TextBaseline.Top;
                    case "middle":
                        return TextBaseline.Middle;
                    case "bottom":
                        return TextBaseline.Bottom;
                    default:
                        return TextBaseline.Default;
                }
            }
            set
            {
                switch (value)
                {
                    case TextBaseline.Top:
                        _context.textBaseline = "top";
                        break;
                    case TextBaseline.Middle:
                        _context.textBaseline = "middle";
                        break;
                    case TextBaseline.Bottom:
                        _context.textBaseline = "bottom";
                        break;
                    default:
                        _context.textBaseline = "alphabetic";
                        break;
                }
            }
        }

        public void FillText(string text, float x, float y)
        {
            _context.fillText(text, x, y);
        }

        public float MeasureText(string text)
        {
            return (float)_context.measureText(text).width;
        }
    }
}
