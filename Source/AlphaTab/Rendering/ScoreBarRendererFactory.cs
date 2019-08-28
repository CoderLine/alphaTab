using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This Factory procudes ScoreBarRenderer instances
    /// </summary>
    internal class ScoreBarRendererFactory : BarRendererFactory
    {
        public override string StaffId => ScoreBarRenderer.StaffId;

        public override BarRendererBase Create(ScoreRenderer renderer, Bar bar)
        {
            return new ScoreBarRenderer(renderer, bar);
        }
    }
}
