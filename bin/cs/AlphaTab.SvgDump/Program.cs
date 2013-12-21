using System;
using System.Globalization;
using System.IO;
using System.Threading;
using alphatab;
using alphatab.importer;
using alphatab.model;
using alphatab.platform.svg;
using alphatab.rendering;

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
            Score score = ScoreLoader.loadScore(args[0]);

            // render score with svg engine
            Settings settings = Settings.defaults();
            settings.engine = "svg";
            ScoreRenderer renderer = new ScoreRenderer(settings, null);

            // get iterate tracks
            for (int i = 0; i < score.tracks.length; i++)
            {
                Track track = (Track)score.tracks[i];
                // render track
                Console.WriteLine("Rendering track {0} - {1}", i + 1, track.name);
                renderer.render(track);

                // write svg file
                string svg = ((SvgCanvas)renderer.canvas).toSvg(true, "alphaTab");
                FileInfo info = new FileInfo(args[0]);
                string path = Path.Combine(info.DirectoryName, Path.GetFileNameWithoutExtension(info.Name) + "-" + i + ".svg");
                File.WriteAllText(path, svg);
            }
        }
    }
}
