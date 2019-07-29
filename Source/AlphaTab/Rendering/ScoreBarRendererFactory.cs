using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This Factory procudes ScoreBarRenderer instances
    /// </summary>
    class ScoreBarRendererFactory : BarRendererFactory
    {
        public override string StaffId { get { return ScoreBarRenderer.StaffId; } }

        public override BarRendererBase Create(ScoreRenderer renderer, Bar bar, StaveSettings staveSettings)
        {
            return new ScoreBarRenderer(renderer, bar);
        }
    }
}