using System;

namespace AlphaTab
{
    public class AlphaTabException : Exception
    {
        public string Description { get; set; }

        public AlphaTabException(string message) : base(message)
        {
            Description = message;
        }
    }
}
