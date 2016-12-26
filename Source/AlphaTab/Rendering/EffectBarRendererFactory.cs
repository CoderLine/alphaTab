using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    public class EffectBarRendererFactory : BarRendererFactory
    {
        private readonly IEffectBarRendererInfo[] _infos;
        private readonly string _staffId;

        public override string StaffId
        {
            get { return _staffId; }
        }

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