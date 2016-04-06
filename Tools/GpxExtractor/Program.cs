using System;
using System.IO;
using AlphaTab.Importer;
using AlphaTab.IO;

namespace GpxExtractor
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 2)
            {
                Console.WriteLine("Usage GpxExtractor Mode PathToGpx");
                Console.WriteLine("Mode can be extract or decompress");
                return;
            }

            var gpxFs = new GpxFileSystem();
            var dir = Path.Combine(Path.GetDirectoryName(args[1]), Path.GetFileNameWithoutExtension(args[1]));
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            var mode = args[0];
            switch (mode)
            {
                case "extract":

                    gpxFs.Load(ByteBuffer.FromBuffer(File.ReadAllBytes(args[1])));

                    foreach (var file in gpxFs.Files)
                    {
                        Console.WriteLine("Extracting {0}", file.FileName);
                        File.WriteAllBytes(Path.Combine(dir, file.FileName), file.Data);
                    }

                    break;
                case "decompress":

                    var src = new BitReader(ByteBuffer.FromBuffer(File.ReadAllBytes(args[1])));

                    var header = gpxFs.ReadHeader(src);
                    Console.WriteLine("Found Header: {0}", header);

                    if (header != GpxFileSystem.HeaderBcFz)
                    {
                        Console.WriteLine("The requested file is no compressed gpx");
                        return;
                    }

                    var decompressed = gpxFs.Decompress(src);
                    File.WriteAllBytes(Path.Combine(dir, "Decompressed.gpx"), decompressed);
                    break;
            }

        }
    }
}
