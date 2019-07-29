using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Staves
{
    /// <summary>
    /// This container represents a single column of bar renderers independent from any staves. 
    /// This container can be used to reorganize renderers into a new staves. 
    /// </summary>
    class MasterBarsRenderers
    {
        public float Width { get; set; }
        public bool IsLinkedToPrevious { get; set; }
        public bool CanWrap { get; set; }
        public MasterBar MasterBar { get; set; }
        public FastList<BarRendererBase> Renderers { get; set; }
        public BarLayoutingInfo LayoutingInfo { get; set; }

        public MasterBarsRenderers()
        {
            Renderers = new FastList<BarRendererBase>();
            CanWrap = true;
        }
    }
}