namespace AlphaTab.UI
{
    public class Cursors
    {
        public IContainer CursorWrapper { get; set; }
        public IContainer BarCursor { get; set; }
        public IContainer BeatCursor { get; set; }
        public IContainer SelectionWrapper { get; set; }

        public Cursors(IContainer cursorWrapper, IContainer barCursor, IContainer beatCursor, IContainer selectionWrapper)
        {
            CursorWrapper = cursorWrapper;
            BarCursor = barCursor;
            BeatCursor = beatCursor;
            SelectionWrapper = selectionWrapper;
        }
    }
}