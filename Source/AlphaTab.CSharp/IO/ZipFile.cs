using System.IO;

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
#if NET471 || NETSTANDARD2_0
            using (var zipArchive = new System.IO.Compression.ZipArchive(ReadableStream.Create(s), System.IO.Compression.ZipArchiveMode.Read))
            {
                foreach (var entry in zipArchive.Entries)
                {
                    if (FileFilter == null || FileFilter(entry.Name))
                    {
                        using (var data = new MemoryStream((int)entry.Length))
                        using (var source = entry.Open())
                        {
                            source.CopyTo(data);
                            Entries.Add(new ZipEntry
                            {
                                Data = data.ToArray(),
                                FileName = entry.Name
                            });
                        }
                    }
                }
            }
#elif ANDROID
            using (var zipInputStream = new Java.Util.Zip.ZipInputStream(ReadableStream.Create(s)))
            {
                Java.Util.Zip.ZipEntry entry;
                byte[] copyBuffer = new byte[4096];
                while ((entry = zipInputStream.NextEntry) != null)
                {
                    if (FileFilter == null || FileFilter(entry.Name))
                    {
                        using (var data = new MemoryStream((int) entry.Size))
                        {
                            int c;
                            while ((c = zipInputStream.Read(copyBuffer)) > 0)
                            {
                                data.Write(copyBuffer, 0, c);
                            }

                            Entries.Add(new ZipEntry
                            {
                                Data = data.ToArray(),
                                FileName = entry.Name
                            });
                        }
                    }
                }
               
            }
#endif
        }
    }
}