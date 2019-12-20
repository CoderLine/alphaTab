using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This is the base public class for creating factories providing BarRenderers
    /// </summary>
    internal abstract class BarRendererFactory
    {
        public bool IsInAccolade { get; set; }
        public bool HideOnMultiTrack { get; set; }
        public bool HideOnPercussionTrack { get; set; }
        public abstract string StaffId { get; }

        protected BarRendererFactory()
        {
            IsInAccolade = true;
            HideOnPercussionTrack = false;
            HideOnMultiTrack = false;
        }

        public virtual bool CanCreate(Track track, Staff staff)
        {
            return !HideOnPercussionTrack || !staff.IsPercussion;
        }

        public abstract BarRendererBase Create(ScoreRenderer renderer, Bar bar);
    }
}
