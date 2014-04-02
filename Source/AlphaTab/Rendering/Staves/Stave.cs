using System;
using System.Collections.Generic;
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
        public StaveTrackGroup StaveTrackGroup { get; set; }
        public StaveGroup StaveGroup { get; set; }

        private BarRendererFactory _factory;
        public List<BarRendererBase> BarRenderers { get; set; }

        public int X { get; set; }
        public int Y { get; set; }
        public int Height { get; set; }
        public int Index { get; set; }

        /// <summary>
        /// This is the visual offset from top where the
        /// stave contents actually start. Used for grouping 
        /// using a accolade
        /// </summary>
        public int StaveTop { get; set; }
        public int TopSpacing { get; set; }
        public int BottomSpacing { get; set; }
        /// <summary>
        /// This is the visual offset from top where the
        /// stave contents actually ends. Used for grouping 
        /// using a accolade
        /// </summary>
        public int StaveBottom { get; set; }

        public bool IsFirstInAccolade { get; set; }
        public bool IsLastInAccolade { get; set; }

        public Stave(BarRendererFactory factory)
        {
            BarRenderers = new List<BarRendererBase>();
            _factory = factory;
            TopSpacing = 10;
            BottomSpacing = 10;
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

        public void RegisterStaveTop(int offset)
        {
            StaveTop = offset;
        }

        public void RegisterStaveBottom(int offset)
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
        }

        public void RevertLastBar()
        {
            BarRenderers.RemoveAt(BarRenderers.Count - 1);
        }

        public void ApplyBarSpacing(int spacing)
        {
            foreach (var b in BarRenderers)
            {
                b.ApplyBarSpacing(spacing);
            }
        }

        public int TopOverflow
        {
            get
            {
                var m = 0;
                foreach (var r in BarRenderers)
                {
                    if (r.TopOverflow > m)
                    {
                        m = r.TopOverflow;
                    }
                }
                return m;
            }
        }

        public int BottomOverflow
        {
            get
            {
                var m = 0;
                foreach (var r in BarRenderers)
                {
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
            var x = 0;
            Height = 0;

            var topOverflow = TopOverflow;
            var bottomOverflow = BottomOverflow;
            var isEmpty = true;
            for (var i = 0; i < BarRenderers.Count; i++)
            {
                BarRenderers[i].X = x;
                BarRenderers[i].Y = TopSpacing + topOverflow;
                Height = (int)(Math.Max(Height, BarRenderers[i].Height));
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

        public void Paint(int cx, int cy, ICanvas canvas)
        {
            if (Height == 0) return;
            foreach (var r in BarRenderers)
            {
                r.Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
