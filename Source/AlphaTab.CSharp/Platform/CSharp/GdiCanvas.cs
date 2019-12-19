﻿#if NET48
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Utils;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.Runtime.InteropServices;
using AlphaTab.Platform.Model;
using Color = AlphaTab.Platform.Model.Color;
using Font = AlphaTab.Platform.Model.Font;
using FontStyle = AlphaTab.Platform.Model.FontStyle;
using GdiFont = System.Drawing.Font;
using GdiFontStyle = System.Drawing.FontStyle;
using GdiColor = System.Drawing.Color;

namespace AlphaTab.Platform.CSharp
{
    internal class GdiCanvas : ICanvas
    {
        protected const float BlurCorrection = 0.5f;

        private static readonly Bitmap MeasurementImage;
        private static readonly Graphics MeasurementGraphics;
        private static readonly PrivateFontCollection MusicFontCollection;
        private static readonly StringFormat MusicFontFormat;
        private static readonly StringFormat MusicFontFormatCenter;

        static GdiCanvas()
        {
            MeasurementImage = new Bitmap(1, 1);
            var newGraphics = MeasurementGraphics = Graphics.FromImage(MeasurementImage);
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

            using (var bravura = typeof(GdiCanvas).Assembly.GetManifestResourceStream(typeof(GdiCanvas), "Bravura.ttf"))
            {
                var dataPtr = Marshal.AllocCoTaskMem((int)bravura.Length);
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
        }

        private static readonly Dictionary<float, GdiFont> FontLookup = new Dictionary<float, GdiFont>();
        private static GdiFont GetMusicFont(float scale)
        {
            GdiFont font;
            if (!FontLookup.TryGetValue(scale, out font))
            {
                FontLookup[scale] = font =
 new GdiFont(MusicFontCollection.Families[0], 34 * scale, GdiFontStyle.Regular, GraphicsUnit.Pixel);
            }
            return font;
        }


        private Bitmap _image;
        private float _width;
        private float _height;
        private Graphics _graphics;

        private GraphicsPath _currentPath;

        private float _currentX;
        private float _currentY;

        private readonly StringFormat _stringFormat;

        private float _lineWidth;
        private GdiFont _font;
        private TextAlign _textAlign;
        private TextBaseline _textBaseline;

        private SolidBrush _brush;
        private Pen _pen;
        private GdiColor _color;

        public Settings Settings { get; set; }

        public Color Color
        {
            get => new Color(_color.R, _color.G, _color.B, _color.A);
            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException("value");
                }

                _color = GdiColor.FromArgb(value.A, value.R, value.G, value.B);
                RecreateBrush();
                RecreatePen();
            }
        }

        public float LineWidth
        {
            get => _lineWidth;
            set
            {
                _lineWidth = value;
                RecreatePen();
            }
        }


        public Font Font
        {
            get
            {
                var fs = FontStyle.Plain;
                if (_font.Bold)
                {
                    fs |= FontStyle.Bold;
                }

                if (_font.Italic)
                {
                    fs |= FontStyle.Italic;
                }

                return new Font(_font.FontFamily.Name, _font.Size * Settings.Display.Scale, fs);
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

                _font = new GdiFont(value.Family, value.Size * Settings.Display.Scale, fontStyle, GraphicsUnit.Pixel);
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
            _width = 1;
            _height = 1;

            _currentPath = new GraphicsPath(FillMode.Winding);
            _stringFormat = new StringFormat(StringFormat.GenericTypographic);
            _stringFormat.LineAlignment = StringAlignment.Near;

            _lineWidth = 1;
            _currentX = 0;
            _currentY = 0;
            _font = new GdiFont("Arial", 10, GraphicsUnit.Pixel);
            _textAlign = TextAlign.Left;
            _textBaseline = TextBaseline.Top;

            Color = new Color(255, 255, 255);

            RecreateImage();
        }

        public void BeginRender(float width, float height)
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

        public virtual object OnRenderFinished()
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
            var newImage = new Bitmap((int)_width, (int)_height, PixelFormat.Format32bppPArgb);
            var newGraphics = Graphics.FromImage(newImage);
            newGraphics.CompositingMode = CompositingMode.SourceOver;
            newGraphics.SmoothingMode = SmoothingMode.HighQuality;
            newGraphics.TextRenderingHint = TextRenderingHint.AntiAlias;

            if (_graphics != null)
            {
                _graphics.Dispose();
            }

            _image = newImage;
            _graphics = newGraphics;
        }

        private void RecreatePen()
        {
            var newPen = new Pen(_color, _lineWidth);
            if (_pen != null)
            {
                _pen.Dispose();
            }
            _pen = newPen;
        }

        private void RecreateBrush()
        {
            var newBrush = new SolidBrush(_color);
            if (_brush != null)
            {
                _brush.Dispose();
            }
            _brush = newBrush;
        }

        public void Clear()
        {
            _graphics.Clear(GdiColor.Transparent);
        }

        public void FillRect(float x, float y, float w, float h)
        {
            x = (int)x - BlurCorrection;
            y = (int)y - BlurCorrection;
            _graphics.FillRectangle(_brush, x, y, w, h);
        }

        public void StrokeRect(float x, float y, float w, float h)
        {
            x = (int)x - BlurCorrection;
            y = (int)y - BlurCorrection;
            _graphics.DrawRectangle(_pen, x, y, w, h);
        }

        public void BeginPath()
        {
            _currentPath.StartFigure();
        }

        public void ClosePath()
        {
            _currentPath.CloseFigure();
        }

        public void MoveTo(float x, float y)
        {
            x = (int)x - BlurCorrection;
            y = (int)y - BlurCorrection;
            _currentX = x;
            _currentY = y;
        }

        public void LineTo(float x, float y)
        {
            x = (int)x - BlurCorrection;
            y = (int)y - BlurCorrection;
            _currentPath.AddLine(_currentX, _currentY, x, y);
            _currentX = x;
            _currentY = y;
        }

        public void QuadraticCurveTo(float cpx, float cpy, float x, float y)
        {
            _currentPath.AddBezier(_currentX, _currentY, cpx, cpy, cpx, cpy, x, y);
            _currentX = x;
            _currentY = y;
        }

        public void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y)
        {
            _currentPath.AddBezier(_currentX, _currentY, cp1x, cp1y, cp2x, cp2y, x, y);
            _currentX = x;
            _currentY = y;
        }

        public void FillCircle(float x, float y, float radius)
        {
            _currentPath.StartFigure();
            _currentPath.AddEllipse(x - radius, y - radius, radius * 2, radius * 2);
            _currentPath.CloseFigure();
            _currentX = x;
            _currentY = y;
            Fill();
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

        public void FillText(string text, float x, float y)
        {
            _graphics.DrawString(text, _font, _brush, new Point((int)x, (int)y), _stringFormat);
        }

        public float MeasureText(string text)
        {
            lock (MeasurementGraphics)
            {
                return MeasurementGraphics.MeasureString(text, _font).Width;
            }
        }

        public void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol, bool centerAtPosition =
 false)
        {
            if (symbol == MusicFontSymbol.None)
            {
                return;
            }

            // for whatever reason the padding on GDI font rendering is a bit messed up, there is 1px padding on the left
            x += scale;

            _graphics.DrawString(Platform.StringFromCharCode((int)symbol), GetMusicFont(scale), _brush, x, y, centerAtPosition ? MusicFontFormatCenter : MusicFontFormat);
        }

        public void FillMusicFontSymbols(float x, float y, float scale, MusicFontSymbol[] symbols, bool centerAtPosition
 = false)
        {
            var s = "";
            foreach (var symbol in symbols)
            {
                if (symbol != MusicFontSymbol.None)
                {
                    s += Platform.StringFromCharCode((int)symbol);
                }
            }

            // for whatever reason the padding on GDI font rendering is a bit messed up, there is 1px padding on the left
            x += scale;

            _graphics.DrawString(s, GetMusicFont(scale), _brush, x, y, centerAtPosition ? MusicFontFormatCenter : MusicFontFormat);
        }

        public void BeginRotate(float centerX, float centerY, float angle)
        {
            _graphics.TranslateTransform(centerX, centerY);
            _graphics.RotateTransform(angle);
        }

        public void EndRotate()
        {
            _graphics.ResetTransform();
        }
    }
}
#endif
