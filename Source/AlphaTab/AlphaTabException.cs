using System;

namespace AlphaTab
{
    /// <summary>
    /// The base class for all errors that can happen in alphaTab. 
    /// </summary>
    public class AlphaTabException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AlphaTabException"/> class.
        /// </summary>
        /// <param name="message">The message that describes the error.</param>
        public AlphaTabException(string message) : base(message)
        {
        }
    }
}
