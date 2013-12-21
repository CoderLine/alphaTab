using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using alphatab;
using alphatab.importer;
using alphatab.model;
using alphatab.platform.cs;
using alphatab.rendering;

namespace Alphatab.PngDump
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.WriteLine("Usage AlphaTab.ScoreDump.exe Path");
                return;
            }

            // load score
            Score score = ScoreLoader.loadScore(args[0]);

            // render score with svg engine
            Settings settings = Settings.defaults();
            settings.engine = "gdi";
            ScoreRenderer renderer = new ScoreRenderer(settings, null);

            // iterate tracks
            for (int i = 0; i < score.tracks.length; i++)
            {
                Track track = (Track)score.tracks[i];

                // render track
                Console.WriteLine("Rendering track {0} - {1}", i + 1, track.name);
                renderer.render(track);

                // write png
                FileInfo info = new FileInfo(args[0]);
                string path = Path.Combine(info.DirectoryName, Path.GetFileNameWithoutExtension(info.Name) + "-" + i + ".png");
                using (Bitmap bmp = ((GdiCanvas)renderer.canvas).getImage())
                {
                    bmp.Save(path, ImageFormat.Png);
                }
            }
        }
    }
}
