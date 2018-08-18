namespace AlphaTab.Model
{
    /// <summary>
    /// This class represents the rendering stylesheet.
    /// It contains settings which control the display of the score when rendered. 
    /// </summary>
    public class RenderStylesheet
    {
        /// <summary>
        /// Gets or sets whether dynamics are hidden.
        /// </summary>
        public bool HideDynamics { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="RenderStylesheet"/> class.
        /// </summary>
        public RenderStylesheet()
        {
            HideDynamics = false;
        }

        internal static void CopyTo(RenderStylesheet src, RenderStylesheet dst)
        {
            dst.HideDynamics = src.HideDynamics;
        }
    }
}