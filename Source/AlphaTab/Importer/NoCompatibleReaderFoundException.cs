namespace AlphaTab.Importer
{
    /// <summary>
    /// An exception indicating no reader for importing a file could be found. 
    /// </summary>
    public class NoCompatibleReaderFoundException : AlphaTabException
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="NoCompatibleReaderFoundException"/> class.
        /// </summary>
        public NoCompatibleReaderFoundException() : base("No compatible reader found")
        {
        }
    }
}