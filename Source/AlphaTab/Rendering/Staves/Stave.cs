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

namespace AlphaTab.Rendering.Staves
{
    /// <summary>
    /// A stave represents a single line within a StaveGroup. 
    /// It stores BarRenderer instances created from a given factory. 
    /// </summary>
    public class Stave
    {
        private BarRendererFactory _factory;
        private readonly FastDictionary<string, object> _settings;

        public StaveTrackGroup StaveTrackGroup { get; set; }
        public StaveGroup StaveGroup { get; set; }

        public FastList<BarRendererBase> BarRenderers { get; set; }

        public float X { get; set; }
        public float Y { get; set; }
        public float Height { get; set; }
        public int Index { get; set; }
        public string StaveId { get; private set; }



        /// <summary>
        /// This is the visual offset from top where the
        /// stave contents actually start. Used for grouping 
        /// using a accolade
        /// </summary>
        public float StaveTop { get; set; }
        public float TopSpacing { get; set; }
        public float BottomSpacing { get; set; }
        /// <summary>
        /// This is the visual offset from top where the
        /// stave contents actually ends. Used for grouping 
        /// using a accolade
        /// </summary>
        public float StaveBottom { get; set; }

        public bool IsFirstInAccolade { get; set; }
        public bool IsLastInAccolade { get; set; }

        public Stave(string staveId, BarRendererFactory factory, FastDictionary<string, object> settings)
        {
            BarRenderers = new FastList<BarRendererBase>();
            StaveId = staveId;
            _factory = factory;
            _settings = settings;
            TopSpacing = 10;
            BottomSpacing = 10;
            StaveTop = 0;
            StaveBottom = 0;
        }

        public T GetSetting<T>(string key, T def)
        {
            if (_settings.ContainsKey(key))
            {
                return (T)(_settings[key]);
            }
            return def;
        }


        public bool IsInAccolade
        {
            get
            {
                return _factory.IsInAccolade;
            }
        }

        public void RegisterStaveTop(float offset)
        {
            StaveTop = offset;
        }

        public void RegisterStaveBottom(float offset)
        {
            StaveBottom = offset;
        }

        public void AddBar(Bar bar)
        {
            var renderer = _factory.Create(bar);
            renderer.Stave = this;
            renderer.Index = BarRenderers.Count;
            renderer.DoLayout();
            BarRenderers.Add(renderer);
            StaveGroup.Layout.RegisterBarRenderer(StaveId, bar.Index, renderer);
        }

        public void RevertLastBar()
        {
            BarRenderers.RemoveAt(BarRenderers.Count - 1);
        }

        public void ApplyBarSpacing(float spacing)
        {
            for (int i = 0, j = BarRenderers.Count; i < j; i++)
            {
                BarRenderers[i].ApplyBarSpacing(spacing);
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

        public void FinalizeStave(ScoreLayout layout)
        {
            var x = 0f;
            Height = 0;

            var topOverflow = TopOverflow;
            var bottomOverflow = BottomOverflow;
            var isEmpty = true;
            for (var i = 0; i < BarRenderers.Count; i++)
            {
                BarRenderers[i].X = x;
                BarRenderers[i].Y = TopSpacing + topOverflow;
                Height = Math.Max(Height, BarRenderers[i].Height);
                BarRenderers[i].FinalizeRenderer(layout);
                x += BarRenderers[i].Width;
                if (!BarRenderers[i].IsEmpty)
                {
                    isEmpty = false;
                }
            }

            if (!isEmpty)
            {
                Height += TopSpacing + topOverflow + bottomOverflow + BottomSpacing;
            }
            else
            {
                Height = 0;
            }
        }

        public void Paint(float cx, float cy, ICanvas canvas)
        {
            if (Height == 0) return;
            for (int i = 0, j = BarRenderers.Count; i < j; i++)
            {
                BarRenderers[i].Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
