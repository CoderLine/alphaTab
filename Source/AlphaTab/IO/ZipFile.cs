using System;
using AlphaTab.Collections;

namespace AlphaTab.IO
{
    /// <summary>
    /// this public class represents a file within the GpxFileSystem
    /// </summary>
    class ZipEntry
    {
        public string FullName { get; set; }
        public string FileName { get; set; }
        public byte[] Data { get; set; }
    }

    /// <summary>
    /// This class allows reading zip files.
    /// </summary>
    partial class ZipFile
    {
        /// <summary>
        /// You can set a file filter method using this setter. On parsing
        /// the filestructure this function can determine based on the filename 
        /// whether this file will be available after loading. 
        /// This way we can reduce the amount of memory we store.
        /// </summary>
        public Func<string, bool> FileFilter { get; set; }

        /// <summary>
        /// Gets the list of entries stored in this Zip File.
        /// </summary>
        public FastList<ZipEntry> Entries { get; set; }

        /// <summary>
        /// Creates a new GpxFileSystem instance
        /// </summary>
        public ZipFile()
        {
            Entries = new FastList<ZipEntry>();
            FileFilter = s => true;
        }
    }
}
