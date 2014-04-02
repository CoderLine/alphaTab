using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// This is the base public class for creating new layouting engines for the score renderer. 
    /// </summary>
    abstract public class ScoreLayout
    {
        public ScoreRenderer Renderer { get; set; }

        public int Width { get; set; }
        public int Height { get; set; }

        protected ScoreLayout(ScoreRenderer renderer)
        {
            Renderer = renderer;
        }

        public abstract void DoLayout();
        public abstract void PaintScore();
        public abstract void BuildBoundingsLookup(BoundingsLookup lookup);

        public float Scale 
        {
            get
            {
                return Renderer.Settings.Scale;
            }
        }
    
        protected StaveGroup CreateEmptyStaveGroup()
        {
            var group = new StaveGroup();
            group.Layout = this;
        
            var isFirstTrack = true;
            foreach (var track in Renderer.Tracks)
            {               
                foreach (var s in Renderer.Settings.Staves)
                {
                    if (Environment.StaveFactories.ContainsKey(s.Id))
                    {
                        var factory = Environment.StaveFactories[s.Id](this);
                        if (isFirstTrack || !factory.HideOnMultiTrack)
                        {
                            group.AddStave(track, new Stave(factory));
                        }
                    }
                }
                isFirstTrack = false;
            }
            return group;
        }
    }
}
