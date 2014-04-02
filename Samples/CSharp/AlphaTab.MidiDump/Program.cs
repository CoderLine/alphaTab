using System;
using System.IO;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Model;
using AlphaTab.Importer;
using AlphaTab.Model;

namespace AlphaTab.MidiDump
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.WriteLine("Usage AlphaTab.MidiDump.exe Path");
                return;
            }

            // load score
            Score score = ScoreLoader.LoadScore(args[0]);

            // generate midi
            MidiFile file = MidiFileGenerator.GenerateMidiFile(score);

            // write midi file
            string path = Path.ChangeExtension(args[0], "mid");
            using (FileStream fs = File.OpenWrite(path))
            {
                file.WriteTo(fs);
            }
        }
    }
}
