using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.Reflection;
using System.Runtime.InteropServices;
using GdiFont = System.Drawing.Font;
using GdiFontStyle = System.Drawing.FontStyle;
using GdiColor = System.Drawing.Color;
using String = AlphaTab.Core.EcmaScript.String;

namespace AlphaTab.Platform.CSharp
{
    internal sealed class GdiCanvas : ICanvas
    {
        private static readonly Graphics MeasurementGraphics;
        private static readonly PrivateFontCollection MusicFontCollection;
        private static readonly StringFormat MusicFontFormat;
        private static readonly StringFormat MusicFontFormatCenter;

        static GdiCanvas()
        {
            var measurementImage = new Bitmap(1, 1);
            var newGraphics = MeasurementGraphics = Graphics.FromImage(measurementImage);
            newGraphics.SmoothingMode = SmoothingMode.HighQuality;
            newGraphics.TextRenderingHint = TextRenderingHint.AntiAlias;
            newGraphics.Clear(GdiColor.Transparent);

            MusicFontFormat = new StringFormat(StringFormat.GenericTypographic)
            {
                LineAlignment = StringAlignment.Center,
                Alignment = StringAlignment.Near
            };

            MusicFontFormatCenter = new StringFormat(StringFormat.GenericTypographic)
            {
                LineAlignment = StringAlignment.Center,
                Alignment = StringAlignment.Center
            };

            MusicFontCollection = new PrivateFontCollection();

            var type = typeof(GdiCanvas).GetTypeInfo();
            using var bravura =
                type.Assembly.GetManifestResourceStream(type.Namespace + ".Bravura.ttf");
            var dataPtr = Marshal.AllocCoTaskMem((int) bravura.Length);
            try
            {
                var fontData = new byte[bravura.Length];
                bravura.Read(fontData, 0, fontData.Length);
                Marshal.Copy(fontData, 0, dataPtr, fontData.Length);

                MusicFontCollection.AddMemoryFont(dataPtr, fontData.Length);
            }
            finally
            {
                Marshal.FreeCoTaskMem(dataPtr);
            }
        }

        private static readonly Dictionary<double, GdiFont> FontLookup =
            new Dictionary<double, GdiFont>();

        private static GdiFont GetMusicFont(double scale)
        {
            if (!FontLookup.TryGetValue(scale, out var font))
            {
                FontLookup[scale] = font =
                    new GdiFont(MusicFontCollection.Families[0], (float) (34 * scale),
                        GdiFontStyle.Regular,
                        GraphicsUnit.Pixel);
            }

            return font;
        }


        private Bitmap _image;
        private double _width;
        private double _height;
        private Graphics _graphics;

        private GraphicsPath _currentPath;

        private double _currentX;
        private double _currentY;

        private readonly StringFormat _stringFormat;

        private double _lineWidth;
        private GdiFont _font;
        private TextAlign _textAlign;
        private TextBaseline _textBaseline;

        private SolidBrush _brush;
        private Pen _pen;
        private GdiColor _color;

        public Settings Settings { get; set; }

        public Model.Color Color
        {
            get => new Model.Color(_color.R, _color.G, _color.B, _color.A);
            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException(nameof(value));
                }

                _color = GdiColor.FromArgb((byte) value.A, (byte) value.R, (byte) value.G,
                    (byte) value.B);
                RecreateBrush();
                RecreatePen();
            }
        }

        public double LineWidth
        {
            get => _lineWidth;
            set
            {
                _lineWidth = value;
                RecreatePen();
            }
        }


        public Model.Font Font
        {
            get
            {
                var fs = Model.FontStyle.Plain;
                if (_font.Bold)
                {
                    fs = Model.FontStyle.Bold;
                }

                if (_font.Italic)
                {
                    fs = Model.FontStyle.Italic;
                }

                return new Model.Font(_font.FontFamily.Name, _font.Size * Settings.Display.Scale,
                    fs);
            }
            set
            {
                var fontStyle = GdiFontStyle.Regular;
                if (value.IsBold)
                {
                    fontStyle |= GdiFontStyle.Bold;
                }

                if (value.IsItalic)
                {
                    fontStyle = GdiFontStyle.Italic;
                }

                _font = new GdiFont(value.Family, (float) (value.Size * Settings.Display.Scale),
                    fontStyle,
                    GraphicsUnit.Pixel);
            }
        }

        public TextAlign TextAlign
        {
            get => _textAlign;
            set
            {
                _textAlign = value;
                switch (value)
                {
                    case TextAlign.Left:
                        _stringFormat.Alignment = StringAlignment.Near;
                        break;
                    case TextAlign.Center:
                        _stringFormat.Alignment = StringAlignment.Center;
                        break;
                    case TextAlign.Right:
                        _stringFormat.Alignment = StringAlignment.Far;
                        break;
                }
            }
        }

        public TextBaseline TextBaseline
        {
            get => _textBaseline;
            set
            {
                _textBaseline = value;
                switch (value)
                {
                    case TextBaseline.Top:
                        _stringFormat.LineAlignment = StringAlignment.Near;
                        break;
                    case TextBaseline.Middle:
                        _stringFormat.LineAlignment = StringAlignment.Center;
                        break;
                    case TextBaseline.Bottom:
                        _stringFormat.LineAlignment = StringAlignment.Far;
                        break;
                }
            }
        }

        public GdiCanvas()
        {
            _image = null!;
            _graphics = null!;
            _brush = null!;
            _pen = null!;
            Settings = null!;

            _width = 1;
            _height = 1;

            _currentPath = new GraphicsPath(FillMode.Winding);
            _stringFormat = new StringFormat(StringFormat.GenericTypographic)
            {
                LineAlignment = StringAlignment.Near,
                Alignment = StringAlignment.Near
            };

            _lineWidth = 1;
            _currentX = 0;
            _currentY = 0;
            _font = new GdiFont("Arial", 10, GraphicsUnit.Pixel);
            _textAlign = TextAlign.Left;
            _textBaseline = TextBaseline.Top;

            Color = new Model.Color(255, 255, 255);

            RecreateImage();
        }

        public void BeginRender(double width, double height)
        {
            _width = width;
            _height = height;
            RecreateImage();
        }

        public object EndRender()
        {
            _graphics.Dispose();
            return _image;
        }

        public object OnRenderFinished()
        {
            // nothing to do
            return null;
        }

        public void BeginGroup(string identifier)
        {
        }

        public void EndGroup()
        {
        }

        private void RecreateImage()
        {
            var newImage = new Bitmap((int) _width, (int) _height, PixelFormat.Format32bppPArgb);
            var newGraphics = Graphics.FromImage(newImage);
            newGraphics.CompositingMode = CompositingMode.SourceOver;
            newGraphics.SmoothingMode = SmoothingMode.HighQuality;
            newGraphics.TextRenderingHint = TextRenderingHint.AntiAlias;

            _graphics?.Dispose();

            _image = newImage;
            _graphics = newGraphics;
        }

        private void RecreatePen()
        {
            var newPen = new Pen(_color, (float) _lineWidth);
            _pen?.Dispose();

            _pen = newPen;
        }

        private void RecreateBrush()
        {
            var newBrush = new SolidBrush(_color);
            _brush?.Dispose();

            _brush = newBrush;
        }

        public void FillRect(double x, double y, double w, double h)
        {
            _graphics.FillRectangle(_brush, (float) x, (float) y, (float) w, (float) h);
        }

        public void StrokeRect(double x, double y, double w, double h)
        {
            _graphics.DrawRectangle(_pen, (float) x, (float) y, (float) w, (float) h);
        }

        public void BeginPath()
        {
            _currentPath.StartFigure();
        }

        public void ClosePath()
        {
            _currentPath.CloseFigure();
        }

        public void MoveTo(double x, double y)
        {
            _currentX = x;
            _currentY = y;
        }

        public void LineTo(double x, double y)
        {
            _currentPath.AddLine((float) _currentX, (float) _currentY, (float) x, (float) y);
            _currentX = x;
            _currentY = y;
        }

        public void QuadraticCurveTo(double cpx, double cpy, double x, double y)
        {
            _currentPath.AddBezier((float) _currentX, (float) _currentY, (float) cpx, (float) cpy,
                (float) cpx, (float) cpy, (float) x, (float) y);
            _currentX = x;
            _currentY = y;
        }

        public void BezierCurveTo(double cp1x, double cp1y, double cp2x, double cp2y, double x,
            double y)
        {
            _currentPath.AddBezier((float) _currentX, (float) _currentY, (float) cp1x, (float) cp1y,
                (float) cp2x, (float) cp2y, (float) x, (float) y);
            _currentX = x;
            _currentY = y;
        }

        public void FillCircle(double x, double y, double radius)
        {
            _currentPath.StartFigure();
            _currentPath.AddEllipse((float) (x - radius), (float) (y - radius), (float) radius * 2,
                (float) radius * 2);
            _currentPath.CloseFigure();
            _currentX = x;
            _currentY = y;
            Fill();
        }
        
        public void StrokeCircle(double x, double y, double radius)
        {
            _currentPath.StartFigure();
            _currentPath.AddEllipse((float) (x - radius), (float) (y - radius), (float) radius * 2,
                (float) radius * 2);
            _currentPath.CloseFigure();
            _currentX = x;
            _currentY = y;
            Stroke();
        }

        public void Fill()
        {
            _graphics.FillPath(_brush, _currentPath);
            _currentPath.Dispose();
            _currentPath = new GraphicsPath(FillMode.Winding);
        }

        public void Stroke()
        {
            _graphics.DrawPath(_pen, _currentPath);
            _currentPath.Dispose();
            _currentPath = new GraphicsPath(FillMode.Winding);
        }

        public void FillText(string text, double x, double y)
        {
            _graphics.DrawString(text, _font, _brush, new PointF((float) x, (float) y), _stringFormat);
        }

        public double MeasureText(string text)
        {
            lock (MeasurementGraphics)
            {
                return MeasurementGraphics.MeasureString(text, _font, new PointF(0,0), _stringFormat).Width;
            }
        }

        public void FillMusicFontSymbol(double x, double y, double scale, MusicFontSymbol symbol,
            bool centerAtPosition =
                false)
        {
            if (symbol == MusicFontSymbol.None)
            {
                return;
            }

            // for whatever reason the padding on GDI font rendering is a bit messed up, there is 1px padding on the left
            x += scale;

            _graphics.DrawString(String.FromCharCode((int) symbol), GetMusicFont(scale),
                _brush, (float) x, (float) y,
                centerAtPosition ? MusicFontFormatCenter : MusicFontFormat);
        }

        public void FillMusicFontSymbols(double x, double y, double scale,
            IList<MusicFontSymbol> symbols,
            bool centerAtPosition
                = false)
        {
            var s = "";
            foreach (var symbol in symbols)
            {
                if (symbol != MusicFontSymbol.None)
                {
                    s += String.FromCharCode((int) symbol);
                }
            }

            // for whatever reason the padding on GDI font rendering is a bit messed up, there is 1px padding on the left
            x += scale;

            _graphics.DrawString(s, GetMusicFont(scale), _brush, (float) x, (float) y,
                centerAtPosition ? MusicFontFormatCenter : MusicFontFormat);
        }

        public void BeginRotate(double centerX, double centerY, double angle)
        {
            _graphics.TranslateTransform((float) centerX, (float) centerY);
            _graphics.RotateTransform((float) angle);
        }

        public void EndRotate()
        {
            _graphics.ResetTransform();
        }
    }
}
