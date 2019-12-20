using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    internal class EffectBarRendererFactory : BarRendererFactory
    {
        private readonly IEffectBarRendererInfo[] _infos;
        private readonly string _staffId;

        public override string StaffId => _staffId;

        public EffectBarRendererFactory(string staffId, IEffectBarRendererInfo[] infos)
        {
            _infos = infos;
            _staffId = staffId;
            IsInAccolade = false;
        }

        public override BarRendererBase Create(ScoreRenderer renderer, Bar bar)
        {
            return new EffectBarRenderer(renderer, bar, _infos);
        }
    }
}
