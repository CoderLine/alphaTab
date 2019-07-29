using System;
using System.IO;
using System.Linq;
using AlphaTab.Importer;
using AlphaTab.Model;

namespace AlphaTab.Samples.ScoreDump
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

            var score = ScoreLoader.LoadScoreFromBytes(File.ReadAllBytes(args[0]));

            // score info 
            Console.WriteLine("Title: {0}", score.Title);
            Console.WriteLine("Subtitle: {0}", score.SubTitle);
            Console.WriteLine("Artist: {0}", score.Artist);
            Console.WriteLine("Tempo: {0}", score.Tempo);
            Console.WriteLine("Bars: {0}", score.MasterBars.Count);
            Console.WriteLine("Time Signature: {0}/{1}", score.MasterBars[0].TimeSignatureNumerator,
                score.MasterBars[0].TimeSignatureDenominator);
            // tracks
            Console.WriteLine("Tracks: ");
            for (int i = 0; i < score.Tracks.Count; i++)
            {
                Track track = (Track)score.Tracks[i];
                Console.WriteLine("   {0} - {1} - {2}", i + 1, track.Name, track.Staves.Any(s=>s.IsPercussion) ? "Percussion" : "Midi Instrument: " + track.PlaybackInfo.Program);
            }
        }
    }
}
