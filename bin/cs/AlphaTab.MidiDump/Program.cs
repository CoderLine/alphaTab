using System;
using System.IO;
using alphatab.audio.generator;
using alphatab.audio.model;
using alphatab.importer;
using alphatab.model;
using haxe.lang;
using File = sys.io.File;

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
            Score score = ScoreLoader.loadScore(args[0]);

            // generate midi
            MidiFile file = MidiFileGenerator.generateMidiFile(score);

            // write midi file
            string path = Path.ChangeExtension(args[0], "mid");
            file.writeTo(File.write(path, new Null<bool>(true, true)));
        }
    }
}
