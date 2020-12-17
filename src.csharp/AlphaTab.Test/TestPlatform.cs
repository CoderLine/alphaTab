using System.IO;
using System.Threading.Tasks;
using AlphaTab.Core.EcmaScript;

namespace AlphaTab
{
    static partial class TestPlatform
    {
        public static async Task<Uint8Array> LoadFile(string path)
        {
            await using var fs = new FileStream(path, FileMode.Open);
            await using var ms = new MemoryStream();
            await fs.CopyToAsync(ms);
            return new Uint8Array(ms.ToArray());
        }
		
        public static Task<IList<string>> ListDirectory(string path)
        {
            return Task.FromResult((IList<string>)Directory.EnumerateFiles(path).ToList());
        }
    }
}
