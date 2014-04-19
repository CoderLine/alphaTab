using System;
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
        public static readonly int[] PagePadding = { 20, 20, 20, 20 };
        public const int GroupSpacing = 20;

        private StaveGroup _group;

        public HorizontalScreenLayout(ScoreRenderer renderer)
            : base(renderer)
        {
        }

        public override void DoLayout()
        {
            if (Renderer.Settings.Staves.Count == 0) return;
        
            var score = Renderer.Score;
        
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
        
            y += _group.Height + (int)(GroupSpacing * Scale);
            Height = y + PagePadding[3];
            Width = _group.X + _group.Width + PagePadding[2];
        }

        public override void PaintScore()
        {
            Renderer.Canvas.Color = Renderer.RenderingResources.MainGlyphColor;
            _group.Paint(0, 0, Renderer.Canvas);
        }

        public override void BuildBoundingsLookup(BoundingsLookup lookup)
        {
            _group.BuildBoundingsLookup(lookup);
        }
    }
}
