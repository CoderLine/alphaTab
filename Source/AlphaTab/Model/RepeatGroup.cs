using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class can store the information about a group of measures which are repeated
    /// </summary>
    public class RepeatGroup
    {
        /// <summary>
        /// All masterbars repeated within this group
        /// </summary>
        public FastList<MasterBar> MasterBars { get; set; }

        /// <summary>
        /// a list of masterbars which open the group. 
        /// </summary>
        public FastList<MasterBar> Openings { get; set; }

        /// <summary>
        /// a list of masterbars which close the group. 
        /// </summary>
        public FastList<MasterBar> Closings { get; set; }

        /// <summary>
        ///  true if the repeat group was opened well
        /// </summary>
        public bool IsOpened { get; set; }

        /// <summary>
        ///  true if the repeat group was closed well
        /// </summary>
        public bool IsClosed { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="RepeatGroup"/> class.
        /// </summary>
        public RepeatGroup()
        {
            MasterBars = new FastList<MasterBar>();
            Openings = new FastList<MasterBar>();
            Closings = new FastList<MasterBar>();
            IsClosed = false;
        }

        internal void AddMasterBar(MasterBar masterBar)
        {
            if (Openings.Count == 0)
            {
                Openings.Add(masterBar);
            }

            MasterBars.Add(masterBar);
            masterBar.RepeatGroup = this;

            if (masterBar.IsRepeatEnd)
            {
                Closings.Add(masterBar);
                IsClosed = true;
                if (!IsOpened)
                {
                    MasterBars[0].IsRepeatStart = true;
                    IsOpened = true;
                }
            }
            // a new item after the header was closed? -> repeat alternative reopens the group
            else if (IsClosed)
            {
                IsClosed = false;
                Openings.Add(masterBar);
            }
        }
    }
}
