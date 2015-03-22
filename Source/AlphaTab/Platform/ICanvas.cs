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
using AlphaTab.Platform.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using Color = AlphaTab.Platform.Model.Color;

namespace AlphaTab.Platform
{
    /// <summary>
    /// This is the base public interface for canvas implementations on different plattforms.
    /// </summary>
    public interface ICanvas : IPathCanvas
    {
        RenderingResources Resources { get; set; }

        Color Color { get; set; }

        float LineWidth { get; set; }

        void FillRect(float x, float y, float w, float h);
        void StrokeRect(float x, float y, float w, float h);
        void FillCircle(float x, float y, float radius);

        Font Font { get; set; }
        TextAlign TextAlign { get; set; }
        TextBaseline TextBaseline { get; set; }

        void FillText(string text, float x, float y);
        float MeasureText(string text);
        void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol);

        void BeginRender(float width, float height);
        object EndRender();
    }

    /// <summary>
    /// This is the path drawing API for canvas implementations
    /// </summary>
    // NOTE: For a full HTML based rendering we need to get rid of those 
    public interface IPathCanvas
    {
        void BeginPath();
        void ClosePath();
        void Fill();
        void Stroke();

        void MoveTo(float x, float y);
        void LineTo(float x, float y);
        void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y);
        void QuadraticCurveTo(float cpx, float cpy, float x, float y);
    }
}
