using System;
using System.Runtime.CompilerServices;
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
        private FastDictionary<int, BarRendererBase> _barRendererLookup;

        [IntrinsicProperty]
        public StaveTrackGroup StaveTrackGroup { get; set; }
        [IntrinsicProperty]
        public StaveGroup StaveGroup { get; set; }

        [IntrinsicProperty]
        public FastList<BarRendererBase> BarRenderers { get; set; }

        [IntrinsicProperty]
        public int X { get; set; }
        [IntrinsicProperty]
        public int Y { get; set; }
        [IntrinsicProperty]
        public int Height { get; set; }
        [IntrinsicProperty]
        public int Index { get; set; }

        /// <summary>
        /// This is the visual offset from top where the
        /// stave contents actually start. Used for grouping 
        /// using a accolade
        /// </summary>
        [IntrinsicProperty]
        public int StaveTop { get; set; }
        [IntrinsicProperty]
        public int TopSpacing { get; set; }
        [IntrinsicProperty]
        public int BottomSpacing { get; set; }
        /// <summary>
        /// This is the visual offset from top where the
        /// stave contents actually ends. Used for grouping 
        /// using a accolade
        /// </summary>
        [IntrinsicProperty]
        public int StaveBottom { get; set; }

        [IntrinsicProperty]
        public bool IsFirstInAccolade { get; set; }
        [IntrinsicProperty]
        public bool IsLastInAccolade { get; set; }

        public Stave(BarRendererFactory factory)
        {
            BarRenderers = new FastList<BarRendererBase>();
            _barRendererLookup = new FastDictionary<int, BarRendererBase>();
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
            _barRendererLookup[bar.Index] = renderer;
        }

        public void RevertLastBar()
        {
            BarRenderers.RemoveAt(BarRenderers.Count - 1);
        }

        public void ApplyBarSpacing(int spacing)
        {
            for (int i = 0, j = BarRenderers.Count; i < j; i++)
            {
                BarRenderers[i].ApplyBarSpacing(spacing);
            }
        }

        public int TopOverflow
        {
            get
            {
                var m = 0;
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

        public int BottomOverflow
        {
            get
            {
                var m = 0;
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
            for (int i = 0, j = BarRenderers.Count; i < j; i++)
            {
                BarRenderers[i].Paint(cx + X, cy + Y, canvas);
            }
        }

        public BarRendererBase GetRendererForBar(int index)
        {
            if (_barRendererLookup.ContainsKey(index))
                return _barRendererLookup[index];
            return null;
        }
    }
}
