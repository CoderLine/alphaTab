using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This Factory produces TabBarRenderer instances
    /// </summary>
    public class TabBarRendererFactory : BarRendererFactory
    {
        public override bool CanCreate(Track track)
        {
            return track.Tuning.Count > 0;
        }

        public override BarRendererBase Create(Bar bar)
        {
            return new TabBarRenderer(bar);
        }
    }
}