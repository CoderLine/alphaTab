namespace AlphaTab.IO
{
    /// <summary>
    /// Represents a stream of binary data that can be read from. 
    /// </summary>
    public interface IReadable
    {
        /// <summary>
        /// Gets or sets the current read position relative in the stream. 
        /// </summary>
        int Position { get; set; }

        /// <summary>
        /// Gets the total number of bytes contained in the stream. 
        /// </summary>
        int Length { get; }

        /// <summary>
        /// Resets the stream for reading the data from the beginning. 
        /// </summary>
        void Reset();

        /// <summary>
        /// Skip the given number of bytes. 
        /// </summary>
        /// <param name="offset">The number of bytes to skip. </param>
        void Skip(int offset);

        /// <summary>
        /// Read a single byte from the data stream. 
        /// </summary>
        /// <returns>The value of the next byte or -1 if there is no more data. </returns>
        int ReadByte();

        /// <summary>
        /// Reads the given number of bytes from the stream into the given buffer. 
        /// </summary>
        /// <param name="buffer">The buffer to fill. </param>
        /// <param name="offset">The offset in the buffer where to start writing. </param>
        /// <param name="count">The number of bytes to read. </param>
        /// <returns></returns>
        int Read(byte[] buffer, int offset, int count);

        /// <summary>
        /// Reads the remaining data. 
        /// </summary>
        /// <returns></returns>
        byte[] ReadAll();
    }
}
