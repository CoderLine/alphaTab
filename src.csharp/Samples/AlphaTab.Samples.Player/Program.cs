using System;
using System.IO;
using AlphaTab.Midi;
using AlphaTab.Synth;
using AlphaTab.Importer;

namespace AlphaTab.Samples.Player
{
    public static class Program
    {
        private static void Main(string[] args)
        {
            if (args.Length != 2)
            {
                Console.WriteLine("Usage AlphaTab.Samples.Player.exe PathToFile PathToSoundFont");
                return;
            }

            // load score
            var score = ScoreLoader.LoadScoreFromBytes(File.ReadAllBytes(args[0]));

            // generate midi
            var midiFile = new MidiFile();
            var handler = new AlphaSynthMidiFileHandler(midiFile);
            var generator = new MidiFileGenerator(score, null, handler);
            generator.Generate();

            var player = new AlphaSynth(new NAudioSynthOutput());
            player.MidiLoaded.On(() => { Console.WriteLine("Midi loaded"); });
            player.SoundFontLoaded.On(() => { Console.WriteLine("SoundFont loaded"); });
            player.MidiLoadFailed.On(e => { Console.WriteLine("Midi load failed"); });
            player.SoundFontLoadFailed.On(e => { Console.WriteLine("SoundFont load failed"); });
            player.Finished.On(() =>
            {
                Console.WriteLine("Playback finished");
                ((NAudioSynthOutput) player.Output).Close();
            });
            player.PositionChanged.On(e =>
            {
                var currentTime = TimeSpan.FromMilliseconds(e.CurrentTime);
                var endTime = TimeSpan.FromMilliseconds(e.EndTime);

                Console.Write("\r{0:mm\\:ss\\:fff} ({1}) of {2:mm\\:ss\\:fff} ({3})",
                    currentTime, e.CurrentTick, endTime, e.EndTick);
            });
            player.ReadyForPlayback.On(() => { Console.WriteLine("Ready for playback"); });
            player.LoadSoundFont(File.ReadAllBytes(args[1]), false);
            player.LoadMidiFile(midiFile);

            Console.WriteLine("Start playing");
            player.Play();

            Console.WriteLine("Press enter to exit");
            Console.ReadLine();

            player.Pause();

            Console.ReadLine();
        }
    }
}
