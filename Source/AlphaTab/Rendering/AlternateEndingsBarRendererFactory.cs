using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This Factory procudes AlternateEndingsBar instances
    /// </summary>
    public class AlternateEndingsBarRendererFactory : BarRendererFactory
    {
        public AlternateEndingsBarRendererFactory()
        {
            IsInAccolade = false;
        }

        public override BarRendererBase Create(Bar bar)
        {
            return new AlternateEndingsBarRenderer(bar);
        }
    }
}