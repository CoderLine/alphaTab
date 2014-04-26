using System;
using System.Diagnostics;
using System.IO;
using AlphaTab.Importer;
using AlphaTab.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MemoryStream = AlphaTab.IO.MemoryStream;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class GpxImporterTest
    {
        internal ByteArray Load(string name)
        {
            const string path = "TestFiles";
            return Environment.FileLoaders["default"]().LoadBinary(Path.Combine(path, name));
        }
        
        internal GpxImporter PrepareImporterWithFile(string name)
        {
            return PrepareImporterWithBytes(Load(name));
        }

        internal GpxImporter PrepareImporterWithBytes(ByteArray buffer)
        {
            var readerBase = new GpxImporter();
            readerBase.Init(new MemoryStream(buffer));
            return readerBase;
        }

        [TestMethod]
        public void TestFileSystemCompressed()
        {
            GpxFileSystem fileSystem = new GpxFileSystem();
            fileSystem.Load(new MemoryStream(Load("Compressed.gpx")));

            string[] names = {"score.gpif", "misc.xml", "BinaryStylesheet", "PartConfiguration", "LayoutConfiguration"};
            int[] sizes = {8488, 130, 12204, 20, 12};

            for (int i = 0; i < fileSystem.Files.Count; i++)
            {
                var file = fileSystem.Files[i];
                Console.WriteLine("{0} - {1}", file.FileName, file.FileSize);
                Assert.AreEqual(names[i], file.FileName);
                Assert.AreEqual(sizes[i], file.FileSize);
            }
        }
    }
}
