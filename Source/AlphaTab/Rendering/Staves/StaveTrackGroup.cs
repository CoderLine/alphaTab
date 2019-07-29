using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Staves
{
    internal class StaveTrackGroup
    {
        public Track Track { get; set; }
        public StaveGroup StaveGroup { get; set; }
        public FastList<Staff> Staves { get; set; }

        public Staff FirstStaffInAccolade { get; set; }
        public Staff LastStaffInAccolade { get; set; }

        public StaveTrackGroup(StaveGroup staveGroup, Track track)
        {
            StaveGroup = staveGroup;
            Track = track;
            Staves = new FastList<Staff>();
        }
    }
}
