/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Collections;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Platform.Svg
{
    /// <summary>
    ///  A canvas implementation storing SVG data
    /// </summary>
    public abstract class SvgCanvas : ICanvas, IPathCanvas
    {
        protected const float BlurCorrection = 0.5f;

        protected StringBuilder Buffer;
        private StringBuilder _currentPath;
        private bool _currentPathIsEmpty;

        public Color Color { get; set; }
        public float LineWidth { get; set; }
        public Font Font { get; set; }
        public TextAlign TextAlign { get; set; }
        public TextBaseline TextBaseline { get; set; }
        public RenderingResources Resources { get; set; }

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
            Buffer.Append(height);
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
                Buffer.Append("<rect x=\"" + ((int)x - BlurCorrection) + "\" y=\"" + ((int)y - BlurCorrection) + "\" width=\"" + w + "\" height=\"" + h + "\" fill=\"" + Color.RGBA + "\" />\n");
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
                 + "\" stroke=\"" + Color.RGBA + "\"");
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

        public void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y)
        {
            _currentPathIsEmpty = false;
            _currentPath.Append(" C" + cp1x + "," + cp1y + "," + cp2x + "," + cp2y + "," + x + "," + y);
        }

        public void FillCircle(float x, float y, float radius)
        {
            _currentPathIsEmpty = false;
            // 
            // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
            _currentPath.Append(" M" + (x - radius) + "," + y + " A1,1 0 0,0 " + (x + radius) + "," + y + " A1,1 0 0,0 " + (x - radius) + "," + y + " z");
            Fill();
        }

        public void Fill()
        {
            if (!_currentPathIsEmpty)
            {
                Buffer.Append("<path d=\"" + _currentPath + "\"");
                if (Color.RGBA != Color.BlackRgb)
                {
                    Buffer.Append(" fill=\"" + Color.RGBA + "\"");
                }
                Buffer.Append(" stroke=\"none\"/>");

            }
            _currentPath = new StringBuilder();
            _currentPathIsEmpty = true;
        }

        public void Stroke()
        {
            if (!_currentPathIsEmpty)
            {
                var s = "<path d=\"" + _currentPath + "\" stroke=\"" + Color.RGBA + "\"";
                if (LineWidth != 1)
                {
                    s += " stroke-width=\"" + LineWidth + "\"";
                }
                s += " fill=\"none\" />";
                Buffer.Append(s);
            }
            _currentPath = new StringBuilder();
            _currentPathIsEmpty = true;
        }

        public void FillText(string text, float x, float y)
        {
            var s = "<text x=\"" + ((int)x) + "\" y=\"" + ((int)y) + "\" style=\"font:" + Font.ToCssString() + "\" "
                    + " dominant-baseline=\"" + GetSvgBaseLine() + "\"";
            if (Color.RGBA != Color.BlackRgb)
            {
                s += " fill=\"" + Color.RGBA + "\"";
            }
            if (TextAlign != TextAlign.Left)
            {
                s += " text-anchor=\"" + GetSvgTextAlignment() + "\"";
            }
            s+= ">" + text + "</text>";
            Buffer.Append(s);
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
            if (string.IsNullOrEmpty(text)) return 0;
            var font = SupportedFonts.Arial;
            if (Font.Family.Contains("Times"))
            {
                font = SupportedFonts.TimesNewRoman;
            }
            return FontSizes.MeasureString(text, font, Font.Size, Font.Style);
        }

        public abstract void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol);


        public virtual object OnPreRender()
        {
            // nothing to do
            return null;
        }

        public virtual object OnRenderFinished()
        {
            // nothing to do
            return null;
        }
    }
}