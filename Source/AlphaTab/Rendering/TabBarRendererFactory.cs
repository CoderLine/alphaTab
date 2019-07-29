using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This Factory produces TabBarRenderer instances
    /// </summary>
    internal class TabBarRendererFactory : BarRendererFactory
    {
        private readonly bool _showTimeSignature;
        private readonly bool _showRests;
        private readonly bool _showTiedNotes;
        public override string StaffId => TabBarRenderer.StaffId;

        public TabBarRendererFactory(bool showTimeSignature, bool showRests, bool showTiedNotes)
        {
            _showTimeSignature = showTimeSignature;
            _showRests = showRests;
            _showTiedNotes = showTiedNotes;
            HideOnPercussionTrack = true;
        }

        public override bool CanCreate(Track track, Staff staff)
        {
            return staff.Tuning.Length > 0 && base.CanCreate(track, staff);
        }

        public override BarRendererBase Create(ScoreRenderer renderer, Bar bar, StaveSettings staveSettings)
        {
            var tabBarRenderer = new TabBarRenderer(renderer, bar);
            tabBarRenderer.ShowRests = _showRests;
            tabBarRenderer.ShowTimeSignature = _showTimeSignature;
            tabBarRenderer.ShowTiedNotes = _showTiedNotes;
            tabBarRenderer.RenderRhythm = staveSettings.Get("rhythm", tabBarRenderer.RenderRhythm);
            tabBarRenderer.RhythmHeight = staveSettings.Get("rhythmHeight", tabBarRenderer.RhythmHeight);
            tabBarRenderer.RhythmBeams = staveSettings.Get("rhythmBeams", tabBarRenderer.RhythmBeams);

            return tabBarRenderer;
        }
    }
}
