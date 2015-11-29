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
using AlphaTab.Model;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Layout
{
    public class HorizontalScreenLayoutPartialInfo
    {
        public float Width { get; set; }
        public FastList<MasterBar> MasterBars { get; set; }

        public HorizontalScreenLayoutPartialInfo()
        {
            MasterBars = new FastList<MasterBar>();
        }
    }

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

            _group = CreateEmptyStaveGroup();
            _group.X = PagePadding[0];
            _group.Y = PagePadding[1];

            var countPerPartial = Renderer.Settings.Layout.Get("countPerPartial", 10);
            var partials = new FastList<HorizontalScreenLayoutPartialInfo>();

            var currentPartial = new HorizontalScreenLayoutPartialInfo();

            while (currentBarIndex <= endBarIndex)
            {
                var result = _group.AddBars(Renderer.Tracks, currentBarIndex);

                // if we detect that the new renderer is linked to the previous
                // renderer, we need to put it into the previous partial 
                var renderer = _group.GetBarRenderer(currentBarIndex);
                if (currentPartial.MasterBars.Count == 0 && result.IsLinkedToPrevious && partials.Count > 0)
                {
                    var previousPartial = partials[partials.Count - 1];
                    previousPartial.MasterBars.Add(score.MasterBars[currentBarIndex]);
                    previousPartial.Width += renderer.Width;

                }
                else
                {
                    currentPartial.MasterBars.Add(score.MasterBars[currentBarIndex]);
                    currentPartial.Width += renderer.Width;
                    // no targetPartial here because previous partials already handled this code
                    if (currentPartial.MasterBars.Count >= countPerPartial)
                    {
                        if (partials.Count == 0)
                        {
                            currentPartial.Width += _group.X + _group.AccoladeSpacing;
                        }
                        partials.Add(currentPartial);
                        currentPartial = new HorizontalScreenLayoutPartialInfo();
                    }
                }
                
                currentBarIndex++;
            }

            // don't miss the last partial if not empty
            if (currentPartial.MasterBars.Count >= 0)
            {
                if (partials.Count == 0)
                {
                    currentPartial.Width += _group.X + _group.AccoladeSpacing;
                }
                partials.Add(currentPartial);
            }


            _group.FinalizeGroup(this);

            Height = _group.Y + _group.Height + PagePadding[3];
            Width = _group.X + _group.Width + PagePadding[2];

            // TODO: Find a good way to render the score partwise
            // we need to precalculate the final height somehow

            //canvas.BeginRender(Width, Height);
            //canvas.Color = Renderer.RenderingResources.MainGlyphColor;
            //canvas.TextAlign = TextAlign.Left;
            //_group.Paint(0, 0, Renderer.Canvas);
            //var result = canvas.EndRender();
            //OnPartialRenderFinished(new RenderFinishedEventArgs
            //{
            //    TotalWidth = Width,
            //    TotalHeight = y,
            //    Width = Width,
            //    Height = Height,
            //    RenderResult = result
            //});

            currentBarIndex = 0;
            for (var i = 0; i < partials.Count; i++)
            {
                var partial = partials[i];
                canvas.BeginRender(partial.Width, Height);
                canvas.Color = Renderer.RenderingResources.MainGlyphColor;
                canvas.TextAlign = TextAlign.Left;

                var renderer = _group.GetBarRenderer(partial.MasterBars[0].Index);
                var renderX = renderer.X + _group.AccoladeSpacing;
                if (i == 0)
                {
                    renderX -= _group.X + _group.AccoladeSpacing;
                }
                _group.PaintPartial(-renderX, _group.Y, Renderer.Canvas, currentBarIndex, partial.MasterBars.Count);
                var result = canvas.EndRender();
                OnPartialRenderFinished(new RenderFinishedEventArgs
                {
                    TotalWidth = Width,
                    TotalHeight = Height,
                    Width = partial.Width,
                    Height = Height,
                    RenderResult = result
                });
                currentBarIndex += partial.MasterBars.Count;
            }

        }

        public override void BuildBoundingsLookup(BoundingsLookup lookup)
        {
            _group.BuildBoundingsLookup(lookup);
        }
    }
}
