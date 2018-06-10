/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using Phase;
using TextAlign = AlphaTab.Platform.Model.TextAlign;

namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// A canvas implementation for HTML5 canvas
    /// </summary>
    class Html5Canvas : ICanvas
    {
        protected const float BlurCorrection = 0;

        private CanvasElement _canvas;
        private CanvasRenderingContext2D _context;
        private Color _color;
        private Font _font;
        private Font _musicFont;

        public RenderingResources Resources { get; set; }

        public Html5Canvas()
        {
            _color = new Color(0, 0, 0);
            var fontElement = Browser.Document.CreateElement("span");
            fontElement.ClassList.Add("at");
            Browser.Document.Body.AppendChild(fontElement);
            var style = Browser.Window.GetComputedStyle(fontElement);
            _musicFont = new Font(style.FontFamily, Platform.ParseFloat(style.FontSize));
        }

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
        public void BeginRender(float width, float height)
        {
            _canvas = (CanvasElement)Browser.Document.CreateElement("canvas");
            _canvas.Width = (int)width;
            _canvas.Height = (int)height;
            _canvas.Style.Width = width + "px";
            _canvas.Style.Height = height + "px";
            _context = (CanvasRenderingContext2D)_canvas.GetContext("2d");
            _context.TextBaseline = "top";
        }

        public object EndRender()
        {
            var result = _canvas;
            _canvas = null;
            return result;
        }

        public Color Color
        {
            get
            {
                return _color;
            }
            set
            {
                if (_color.RGBA == value.RGBA) return;
                _color = value;
                _context.StrokeStyle = value.RGBA;
                _context.FillStyle = value.RGBA;
            }
        }

        public float LineWidth
        {
            get
            {
                return _context.LineWidth;
            }
            set
            {
                _context.LineWidth = value;
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
            return (float)_context.MeasureText(text).Width;
        }

        public void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol)
        {
            if (symbol == MusicFontSymbol.None)
            {
                return;
            }

            x = (int)x;
            y = (int)y;
            var baseLine = _context.TextBaseline;
            var font = _context.Font;
            _context.Font = _musicFont.ToCssString(scale);
            _context.TextBaseline = "middle";
            _context.FillText(Platform.StringFromCharCode((int)symbol), x, y);
            _context.TextBaseline = baseLine;
            _context.Font = font;
        }

        public void FillMusicFontSymbols(float x, float y, float scale, MusicFontSymbol[] symbols)
        {
            x = (int)x;
            y = (int)y;
            var baseLine = _context.TextBaseline;
            var font = _context.Font;
            _context.Font = _musicFont.ToCssString(scale);
            _context.TextBaseline = "middle";

            var s = "";
            foreach (var symbol in symbols)
            {
                if (symbol != MusicFontSymbol.None)
                {
                    s += Platform.StringFromCharCode((int)symbol);
                }
            }

            _context.FillText(s, x, y);
            _context.TextBaseline = baseLine;
            _context.Font = font;
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