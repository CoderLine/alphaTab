using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    public class RhythmBarRendererFactory : BarRendererFactory
    {
        private readonly BeamDirection _direction;

        public RhythmBarRendererFactory(BeamDirection direction)
        {
            _direction = direction;
            IsInAccolade = false;
            HideOnMultiTrack = false;
        }

        public override BarRendererBase Create(Bar bar)
        {
            return new RhythmBarRenderer(bar, _direction);
        }
    }
}