using System;
using System.Globalization;
using System.IO;
using System.Threading;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;

namespace AlphaTab.SvgDump
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

            // we need to use english culture to have correct string variants of floating points (dot as decimal separator)
            Thread.CurrentThread.CurrentCulture = new CultureInfo("en-us");
            Thread.CurrentThread.CurrentUICulture = new CultureInfo("en-us");

            // load score
            Score score = ScoreLoader.LoadScore(args[0]);

            // render score with svg engine
            Settings settings = Settings.Defaults;
            settings.Engine = "svg";
            ScoreRenderer renderer = new ScoreRenderer(settings, null);

            // get iterate tracks
            for (int i = 0; i < score.Tracks.Count; i++)
            {
                Track track = score.Tracks[i];
                // render track
                Console.WriteLine("Rendering track {0} - {1}", i + 1, track.Name);
                renderer.Render(track);

                // write svg file
                string svg = ((SvgCanvas)renderer.Canvas).ToSvg(true, "alphaTab");
                FileInfo info = new FileInfo(args[0]);
                string path = Path.Combine(info.DirectoryName, Path.GetFileNameWithoutExtension(info.Name) + "-" + i + ".svg");
                File.WriteAllText(path, svg);
            }
        }
    }
}
