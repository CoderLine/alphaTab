using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// This class describes a single staff within a track. There are instruments like pianos
    /// where a single track can contain multiple staffs. 
    /// </summary>
    public class Staff
    {
        public FastList<Bar> Bars { get; set; }
        public Track Track { get; set; }
        public int Index { get; set; }

        public Staff()
        {
            Bars = new FastList<Bar>();
        }

        public void Finish()
        {
            for (int i = 0, j = Bars.Count; i < j; i++)
            {
                Bars[i].Finish();
            }
        }
    }
}