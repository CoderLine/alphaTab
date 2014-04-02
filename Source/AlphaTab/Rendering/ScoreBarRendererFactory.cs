using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This Factory procudes ScoreBarRenderer instances
    /// </summary>
    public class ScoreBarRendererFactory : BarRendererFactory
    {
        public override BarRendererBase Create(Bar bar)
        {
            return new ScoreBarRenderer(bar);
        }
    }
}