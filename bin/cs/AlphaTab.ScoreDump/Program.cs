using System;
using alphatab.importer;
using alphatab.model;

namespace AlphaTab.ScoreDump
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

            Score score = ScoreLoader.loadScore(args[0]);

            // score info 
            Console.WriteLine("Title: {0}", score.title);
            Console.WriteLine("Subtitle: {0}", score.subTitle);
            Console.WriteLine("Artist: {0}", score.artist);
            Console.WriteLine("Tempo: {0}", score.tempo);
            Console.WriteLine("Bars: {0}", score.masterBars.length);
            Console.WriteLine("Time Signature: {0}/{1}", ((MasterBar)score.masterBars[0]).timeSignatureNumerator,
                ((MasterBar)score.masterBars[0]).timeSignatureDenominator);
            // tracks
            Console.WriteLine("Tracks: ");
            for (int i = 0; i < score.tracks.length; i++)
            {
                Track track = (Track)score.tracks[i];
                Console.WriteLine("   {0} - {1} - {2}", i + 1, track.name, track.isPercussion ? "Percussion" : "Midi Instrument: " + track.playbackInfo.program);
            }
        }
    }
}
