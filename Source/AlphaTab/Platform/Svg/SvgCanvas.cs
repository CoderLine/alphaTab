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

using System;
using AlphaTab.Collections;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Platform.Svg
{
    /// <summary>
    ///  A canvas implementation storing SVG data
    /// </summary>
    public class SvgCanvas : ICanvas, IPathCanvas
    {
        private StringBuilder _buffer;
        private string _currentPath;
        private bool _currentPathIsEmpty;

        public Color Color { get; set; }
        public float LineWidth { get; set; }
        public Font Font { get; set; }
        public TextAlign TextAlign { get; set; }
        public TextBaseline TextBaseline { get; set; }
        public RenderingResources Resources { get; set; }

        public SvgCanvas()
        {
            _currentPath = "";
            _currentPathIsEmpty = true;
            Color = new Color(255, 255, 255);
            LineWidth = 1;
            Font = new Font("Arial", 10);
            TextAlign = TextAlign.Left;
            TextBaseline = TextBaseline.Default;
        }

        public void BeginRender(float width, float height)
        {
            _buffer = new StringBuilder();

            _buffer.Append("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"");
            _buffer.Append(width);
            _buffer.Append("px\" height=\"");
            _buffer.Append(height);
            _buffer.Append("px\" class=\"alphaTabSurfaceSvg\">\n");
            _currentPath = "";
            _currentPathIsEmpty = true;
        }

        public object EndRender()
        {
            _buffer.Append("</svg>");
            return _buffer.ToString();
        }

        public void FillRect(float x, float y, float w, float h)
        {
            _buffer.Append("<rect x=\"");
            _buffer.Append(x - 0.5f);
            _buffer.Append("\" y=\"");
            _buffer.Append(y - 0.5f);
            _buffer.Append("\" width=\"");
            _buffer.Append(w);
            _buffer.Append("\" height=\"");
            _buffer.Append(h);
            _buffer.Append("\" style=\"fill:");
            _buffer.Append(Color.ToRgbaString());
            _buffer.Append(";\" />\n");
        }

        public void StrokeRect(float x, float y, float w, float h)
        {
            _buffer.Append("<rect x=\"");
            _buffer.Append(x - 0.5f);
            _buffer.Append("\" y=\"");
            _buffer.Append(y - 0.5f);
            _buffer.Append("\" width=\"");
            _buffer.Append(w);
            _buffer.Append("\" height=\"");
            _buffer.Append(h);
            _buffer.Append("\" style=\"stroke:");
            _buffer.Append(Color.ToRgbaString());
            _buffer.Append("; stroke-width:");
            _buffer.Append(LineWidth);
            _buffer.Append(";\" />\n");
        }

        public void BeginPath()
        {

        }

        public void ClosePath()
        {
            _currentPath += " z";
        }

        public void MoveTo(float x, float y)
        {
            _currentPath += " M";
            _currentPath += x - 0.5f;
            _currentPath += ",";
            _currentPath += y - 0.5f;
        }

        public void LineTo(float x, float y)
        {
            _currentPathIsEmpty = false;
            _currentPath += " L";
            _currentPath += x - 0.5f;
            _currentPath += ",";
            _currentPath += y - 0.5f;
        }

        public void QuadraticCurveTo(float cpx, float cpy, float x, float y)
        {
            _currentPathIsEmpty = false;
            _currentPath += " Q";
            _currentPath += cpx;
            _currentPath += ",";
            _currentPath += cpy;
            _currentPath += ",";
            _currentPath += x;
            _currentPath += ",";
            _currentPath += y;
        }

        public void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y)
        {
            _currentPathIsEmpty = false;
            _currentPath += " C";
            _currentPath += cp1x;
            _currentPath += ",";
            _currentPath += cp1y;
            _currentPath += ",";
            _currentPath += cp2x;
            _currentPath += ",";
            _currentPath += cp2y;
            _currentPath += ",";
            _currentPath += x;
            _currentPath += ",";
            _currentPath += y;
        }

        public void FillCircle(float x, float y, float radius)
        {
            _currentPathIsEmpty = false;
            // 
            // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
            _currentPath += " M";
            _currentPath += x - radius;
            _currentPath += ",";
            _currentPath += y;

            _currentPath += " A1,1 0 0,0 ";
            _currentPath += x + radius;
            _currentPath += ",";
            _currentPath += y;

            _currentPath += " A1,1 0 0,0 ";
            _currentPath += x - radius;
            _currentPath += ",";
            _currentPath += y;

            _currentPath += " z";

            Fill();
        }

        public void Fill()
        {
            if (!_currentPathIsEmpty)
            {
                _buffer.Append("<path d=\"");
                _buffer.Append(_currentPath);
                _buffer.Append("\" style=\"fill:");
                _buffer.Append(Color.ToRgbaString());
                _buffer.Append("\" stroke=\"none\"/>\n");
            }
            _currentPath = "";
            _currentPathIsEmpty = true;
        }

        public void Stroke()
        {
            if (!_currentPathIsEmpty)
            {
                _buffer.Append("<path d=\"");
                _buffer.Append(_currentPath);
                _buffer.Append("\" style=\"stroke:");
                _buffer.Append(Color.ToRgbaString());
                _buffer.Append("; stroke-width:");
                _buffer.Append(LineWidth);
                _buffer.Append(";\" fill=\"none\" />\n");
            }
            _currentPath = "";
            _currentPathIsEmpty = true;
        }

        public void FillText(string text, float x, float y)
        {
            _buffer.Append("<text x=\"");
            _buffer.Append(x);
            _buffer.Append("\" y=\"");
            _buffer.Append(y + GetSvgBaseLineOffset());
            _buffer.Append("\" style=\"font:");
            _buffer.Append(Font.ToCssString());
            _buffer.Append("; fill:");
            _buffer.Append(Color.ToRgbaString());
            _buffer.Append(";\" ");
            _buffer.Append(" dominant-baseline=\"");
            _buffer.Append(GetSvgBaseLine());
            _buffer.Append("\" text-anchor=\"");
            _buffer.Append(GetSvgTextAlignment());
            _buffer.Append("\">\n");
            _buffer.Append(text);
            _buffer.Append("</text>\n");
        }

        private string GetSvgTextAlignment()
        {
            switch (TextAlign)
            {
                case TextAlign.Left: return "start";
                case TextAlign.Center: return "middle";
                case TextAlign.Right: return "end";
            }
            return "";
        }

        private float GetSvgBaseLineOffset()
        {
            switch (TextBaseline)
            {
                case TextBaseline.Top: return 0;
                case TextBaseline.Middle: return 0;
                case TextBaseline.Bottom: return 0;
                default: return Font.Size;
            }
        }

        private string GetSvgBaseLine()
        {
            switch (TextBaseline)
            {
                case TextBaseline.Top: return "top";
                case TextBaseline.Middle: return "middle";
                case TextBaseline.Bottom: return "bottom";
                default: return "top";
            }
        }

        public float MeasureText(string text)
        {
            if (string.IsNullOrEmpty(text)) return 0;
            var font = SupportedFonts.Arial;
            if (Font.Family.Contains("Times"))
            {
                font = SupportedFonts.TimesNewRoman;
            }
            return FontSizes.MeasureString(text, font, Font.Size, Font.Style);
        }

        public void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol)
        {
            if (symbol == MusicFontSymbol.None)
            {
                return;
            }

            //_buffer += "<text x=\"";
            //_buffer += x;
            //_buffer += "\" y=\"";
            //_buffer += y + GetSvgBaseLineOffset();
            //_buffer += "\" style=\"font:";
            //_buffer += Resources.MusicFont.ToCssString();
            //_buffer += "; fill:";
            //_buffer += Color.ToRgbaString();
            //_buffer += ";\" ";
            //_buffer += " dominant-baseline=\"top\" text-anchor=\"start\"";
            //_buffer += ">&#x";
            //_buffer += Std.ToHexString((int)symbol);
            //_buffer += ";</text>\n";


            //if (symbol == MusicFontSymbol.None)
            //{
            //    return;
            //}

            SvgRenderer glyph = new SvgRenderer(MusicFont.SymbolLookup[symbol], scale, scale);
            glyph.Paint(x, y, this);
        }
    }
}