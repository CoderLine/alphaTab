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
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// This layout arranges the bars all horizontally
    /// </summary>
    public class HorizontalScreenLayout : ScoreLayout
    {
        // left top right bottom
        public static readonly float[] PagePadding = { 20, 20, 20, 20 };
        public const float GroupSpacing = 20;

        private StaveGroup _group;

        public HorizontalScreenLayout(ScoreRenderer renderer)
            : base(renderer)
        {
        }

        public override void DoLayoutAndRender()
        {
            if (Renderer.Settings.Staves.Count == 0) return;

            var score = Renderer.Score;
            var canvas = Renderer.Canvas;

            var startIndex = Renderer.Settings.Layout.Get("start", 1);
            startIndex--; // map to array index
            startIndex = Math.Min(score.MasterBars.Count - 1, Math.Max(0, startIndex));
            var currentBarIndex = startIndex;

            var endBarIndex = Renderer.Settings.Layout.Get("count", score.MasterBars.Count);
            endBarIndex = startIndex + endBarIndex - 1; // map count to array index
            endBarIndex = Math.Min(score.MasterBars.Count - 1, Math.Max(0, endBarIndex));

            var x = PagePadding[0];
            var y = PagePadding[1];

            _group = CreateEmptyStaveGroup();

            while (currentBarIndex <= endBarIndex)
            {
                _group.AddBars(Renderer.Tracks, currentBarIndex);
                currentBarIndex++;
            }

            _group.X = x;
            _group.Y = y;

            _group.FinalizeGroup(this);

            y += _group.Height + (GroupSpacing * Scale);

            Height = y + PagePadding[3];
            Width = _group.X + _group.Width + PagePadding[2];

            // TODO: Find a good way to render the score partwise
            // we need to precalculate the final height somehow

            canvas.BeginRender(Width, Height);
            canvas.Color = Renderer.RenderingResources.MainGlyphColor;
            canvas.TextAlign = TextAlign.Left;
            _group.Paint(0, 0, Renderer.Canvas);
            var result = canvas.EndRender();
            OnPartialRenderFinished(new RenderFinishedEventArgs
            {
                TotalWidth = Width,
                TotalHeight = y,
                Width = Width,
                Height = Height,
                RenderResult = result
            });
        }

        public override void BuildBoundingsLookup(BoundingsLookup lookup)
        {
            _group.BuildBoundingsLookup(lookup);
        }
    }
}
