using System;
using AlphaTab.IO;

namespace AlphaTab.Platform
{
    /// <summary>
    /// This is the public interface which file loaders need to implement for providing 
    /// files on different plattforms. 
    /// </summary>
    public interface IFileLoader
    {
        ByteArray LoadBinary(string path);
        void LoadBinaryAsync(string path, Action<ByteArray> success, Action<Exception> error);
    }
}
