using System.Collections.Generic;
using System.IO;
using System.Linq;
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

        public static async Task SaveFile(string name, Uint8Array data)
        {
            var path = Path.Combine("test-results", name);
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            await using var fs = new FileStream(Path.Combine("test-results", name), FileMode.Create);
            await fs.WriteAsync(data.Data.Array!, data.Data.Offset, data.Data.Count);
        }

        public static Task<IList<string>> ListDirectory(string path)
        {
            return Task.FromResult((IList<string>) Directory.EnumerateFiles(path)
                .Select(Path.GetFileName)
                .ToList());
        }
    }
}
