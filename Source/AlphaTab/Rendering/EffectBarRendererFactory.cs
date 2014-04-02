using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    public class EffectBarRendererFactory : BarRendererFactory
    {
        private readonly IEffectBarRendererInfo _info;

        public EffectBarRendererFactory(IEffectBarRendererInfo info)
        {
            _info = info;
            IsInAccolade = false;
            HideOnMultiTrack = info.HideOnMultiTrack;
        }

        public override BarRendererBase Create(Bar bar)
        {
            return new EffectBarRenderer(bar, _info);
        }
    }
}