using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using AlphaTab;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Platform.CSharp;
using AlphaTab.Rendering;

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
            Score score = ScoreLoader.LoadScore(args[0]);

            // render score with svg engine
            Settings settings = Settings.Defaults;
            settings.Engine = "gdi";
            ScoreRenderer renderer = new ScoreRenderer(settings, null);

            // iterate tracks
            for (int i = 0; i < score.Tracks.Count; i++)
            {
                Track track = score.Tracks[i];

                // render track
                Console.WriteLine("Rendering track {0} - {1}", i + 1, track.Name);
                renderer.Render(track);

                // write png
                FileInfo info = new FileInfo(args[0]);
                string path = Path.Combine(info.DirectoryName, Path.GetFileNameWithoutExtension(info.Name) + "-" + i + ".png");
                using (Bitmap bmp = ((GdiCanvas)renderer.Canvas).Image)
                {
                    bmp.Save(path, ImageFormat.Png);
                }
            }
        }
    }
}
