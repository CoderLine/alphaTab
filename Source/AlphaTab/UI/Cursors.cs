namespace AlphaTab.UI
{
    /// <summary>
    /// This wrapper holds all cursor related elements. 
    /// </summary>
    public class Cursors
    {
        /// <summary>
        /// Gets the element that spans across the whole music sheet and holds the other cursor elements.  
        /// </summary>
        public IContainer CursorWrapper { get; }
        /// <summary>
        /// Gets the element that is positioned above the bar that is currently played. 
        /// </summary>
        public IContainer BarCursor { get; }
        /// <summary>
        /// Gets the element that is positioned above the beat that is currently played. 
        /// </summary>
        public IContainer BeatCursor { get; }
        /// <summary>
        /// Gets the element that spans across the whole music sheet and will hold any selection related elements. 
        /// </summary>
        public IContainer SelectionWrapper { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Cursors"/> class.
        /// </summary>
        /// <param name="cursorWrapper"></param>
        /// <param name="barCursor"></param>
        /// <param name="beatCursor"></param>
        /// <param name="selectionWrapper"></param>
        public Cursors(IContainer cursorWrapper, IContainer barCursor, IContainer beatCursor, IContainer selectionWrapper)
        {
            CursorWrapper = cursorWrapper;
            BarCursor = barCursor;
            BeatCursor = beatCursor;
            SelectionWrapper = selectionWrapper;
        }
    }
}