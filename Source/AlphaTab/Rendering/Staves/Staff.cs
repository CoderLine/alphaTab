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
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Layout;

namespace AlphaTab.Rendering.Staves
{
    /// <summary>
    /// A Staff represents a single line within a StaveGroup. 
    /// It stores BarRenderer instances created from a given factory. 
    /// </summary>
    public class Staff
    {
        private readonly BarRendererFactory _factory;

        public StaveTrackGroup StaveTrackGroup { get; set; }
        public StaveGroup StaveGroup { get; set; }

        public FastList<BarRendererBase> BarRenderers { get; set; }

        public float X { get; set; }
        public float Y { get; set; }
        public float Height { get; set; }
        public int Index { get; set; }
        public int StaffIndex { get; set; }

        /// <summary>
        /// This is the index of the track being rendered. This is not the index of the track within the model, 
        /// but the n-th track being rendered. It is the index of the <see cref="ScoreRenderer.Tracks"/> array defining 
        /// which tracks should be rendered. 
        /// For single-track rendering this will always be zero.
        /// </summary>
        public int TrackIndex { get; set; }
        public Model.Staff ModelStaff { get; set; }
        public string StaveId
        {
            get { return _factory.StaffId; }
        }

        /// <summary>
        /// This is the visual offset from top where the
        /// Staff contents actually start. Used for grouping 
        /// using a accolade
        /// </summary>
        public float StaveTop { get; set; }
        public float TopSpacing { get; set; }
        public float BottomSpacing { get; set; }
        /// <summary>
        /// This is the visual offset from top where the
        /// Staff contents actually ends. Used for grouping 
        /// using a accolade
        /// </summary>
        public float StaveBottom { get; set; }

        public bool IsFirstInAccolade { get; set; }
        public bool IsLastInAccolade { get; set; }

        public Staff(int trackIndex, Model.Staff staff, BarRendererFactory factory)
        {
            BarRenderers = new FastList<BarRendererBase>();
            TrackIndex = trackIndex;
            ModelStaff = staff;
            _factory = factory;
            TopSpacing = 15;
            BottomSpacing = 5;
            StaveTop = 0;
            StaveBottom = 0;
        }

        public bool IsInAccolade
        {
            get
            {
                return _factory.IsInAccolade;
            }
        }

        public void RegisterStaffTop(float offset)
        {
            StaveTop = offset;
        }

        public void RegisterStaffBottom(float offset)
        {
            StaveBottom = offset;
        }

        public void AddBarRenderer(BarRendererBase renderer)
        {
            renderer.Staff = this;
            renderer.Index = BarRenderers.Count;
            renderer.ReLayout();
            BarRenderers.Add(renderer);
            StaveGroup.Layout.RegisterBarRenderer(StaveId, renderer);
        }

        public void AddBar(Bar bar, BarLayoutingInfo layoutingInfo)
        {
            BarRendererBase renderer;
            if (bar == null)
            {
                renderer = new BarRendererBase(StaveGroup.Layout.Renderer, bar);
            }
            else
            {
                renderer = _factory.Create(StaveGroup.Layout.Renderer, bar, StaveGroup.Layout.Renderer.Settings.Staves);
            }
            renderer.Staff = this;
            renderer.Index = BarRenderers.Count;
            renderer.LayoutingInfo = layoutingInfo;
            renderer.DoLayout();
            renderer.RegisterLayoutingInfo();
            BarRenderers.Add(renderer);
            if (bar != null)
            {
                StaveGroup.Layout.RegisterBarRenderer(StaveId, renderer);
            }
        }

        public void RevertLastBar()
        {
            var lastBar = BarRenderers[BarRenderers.Count - 1];
            BarRenderers.RemoveAt(BarRenderers.Count - 1);
            StaveGroup.Layout.UnregisterBarRenderer(StaveId, lastBar);
        }

        public void ScaleToWidth(float width)
        {
            // Note: here we could do some "intelligent" distribution of 
            // the space over the bar renderers, for now we evenly apply the space to all bars
            var difference = width - StaveGroup.Width;
            var spacePerBar = difference / BarRenderers.Count;
            for (int i = 0, j = BarRenderers.Count; i < j; i++)
            {
                BarRenderers[i].ScaleToWidth(BarRenderers[i].Width + spacePerBar);
            }
        }

        public float TopOverflow
        {
            get
            {
                var m = 0f;
                for (int i = 0, j = BarRenderers.Count; i < j; i++)
                {
                    var r = BarRenderers[i];
                    if (r.TopOverflow > m)
                    {
                        m = r.TopOverflow;
                    }
                }
                return m;
            }
        }

        public float BottomOverflow
        {
            get
            {
                var m = 0f;
                for (int i = 0, j = BarRenderers.Count; i < j; i++)
                {
                    var r = BarRenderers[i];
                    if (r.BottomOverflow > m)
                    {
                        m = r.BottomOverflow;
                    }
                }
                return m;
            }
        }

        public void FinalizeStave()
        {
            var x = 0f;
            Height = 0;

            var topOverflow = TopOverflow;
            var bottomOverflow = BottomOverflow;
            for (var i = 0; i < BarRenderers.Count; i++)
            {
                BarRenderers[i].X = x;
                BarRenderers[i].Y = TopSpacing + topOverflow;
                Height = Math.Max(Height, BarRenderers[i].Height);
                BarRenderers[i].FinalizeRenderer();
                x += BarRenderers[i].Width;
            }

            if (Height > 0)
            {
                Height += TopSpacing + topOverflow + bottomOverflow + BottomSpacing;
            }
        }

        public void Paint(float cx, float cy, ICanvas canvas, int startIndex, int count)
        {
            if (Height == 0 || count == 0) return;
            for (int i = startIndex, j = Math.Min(startIndex + count, BarRenderers.Count); i < j; i++)
            {
                BarRenderers[i].Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
