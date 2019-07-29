namespace AlphaTab.Model
{
    /// <summary>
    /// This public class is used to describe the beginning of a 
    /// section within a song. It acts like a marker. 
    /// </summary>
    public class Section
    {
        /// <summary>
        /// Gets or sets the marker ID for this section. 
        /// </summary>
        public string Marker { get; set; }
        /// <summary>
        /// Gets or sets the descriptional text of this section.
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Section"/> class.
        /// </summary>
        public Section()
        {
            Text = Marker = "";
        }

        internal static void CopyTo(Section src, Section dst)
        {
            dst.Marker = src.Marker;
            dst.Text = src.Text;
        }
    }
}