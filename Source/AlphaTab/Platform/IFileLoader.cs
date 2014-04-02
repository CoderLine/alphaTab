using System;

namespace AlphaTab.Platform
{
    /// <summary>
    /// This is the public interface which file loaders need to implement for providing 
    /// files on different plattforms. 
    /// </summary>
    public interface IFileLoader
    {
        byte[] LoadBinary(string path);
        void LoadBinaryAsync(string path, Action<byte[]> success, Action<Exception> error);
    }
}
