using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This is the base public class for creating factories providing BarRenderers
    /// </summary>
    abstract public class BarRendererFactory
    {
        public bool IsInAccolade { get; set; }
        public bool HideOnMultiTrack { get; set; }

        protected BarRendererFactory()
        {
            IsInAccolade = true;
            HideOnMultiTrack = false;
        }

        public abstract BarRendererBase Create(Bar bar);
    }
}
