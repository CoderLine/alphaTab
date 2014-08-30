using System;

namespace AlphaTab.IO
{
    public class FileLoadException : Exception
    {
        public FileLoadException(string message)
            : base(message)
        {
        }
    }
}