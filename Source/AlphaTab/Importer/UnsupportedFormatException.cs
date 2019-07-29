namespace AlphaTab.Importer
{
    /// <summary>
    /// The exception thrown by a <see cref="ScoreImporter"/> in case the
    /// binary data does not contain a reader compatible structure. 
    /// </summary>
    public class UnsupportedFormatException : AlphaTabException
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UnsupportedFormatException"/> class.
        /// </summary>
        /// <param name="message">The message that describes the error.</param>
        public UnsupportedFormatException(string message = "Unsupported format")
            : base(message)
        {
        }
    }
}
