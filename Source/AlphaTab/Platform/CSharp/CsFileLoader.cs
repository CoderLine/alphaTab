using System;
using System.IO;

namespace AlphaTab.Platform.CSharp
{
    /// <summary>
    /// This file loader loads binary files using the native apis
    /// </summary>
    public class CsFileLoader : IFileLoader
    {
        public byte[] LoadBinary(string path)
        {
            return File.ReadAllBytes(path);
        }

        public void LoadBinaryAsync(string path, Action<byte[]> success, Action<Exception> error)
        {
            try
            {
                success(LoadBinary(path));
            }
            catch (Exception e)
            {
                error(e);
            }
        }
    }
}
