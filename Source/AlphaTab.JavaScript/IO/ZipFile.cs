using Haxe.Zip;
using Phase;

namespace AlphaTab.IO
{
    public partial class ZipFile
    {
        /// <summary>
        /// Load a complete ZipFile to the memory.
        /// </summary>
        /// <param name="s">the binary source to read from.</param>
        /// <returns></returns>
        public void Load(IReadable s)
        {
            var haxeInput = new ReadableInput(s);
            var reader = new Reader(haxeInput);
            var entries = reader.Read();
            foreach (var entry in entries)
            {
                string fullName = entry.FileName;
                if (FileFilter == null || FileFilter(fullName))
                {
                    var i = fullName.LastIndexOf("/");
                    string name = i >= 0 ? fullName.Substring(i + 1) : fullName;
                    var data = entry.Data.GetData();

                    Entries.Add(new ZipEntry
                    {
                        FullName = fullName,
                        FileName = name,
                        Data = Script.Write<byte[]>("data")
                    });
                }
            }
        }
    }
}