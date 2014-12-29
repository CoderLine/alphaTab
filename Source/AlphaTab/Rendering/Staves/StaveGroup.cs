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
using AlphaTab.Platform;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Staves
{
    public class StaveTrackGroup
    {
        public Track Track { get; set; }
        public StaveGroup StaveGroup { get; set; }
        public FastList<Stave> Staves { get; set; }

        public Stave FirstStaveInAccolade { get; set; }
        public Stave LastStaveInAccolade { get; set; }

        public StaveTrackGroup(StaveGroup staveGroup, Track track)
        {
            StaveGroup = staveGroup;
            Track = track;
            Staves = new FastList<Stave>();
        }
    }

    /// <summary>
    /// A stave consists of a list of different staves and groups
    /// them using an accolade. 
    /// </summary>
    public class StaveGroup
    {
        private const float AccoladeLabelSpacing = 10;

        private Stave _firstStaveInAccolade;
        private Stave _lastStaveInAccolade;

        public float X { get; set; }
        public float Y { get; set; }
        public int Index { get; set; }

        private bool _accoladeSpacingCalculated;
        public float AccoladeSpacing { get; set; }

        /// <summary>
        /// Indicates whether this line is full or not. If the line is full the
        /// bars can be aligned to the maximum width. If the line is not full 
        /// the bars will not get stretched.
        /// </summary>
        public bool IsFull { get; set; }

        /// <summary>
        /// The width that the content bars actually need
        /// </summary>
        public float Width { get; set; }

        public FastList<MasterBar> MasterBars { get; set; }

        public FastList<StaveTrackGroup> Staves { get; set; }
        private FastList<Stave> _allStaves;

        public ScoreLayout Layout { get; set; }
        public BarHelpersGroup Helpers { get; set; }

        public StaveGroup()
        {
            MasterBars = new FastList<MasterBar>();
            Staves = new FastList<StaveTrackGroup>();
            _allStaves = new FastList<Stave>();
            Width = 0;
            Index = 0;
            _accoladeSpacingCalculated = false;
            AccoladeSpacing = 0;

            Helpers = new BarHelpersGroup();
        }

        public int LastBarIndex
        {
            get
            {
                return MasterBars[MasterBars.Count - 1].Index;
            }
        }

        public void AddBars(Track[] tracks, int barIndex)
        {
            if (tracks.Length == 0) return;
            var score = tracks[0].Score;
            var masterBar = score.MasterBars[barIndex];
            MasterBars.Add(masterBar);

            Helpers.BuildHelpers(tracks, barIndex);

            if (!_accoladeSpacingCalculated && Index == 0)
            {
                _accoladeSpacingCalculated = true;
                var canvas = Layout.Renderer.Canvas;
                var res = Layout.Renderer.RenderingResources.EffectFont;
                canvas.Font = res;
                for (var i = 0; i < tracks.Length; i++)
                {
                    AccoladeSpacing = Math.Max(AccoladeSpacing, canvas.MeasureText(tracks[i].ShortName));
                }
                AccoladeSpacing += (2 * AccoladeLabelSpacing);
                Width += AccoladeSpacing;
            }

            // add renderers
            var maxSizes = new BarSizeInfo();
            for (int i = 0, j = Staves.Count; i < j; i++)
            {
                var g = Staves[i];
                for (int k = 0, l = g.Staves.Count; k < l; k++)
                {
                    var s = g.Staves[k];
                    s.AddBar(g.Track.Bars[barIndex]);
                    s.BarRenderers[s.BarRenderers.Count - 1].RegisterMaxSizes(maxSizes);
                }
            }

            // ensure same widths of new renderer
            var realWidth = 0f;
            for (int i = 0, j = _allStaves.Count; i < j; i++)
            {
                var s = _allStaves[i];
                s.BarRenderers[s.BarRenderers.Count - 1].ApplySizes(maxSizes);
                if (s.BarRenderers[s.BarRenderers.Count - 1].Width > realWidth)
                {
                    realWidth = s.BarRenderers[s.BarRenderers.Count - 1].Width;
                }
            }

            Width += realWidth;
        }

        private StaveTrackGroup GetStaveTrackGroup(Track track)
        {
            for (int i = 0, j = Staves.Count; i < j; i++)
            {
                var g = Staves[i];
                if (g.Track == track)
                {
                    return g;
                }
            }
            return null;
        }

        public void AddStave(Track track, Stave stave)
        {
            var group = GetStaveTrackGroup(track);
            if (group == null)
            {
                group = new StaveTrackGroup(this, track);
                Staves.Add(group);
            }

            stave.StaveTrackGroup = group;
            stave.StaveGroup = this;
            stave.Index = _allStaves.Count;
            _allStaves.Add(stave);
            group.Staves.Add(stave);

            if (stave.IsInAccolade)
            {
                if (_firstStaveInAccolade == null)
                {
                    _firstStaveInAccolade = stave;
                    stave.IsFirstInAccolade = true;
                }
                if (group.FirstStaveInAccolade == null)
                {
                    group.FirstStaveInAccolade = stave;
                }
                if (_lastStaveInAccolade == null)
                {
                    _lastStaveInAccolade = stave;
                    stave.IsLastInAccolade = true;
                }

                if (_lastStaveInAccolade != null) { _lastStaveInAccolade.IsLastInAccolade = false; }
                _lastStaveInAccolade = stave;
                _lastStaveInAccolade.IsLastInAccolade = true;
                group.LastStaveInAccolade = stave;
            }
        }

        public float Height
        {
            get
            {
                return _allStaves[_allStaves.Count - 1].Y + _allStaves[_allStaves.Count - 1].Height;
            }
        }

        public void RevertLastBar()
        {
            if (MasterBars.Count > 1)
            {
                MasterBars.RemoveAt(MasterBars.Count - 1);
                var w = 0f;
                for (int i = 0, j = _allStaves.Count; i < j; i++)
                {
                    var s = _allStaves[i];
                    w = Math.Max(w, s.BarRenderers[s.BarRenderers.Count - 1].Width);
                    s.RevertLastBar();
                }
                Width -= w;
            }
        }

        public void ApplyBarSpacing(float spacing)
        {
            for (int i = 0, j = _allStaves.Count; i < j; i++)
            {
                _allStaves[i].ApplyBarSpacing(spacing);
            }
            Width += MasterBars.Count * spacing;
        }

        public void Paint(float cx, float cy, ICanvas canvas)
        {
            for (int i = 0, j = _allStaves.Count; i < j; i++)
            {
                _allStaves[i].Paint(cx + X, cy + Y, canvas);
            }

            var res = Layout.Renderer.RenderingResources;

            if (Staves.Count > 0)
            {
                //
                // Draw start grouping
                // 

                if (_firstStaveInAccolade != null && _lastStaveInAccolade != null)
                {
                    //
                    // draw grouping line for all staves
                    //

                    var firstStart = cy + Y + _firstStaveInAccolade.Y + _firstStaveInAccolade.StaveTop + _firstStaveInAccolade.TopSpacing + _firstStaveInAccolade.TopOverflow;
                    var lastEnd = cy + Y + _lastStaveInAccolade.Y + _lastStaveInAccolade.TopSpacing + _lastStaveInAccolade.TopOverflow
                                         + _lastStaveInAccolade.StaveBottom;

                    var acooladeX = cx + X + _firstStaveInAccolade.X;

                    canvas.Color = res.BarSeperatorColor;

                    canvas.BeginPath();
                    canvas.MoveTo(acooladeX, firstStart);
                    canvas.LineTo(acooladeX, lastEnd);
                    canvas.Stroke();
                }

                //
                // Draw accolade for each track group
                // 
                canvas.Font = res.EffectFont;
                for (int i = 0, j = Staves.Count; i < j; i++)
                {
                    var g = Staves[i];
                    var firstStart = cy + Y + g.FirstStaveInAccolade.Y + g.FirstStaveInAccolade.StaveTop + g.FirstStaveInAccolade.TopSpacing + g.FirstStaveInAccolade.TopOverflow;
                    var lastEnd = cy + Y + g.LastStaveInAccolade.Y + g.LastStaveInAccolade.TopSpacing + g.LastStaveInAccolade.TopOverflow
                                         + g.LastStaveInAccolade.StaveBottom;

                    var acooladeX = cx + X + g.FirstStaveInAccolade.X;

                    var barSize = (3 * Layout.Renderer.Settings.Scale);
                    var barOffset = barSize;

                    var accoladeStart = firstStart - (barSize * 4);
                    var accoladeEnd = lastEnd + (barSize * 4);

                    // text
                    if (Index == 0)
                    {
                        canvas.FillText(g.Track.ShortName, cx + X + (AccoladeLabelSpacing * Layout.Scale), firstStart);
                    }

                    // rect
                    canvas.FillRect(acooladeX - barOffset - barSize, accoladeStart, barSize, accoladeEnd - accoladeStart);

                    var spikeStartX = acooladeX - barOffset - barSize;
                    var spikeEndX = acooladeX + barSize * 2;

                    // top spike
                    canvas.BeginPath();
                    canvas.MoveTo(spikeStartX, accoladeStart);
                    canvas.BezierCurveTo(spikeStartX, accoladeStart, spikeStartX, accoladeStart, spikeEndX, accoladeStart - barSize);
                    canvas.BezierCurveTo(acooladeX, accoladeStart + barSize, spikeStartX, accoladeStart + barSize, spikeStartX, accoladeStart + barSize);
                    canvas.ClosePath();
                    canvas.Fill();

                    // bottom spike 
                    canvas.BeginPath();
                    canvas.MoveTo(spikeStartX, accoladeEnd);
                    canvas.BezierCurveTo(spikeStartX, accoladeEnd, acooladeX, accoladeEnd, spikeEndX, accoladeEnd + barSize);
                    canvas.BezierCurveTo(acooladeX, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize);
                    canvas.ClosePath();

                    canvas.Fill();
                }
            }
        }

        public void FinalizeGroup(ScoreLayout scoreLayout)
        {
            float currentY = 0;
            for (int i = 0, j = _allStaves.Count; i < j; i++)
            {
                _allStaves[i].X = AccoladeSpacing;
                _allStaves[i].Y = (currentY);
                _allStaves[i].FinalizeStave(scoreLayout);
                currentY += _allStaves[i].Height;
            }
        }

        public void BuildBoundingsLookup(BoundingsLookup lookup)
        {
            var visualTop = Y + _firstStaveInAccolade.Y;
            var visualBottom = Y + _lastStaveInAccolade.Y + _lastStaveInAccolade.Height;
            var realTop = Y + _allStaves[0].Y;
            var realBottom = Y + _allStaves[_allStaves.Count - 1].Y + _allStaves[_allStaves.Count - 1].Height;

            var visualHeight = visualBottom - visualTop;
            var realHeight = realBottom - realTop;
            for (int i = 0, j = _firstStaveInAccolade.BarRenderers.Count; i < j; i++)
            {
                _firstStaveInAccolade.BarRenderers[i].BuildBoundingsLookup(lookup, visualTop, visualHeight, realTop, realHeight, X);
            }
        }
    }
}
