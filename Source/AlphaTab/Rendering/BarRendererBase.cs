using System.Runtime.CompilerServices;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This is the base public class for creating blocks which can render bars.
    /// </summary>
    public class BarRendererBase
    {
        [IntrinsicProperty]
        public Stave Stave { get; set; }
        [IntrinsicProperty]
        public int X { get; set; }
        [IntrinsicProperty]
        public int Y { get; set; }
        [IntrinsicProperty]
        public int Width { get; set; }
        [IntrinsicProperty]
        public int Height { get; set; }
        [IntrinsicProperty]
        public int Index { get; set; }
        [IntrinsicProperty]
        public bool IsEmpty { get; set; }

        [IntrinsicProperty]
        public int TopOverflow { get; set; }
        [IntrinsicProperty]
        public int BottomOverflow { get; set; }

        [IntrinsicProperty]
        public Bar Bar { get; set; }

        public BarRendererBase(Bar bar)
        {
            Bar = bar;
            IsEmpty = true;
        }

        public void RegisterOverflowTop(int topOverflow)
        {
            if (topOverflow > TopOverflow)
                TopOverflow = topOverflow;
        }
        public void RegisterOverflowBottom(int bottomOverflow)
        {
            if (bottomOverflow > BottomOverflow)
                BottomOverflow = bottomOverflow;
        }


        public virtual void ApplyBarSpacing(int spacing)
        {

        }

        public RenderingResources Resources
        {
            get
            {
                return Layout.Renderer.RenderingResources;
            }
        }

        public ScoreLayout Layout
        {
            get
            {
                return Stave.StaveGroup.Layout;
            }
        }

        public Settings Settings
        {
            get
            {
                return Layout.Renderer.Settings;
            }
        }

        public float Scale
        {
            get
            {
                return Settings.Scale;
            }
        }

        public bool IsFirstOfLine
        {
            get
            {
                return Index == 0;
            }
        }

        public bool IsLastOfLine
        {
            get
            {
                return Index == Stave.BarRenderers.Count - 1;
            }
        }

        public bool IsLast
        {
            get
            {
                return Bar.Index == Stave.BarRenderers.Count - 1;
            }
        }

        public virtual void RegisterMaxSizes(BarSizeInfo sizes)
        {

        }

        public virtual void ApplySizes(BarSizeInfo sizes)
        {

        }

        public virtual void FinalizeRenderer(ScoreLayout layout)
        {

        }

        /// <summary>
        /// Gets the top padding for the main content of the renderer. 
        /// Can be used to specify where i.E. the score lines of the notation start.
        /// </summary>
        /// <returns></returns>
        public virtual int TopPadding
        {
            get
            {
                return 0;
            }
        }

        /// <summary>
        /// Gets the bottom padding for the main content of the renderer. 
        /// Can be used to specify where i.E. the score lines of the notation end.
        /// </summary>
        public virtual int BottomPadding
        {
            get
            {
                return 0;
            }
        }

        public virtual void DoLayout()
        {

        }

        public virtual void Paint(int cx, int cy, ICanvas canvas)
        {

        }

        public virtual void BuildBoundingsLookup(BoundingsLookup lookup, int visualTop, int visualHeight, int realTop, int realHeight, int x)
        {
            var barLookup = new BarBoundings();
            barLookup.Bar = Bar;
            barLookup.IsFirstOfLine = IsFirstOfLine;
            barLookup.IsLastOfLine = IsLastOfLine;
            barLookup.VisualBounds = new Bounds(x + Stave.X + X, visualTop, Width, visualHeight);
            barLookup.Bounds = new Bounds(x + Stave.X + X, realTop, Width, realHeight);
            lookup.Bars.Add(barLookup);
        }
    }
}
