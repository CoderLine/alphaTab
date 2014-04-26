using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    public class Bounds
    {
        [IntrinsicProperty]
        public int X { get; set; }
        [IntrinsicProperty]
        public int Y { get; set; }
        [IntrinsicProperty]
        public int W { get; set; }
        [IntrinsicProperty]
        public int H { get; set; }

        public Bounds(int x, int y, int w, int h)
        {
            X = x;
            Y = y;
            W = w;
            H = h;
        }
    }

    public class BeatBoundings
    {
        [IntrinsicProperty]
        public Beat Beat { get; set; }
        [IntrinsicProperty]
        public Bounds Bounds { get; set; }
        [IntrinsicProperty]
        public Bounds VisualBounds { get; set; }
    }

    public class BarBoundings
    {
        [IntrinsicProperty]
        public bool IsFirstOfLine { get; set; }
        [IntrinsicProperty]
        public bool IsLastOfLine { get; set; }
        [IntrinsicProperty]
        public Bar Bar { get; set; }
        [IntrinsicProperty]
        public Bounds Bounds { get; set; }
        [IntrinsicProperty]
        public Bounds VisualBounds { get; set; }

        [IntrinsicProperty]
        public FastList<BeatBoundings> Beats { get; set; }

        public BarBoundings()
        {
            Beats = new FastList<BeatBoundings>();
        }

        public Beat FindBeatAtPos(int x)
        {
            var index = 0;
            // move right as long we didn't pass our x-pos
            while (index < (Beats.Count - 1) && x > (Beats[index].Bounds.X + Beats[index].Bounds.W))
            {
                index++;
            }

            return Beats[index].Beat;
        }
    }

    public class BoundingsLookup
    {
        [IntrinsicProperty]
        public FastList<BarBoundings> Bars { get; set; }

        public BoundingsLookup()
        {
            Bars = new FastList<BarBoundings>();
        }

        public Beat GetBeatAtPos(int x, int y)
        {
            //
            // find a bar which matches in y-axis
            var bottom = 0;
            var top = Bars.Count - 1;

            var barIndex = -1;
            while (bottom <= top)
            {
                var middle = (top + bottom) / 2;
                var bar = Bars[middle];

                // found?
                if (y >= bar.Bounds.Y && y <= (bar.Bounds.Y + bar.Bounds.H))
                {
                    barIndex = middle;
                    break;
                }
                // search in lower half 
                if (y < bar.Bounds.Y)
                {
                    top = middle - 1;
                }
                // search in upper half
                else
                {
                    bottom = middle + 1;
                }
            }

            // no bar found
            if (barIndex == -1) return null;

            // 
            // Find the matching bar in the row
            var currentBar = Bars[barIndex];

            // clicked before bar
            if (x < currentBar.Bounds.X)
            {
                // we move left till we either pass our x-position or are at the beginning of the line/score
                while (barIndex > 0 && x < Bars[barIndex].Bounds.X && !Bars[barIndex].IsFirstOfLine)
                {
                    barIndex--;
                }
            }
            else
            {
                // we move right till we either pass our our x-position or are at the end of the line/score
                while (barIndex < (Bars.Count - 1) && x > (Bars[barIndex].Bounds.X + Bars[barIndex].Bounds.W) && !Bars[barIndex].IsLastOfLine)
                {
                    barIndex++;
                }
            }

            // 
            // Find the matching beat within the bar
            return Bars[barIndex].FindBeatAtPos(x);
        }
    }
}
