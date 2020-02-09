﻿using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Staves
{
    /// <summary>
    /// A Staff consists of a list of different staves and groups
    /// them using an accolade.
    /// </summary>
    internal class StaveGroup
    {
        private const float AccoladeLabelSpacing = 10;

        private readonly FastList<Staff> _allStaves;
        private Staff _firstStaffInAccolade;
        private Staff _lastStaffInAccolade;

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

        public bool IsLast { get; set; }

        public FastList<MasterBarsRenderers> MasterBarsRenderers { get; set; }

        public FastList<StaveTrackGroup> Staves { get; set; }

        public ScoreLayout Layout { get; set; }

        public StaveGroup()
        {
            MasterBarsRenderers = new FastList<MasterBarsRenderers>();
            Staves = new FastList<StaveTrackGroup>();
            _allStaves = new FastList<Staff>();
            Width = 0;
            Index = 0;
            _accoladeSpacingCalculated = false;
            AccoladeSpacing = 0;
        }

        public int FirstBarIndex => MasterBarsRenderers[0].MasterBar.Index;

        public int LastBarIndex => MasterBarsRenderers[MasterBarsRenderers.Count - 1].MasterBar.Index;

        public MasterBarsRenderers AddMasterBarRenderers(Track[] tracks, MasterBarsRenderers renderers)
        {
            if (tracks.Length == 0)
            {
                return null;
            }

            MasterBarsRenderers.Add(renderers);
            CalculateAccoladeSpacing(tracks);

            renderers.LayoutingInfo.PreBeatSize = 0;

            var src = 0;

            for (int i = 0, j = Staves.Count; i < j; i++)
            {
                var g = Staves[i];
                for (int k = 0, l = g.Staves.Count; k < l; k++)
                {
                    var s = g.Staves[k];
                    var renderer = renderers.Renderers[src++];

                    s.AddBarRenderer(renderer);
                }
            }

            //Width += renderers.Width;
            UpdateWidth();

            return renderers;
        }

        public MasterBarsRenderers AddBars(Track[] tracks, int barIndex)
        {
            if (tracks.Length == 0)
            {
                return null;
            }

            var result = new MasterBarsRenderers();
            result.LayoutingInfo = new BarLayoutingInfo();
            result.MasterBar = tracks[0].Score.MasterBars[barIndex];
            MasterBarsRenderers.Add(result);

            CalculateAccoladeSpacing(tracks);

            // add renderers
            var barLayoutingInfo = result.LayoutingInfo;
            foreach (var g in Staves)
            {
                foreach (var s in g.Staves)
                {
                    var bar = g.Track.Staves[s.ModelStaff.Index].Bars[barIndex];
                    s.AddBar(bar, barLayoutingInfo);
                    var renderer = s.BarRenderers[s.BarRenderers.Count - 1];
                    result.Renderers.Add(renderer);
                    if (renderer.IsLinkedToPrevious)
                    {
                        result.IsLinkedToPrevious = true;
                    }

                    if (!renderer.CanWrap)
                    {
                        result.CanWrap = false;
                    }
                }
            }

            barLayoutingInfo.Finish();

            // ensure same widths of new renderer
            result.Width = UpdateWidth();

            return result;
        }

        public MasterBarsRenderers RevertLastBar()
        {
            if (MasterBarsRenderers.Count > 1)
            {
                var toRemove = MasterBarsRenderers[MasterBarsRenderers.Count - 1];
                MasterBarsRenderers.RemoveAt(MasterBarsRenderers.Count - 1);
                var w = 0f;
                for (int i = 0, j = _allStaves.Count; i < j; i++)
                {
                    var s = _allStaves[i];
                    var lastBar = s.RevertLastBar();
                    w = Math.Max(w, lastBar.Width);
                }

                Width -= w;

                return toRemove;
            }

            return null;
        }

        public float UpdateWidth()
        {
            var realWidth = 0f;
            for (int i = 0, j = _allStaves.Count; i < j; i++)
            {
                var s = _allStaves[i];
                s.BarRenderers[s.BarRenderers.Count - 1].ApplyLayoutingInfo();
                if (s.BarRenderers[s.BarRenderers.Count - 1].Width > realWidth)
                {
                    realWidth = s.BarRenderers[s.BarRenderers.Count - 1].Width;
                }
            }

            Width += realWidth;
            return realWidth;
        }

        private void CalculateAccoladeSpacing(Track[] tracks)
        {
            if (!_accoladeSpacingCalculated && Index == 0)
            {
                _accoladeSpacingCalculated = true;
                if (Layout.Renderer.Settings.Notation.HideTrackNames)
                {
                    AccoladeSpacing = 0;
                }
                else
                {
                    var canvas = Layout.Renderer.Canvas;
                    var res = Layout.Renderer.Settings.Display.Resources.EffectFont;
                    canvas.Font = res;
                    foreach (var t in tracks)
                    {
                        AccoladeSpacing =
                            (float)Math.Ceiling(Math.Max(AccoladeSpacing, canvas.MeasureText(t.ShortName)));
                    }

                    AccoladeSpacing += 2 * AccoladeLabelSpacing;
                    Width += AccoladeSpacing;
                }
            }
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

        public void AddStaff(Track track, Staff staff)
        {
            var group = GetStaveTrackGroup(track);
            if (group == null)
            {
                group = new StaveTrackGroup(this, track);
                Staves.Add(group);
            }

            staff.StaveTrackGroup = group;
            staff.StaveGroup = this;
            staff.Index = _allStaves.Count;
            _allStaves.Add(staff);
            group.AddStaff(staff);

            if (staff.IsInAccolade)
            {
                if (_firstStaffInAccolade == null)
                {
                    _firstStaffInAccolade = staff;
                    staff.IsFirstInAccolade = true;
                }

                if (group.FirstStaffInAccolade == null)
                {
                    group.FirstStaffInAccolade = staff;
                }

                if (_lastStaffInAccolade == null)
                {
                    _lastStaffInAccolade = staff;
                    staff.IsLastInAccolade = true;
                }

                if (_lastStaffInAccolade != null) { _lastStaffInAccolade.IsLastInAccolade = false; }

                _lastStaffInAccolade = staff;
                _lastStaffInAccolade.IsLastInAccolade = true;
                group.LastStaffInAccolade = staff;
            }
        }

        public float Height => _allStaves[_allStaves.Count - 1].Y + _allStaves[_allStaves.Count - 1].Height;

        public void ScaleToWidth(float width)
        {
            for (int i = 0, j = _allStaves.Count; i < j; i++)
            {
                _allStaves[i].ScaleToWidth(width);
            }

            Width = width;
        }

        public void Paint(float cx, float cy, ICanvas canvas)
        {
            PaintPartial(cx + X, cy + Y, canvas, 0, MasterBarsRenderers.Count);
        }

        public void PaintPartial(float cx, float cy, ICanvas canvas, int startIndex, int count)
        {
            BuildBoundingsLookup(cx, cy);

            for (int i = 0, j = _allStaves.Count; i < j; i++)
            {
                _allStaves[i].Paint(cx, cy, canvas, startIndex, count);
            }

            var res = Layout.Renderer.Settings.Display.Resources;

            if (Staves.Count > 0 && startIndex == 0)
            {
                //
                // Draw start grouping
                //
                canvas.Color = res.BarSeparatorColor;

                if (_firstStaffInAccolade != null && _lastStaffInAccolade != null)
                {
                    //
                    // draw grouping line for all staves
                    //

                    var firstStart = cy + _firstStaffInAccolade.Y + _firstStaffInAccolade.StaveTop +
                                     _firstStaffInAccolade.TopSpacing + _firstStaffInAccolade.TopOverflow;
                    var lastEnd = cy + _lastStaffInAccolade.Y + _lastStaffInAccolade.TopSpacing +
                                  _lastStaffInAccolade.TopOverflow
                                  + _lastStaffInAccolade.StaveBottom;

                    var acooladeX = cx + _firstStaffInAccolade.X;


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
                    if (g.FirstStaffInAccolade != null && g.LastStaffInAccolade != null)
                    {
                        var firstStart = cy + g.FirstStaffInAccolade.Y + g.FirstStaffInAccolade.StaveTop +
                                         g.FirstStaffInAccolade.TopSpacing + g.FirstStaffInAccolade.TopOverflow;
                        var lastEnd = cy + g.LastStaffInAccolade.Y + g.LastStaffInAccolade.TopSpacing +
                                      g.LastStaffInAccolade.TopOverflow
                                      + g.LastStaffInAccolade.StaveBottom;

                        var acooladeX = cx + g.FirstStaffInAccolade.X;

                        var barSize = 3 * Layout.Renderer.Settings.Display.Scale;
                        var barOffset = barSize;

                        var accoladeStart = firstStart - barSize * 4;
                        var accoladeEnd = lastEnd + barSize * 4;

                        // text
                        if (Index == 0 && !Layout.Renderer.Settings.Notation.HideTrackNames)
                        {
                            canvas.FillText(g.Track.ShortName, cx + AccoladeLabelSpacing * Layout.Scale, firstStart);
                        }

                        // rect
                        canvas.FillRect(acooladeX - barOffset - barSize,
                            accoladeStart,
                            barSize,
                            accoladeEnd - accoladeStart);

                        var spikeStartX = acooladeX - barOffset - barSize;
                        var spikeEndX = acooladeX + barSize * 2;

                        // top spike
                        canvas.BeginPath();
                        canvas.MoveTo(spikeStartX, accoladeStart);
                        canvas.BezierCurveTo(spikeStartX,
                            accoladeStart,
                            spikeStartX,
                            accoladeStart,
                            spikeEndX,
                            accoladeStart - barSize);
                        canvas.BezierCurveTo(acooladeX,
                            accoladeStart + barSize,
                            spikeStartX,
                            accoladeStart + barSize,
                            spikeStartX,
                            accoladeStart + barSize);
                        canvas.ClosePath();
                        canvas.Fill();

                        // bottom spike
                        canvas.BeginPath();
                        canvas.MoveTo(spikeStartX, accoladeEnd);
                        canvas.BezierCurveTo(spikeStartX,
                            accoladeEnd,
                            acooladeX,
                            accoladeEnd,
                            spikeEndX,
                            accoladeEnd + barSize);
                        canvas.BezierCurveTo(acooladeX,
                            accoladeEnd - barSize,
                            spikeStartX,
                            accoladeEnd - barSize,
                            spikeStartX,
                            accoladeEnd - barSize);
                        canvas.ClosePath();

                        canvas.Fill();
                    }
                }
            }
        }


        public void FinalizeGroup()
        {
            float currentY = 0;
            foreach (var staff in _allStaves)
            {
                staff.X = AccoladeSpacing;
                staff.Y = currentY;
                staff.FinalizeStaff();
                currentY += staff.Height;
            }
        }

        private void BuildBoundingsLookup(float cx, float cy)
        {
            if (Layout.Renderer.BoundsLookup.IsFinished)
            {
                return;
            }

            if (_firstStaffInAccolade == null || _lastStaffInAccolade == null)
            {
                return;
            }

            var lastStaff = _allStaves[_allStaves.Count - 1];

            var visualTop = cy + Y + _firstStaffInAccolade.Y;
            var visualBottom = cy + Y + _lastStaffInAccolade.Y + _lastStaffInAccolade.Height;
            var realTop = cy + Y + _allStaves[0].Y;
            var realBottom = cy + Y + lastStaff.Y + lastStaff.Height;
            var lineTop = cy + Y + _firstStaffInAccolade.Y
                          + _firstStaffInAccolade.TopSpacing
                          + _firstStaffInAccolade.TopOverflow
                          + (_firstStaffInAccolade.BarRenderers.Count > 0
                              ? _firstStaffInAccolade.BarRenderers[0].TopPadding
                              : 0);
            var lineBottom = cy + Y + lastStaff.Y + lastStaff.Height
                             - lastStaff.BottomSpacing
                             - lastStaff.BottomOverflow
                             - (lastStaff.BarRenderers.Count > 0 ? lastStaff.BarRenderers[0].BottomPadding : 0);

            var visualHeight = visualBottom - visualTop;
            var lineHeight = lineBottom - lineTop;
            var realHeight = realBottom - realTop;

            var x = X + _firstStaffInAccolade.X;

            var staveGroupBounds = new StaveGroupBounds();
            staveGroupBounds.VisualBounds = new Bounds
            {
                X = cx,
                Y = cy + Y,
                W = Width,
                H = Height
            };
            staveGroupBounds.RealBounds = new Bounds
            {
                X = cx,
                Y = cy + Y,
                W = Width,
                H = Height
            };
            Layout.Renderer.BoundsLookup.AddStaveGroup(staveGroupBounds);

            var masterBarBoundsLookup = new FastDictionary<int, MasterBarBounds>();
            for (var i = 0; i < Staves.Count; i++)
            {
                foreach (var staff in Staves[i].StavesRelevantForBoundsLookup)
                {
                    foreach (var renderer in staff.BarRenderers)
                    {
                        MasterBarBounds masterBarBounds;
                        if (!masterBarBoundsLookup.ContainsKey(renderer.Bar.MasterBar.Index))
                        {
                            masterBarBounds = new MasterBarBounds();
                            masterBarBounds.Index = renderer.Bar.MasterBar.Index;
                            masterBarBounds.IsFirstOfLine = renderer.IsFirstOfLine;
                            masterBarBounds.RealBounds = new Bounds
                            {
                                X = x + renderer.X,
                                Y = realTop,
                                W = renderer.Width,
                                H = realHeight
                            };
                            masterBarBounds.VisualBounds = new Bounds
                            {
                                X = x + renderer.X,
                                Y = visualTop,
                                W = renderer.Width,
                                H = visualHeight
                            };
                            masterBarBounds.LineAlignedBounds = new Bounds
                            {
                                X = x + renderer.X,
                                Y = lineTop,
                                W = renderer.Width,
                                H = lineHeight
                            };
                            Layout.Renderer.BoundsLookup.AddMasterBar(masterBarBounds);
                            masterBarBoundsLookup[masterBarBounds.Index] = masterBarBounds;
                        }
                        else
                        {
                            masterBarBounds = masterBarBoundsLookup[renderer.Bar.MasterBar.Index];
                        }


                        renderer.BuildBoundingsLookup(masterBarBounds, x, cy + Y + staff.Y);
                    }
                }
            }
        }

        public float GetBarX(int index)
        {
            if (_firstStaffInAccolade == null || Layout.Renderer.Tracks.Length == 0)
            {
                return 0;
            }

            var bar = Layout.Renderer.Tracks[0].Staves[0].Bars[index];
            var renderer = Layout.GetRendererForBar<BarRendererBase>(_firstStaffInAccolade.StaveId, bar);
            return renderer.X;
        }
    }
}
