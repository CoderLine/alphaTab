namespace AlphaTab
{
    /// <summary>
    /// Represents the information related to a resize event. 
    /// </summary>
    public class ResizeEventArgs
    {
        /// <summary>
        /// Gets the size before the resizing happened. 
        /// </summary>
        public int OldWidth { get; set; }

        /// <summary>
        /// Gets the size after the resize was complete. 
        /// </summary>
        public int NewWidth { get; set; }

        /// <summary>
        /// Gets the settings currently used for rendering. 
        /// </summary>
        public Settings Settings { get; set; }
    }
}
