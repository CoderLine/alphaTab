/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Utils;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.Windows.Documents;
using System.Windows.Forms;
using AlphaTab.Platform.Model;
using Color = AlphaTab.Platform.Model.Color;
using Font = AlphaTab.Platform.Model.Font;
using FontStyle = AlphaTab.Platform.Model.FontStyle;
using GdiFont = System.Drawing.Font;
using GdiFontStyle = System.Drawing.FontStyle;
using GdiColor = System.Drawing.Color;

namespace AlphaTab.Platform.CSharp
{
    public class GdiCanvas : ICanvas, IPathCanvas
    {
        private static readonly Bitmap MeasurementImage;
        private static readonly Graphics MeasurementGraphics;

        static GdiCanvas()
        {
            MeasurementImage = new Bitmap(1, 1);
            var newGraphics = MeasurementGraphics = Graphics.FromImage(MeasurementImage);
            newGraphics.SmoothingMode = SmoothingMode.HighQuality;
            newGraphics.TextRenderingHint = TextRenderingHint.AntiAlias;
            newGraphics.Clear(GdiColor.Transparent);
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

        public RenderingResources Resources { get; set; }

        public Color Color
        {
            get
            {
                return new Color(_color.R, _color.G, _color.B, _color.A);
            }
            set
            {
                if (value == null) throw new ArgumentNullException("value");
                _color = GdiColor.FromArgb(value.A, value.R, value.G, value.B);
                RecreateBrush();
                RecreatePen();
            }
        }

        public float LineWidth
        {
            get { return _lineWidth; }
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
                FontStyle fs = FontStyle.Plain;
                if (_font.Bold) fs |= FontStyle.Bold;
                if (_font.Italic) fs |= FontStyle.Italic;
                return new Font(_font.FontFamily.Name, _font.Size, fs);
            }
            set
            {
                var fontStyle = GdiFontStyle.Regular;
                if (value.IsBold) fontStyle |= GdiFontStyle.Bold;
                if (value.IsItalic) fontStyle = GdiFontStyle.Italic;

                _font = new GdiFont(value.Family, value.Size, fontStyle, GraphicsUnit.Pixel);
            }
        }

        public TextAlign TextAlign
        {
            get { return _textAlign; }
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
            get { return _textBaseline; }
            set
            {
                _textBaseline = value;
                switch (value)
                {
                    case TextBaseline.Default:
                        _stringFormat.LineAlignment = StringAlignment.Near;
                        break;
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
            _stringFormat = new StringFormat();
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

        private void RecreateImage()
        {
            var newImage = new Bitmap((int)_width, (int)_height, PixelFormat.Format32bppArgb);
            var newGraphics = Graphics.FromImage(newImage);
            newGraphics.SmoothingMode = SmoothingMode.HighQuality;
            newGraphics.TextRenderingHint = TextRenderingHint.AntiAlias;
            newGraphics.Clear(GdiColor.Transparent);

            if (_graphics != null)
                _graphics.Dispose();

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
            _graphics.FillRectangle(_brush, x, y, w, h);
        }

        public void StrokeRect(float x, float y, float w, float h)
        {
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
            _currentX = x;
            _currentY = y;
        }

        public void LineTo(float x, float y)
        {
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
            _graphics.DrawString(text, _font, _brush, new PointF(x, y), _stringFormat);
        }

        public float MeasureText(string text)
        {
            lock (MeasurementGraphics)
            {
                return MeasurementGraphics.MeasureString(text, _font).Width;
            }
        }

        public void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol)
        {
            if (symbol == MusicFontSymbol.None)
            {
                return;
            }

            SvgRenderer glyph = new SvgRenderer(MusicFont.SymbolLookup[symbol], scale, scale);
            glyph.Paint(x, y, this);
        }
    }
}