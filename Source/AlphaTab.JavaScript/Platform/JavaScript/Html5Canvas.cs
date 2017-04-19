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
using System;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// A canvas implementation for HTML5 canvas
    /// </summary>
    public class Html5Canvas : HtmlContext, ICanvas
    {
        private HtmlCanvasElement _canvas;
        private CanvasRenderingContext2D _context;
        private Color _color;
        private Font _font;
        private Font _musicFont;

        public RenderingResources Resources { get; set; }

        public Html5Canvas()
        {
            _color = new Color(0, 0, 0);
            var fontElement = document.createElement("span");
            fontElement.classList.add("at");
            document.body.appendChild(fontElement);
            var style = window.getComputedStyle(fontElement, null);
            _musicFont = new Font(style.fontFamily, Std.ParseFloat(style.fontSize));
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
            _canvas = (HtmlCanvasElement) document.createElement("canvas");
            _canvas.width = (int) width;
            _canvas.height = (int) height;
            _canvas.style.width = width + "px";
            _canvas.style.height = height + "px";
            _context = (CanvasRenderingContext2D)_canvas.getContext("2d");
            _context.textBaseline = "top";
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
                _context.strokeStyle = value.RGBA;
                _context.fillStyle = value.RGBA;
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

        public void FillRect(float x, float y, float w, float h)
        {
            if (w > 0)
            {
                _context.fillRect((int)x - 0.5, (int)y - 0.5, w, h);
            }
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
            _context.lineTo(x - 0.5, y - 0.5);
        }

        public void QuadraticCurveTo(float cpx, float cpy, float x, float y)
        {
            _context.quadraticCurveTo(cpx, cpy, x, y);
        }

        public void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y)
        {
            _context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }

        public void FillCircle(float x, float y, float radius)
        {
            _context.beginPath();
            _context.arc(x, y, radius, 0, Math.PI * 2, true);
            Fill();
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
                switch (_context.textAlign)
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
                switch (_context.textBaseline)
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
                        _context.textBaseline = "top";
                        break;
                    case TextBaseline.Middle:
                        _context.textBaseline = "middle";
                        break;
                    case TextBaseline.Bottom:
                        _context.textBaseline = "bottom";
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
            _context.fillText(text, x, y);
        }

        public float MeasureText(string text)
        {
            return (float)_context.measureText(text).width;
        }

        public void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol)
        {
            if (symbol == MusicFontSymbol.None)
            {
                return;
            }
            var baseLine = _context.textBaseline;
            var font = _context.font;
            _context.font = _musicFont.ToCssString(scale);
            _context.textBaseline = "middle";
            _context.fillText(Std.StringFromCharCode((int) symbol), x, y);
            _context.textBaseline = baseLine;
            _context.font = font;
        }
    }
}