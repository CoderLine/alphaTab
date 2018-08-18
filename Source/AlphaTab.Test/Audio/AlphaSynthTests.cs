using System;
using System.IO;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Bank;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Audio
{
    [TestClass]
    public class AlphaSynthTests
    {
        [TestMethod]
        public void TestLoadSf2PatchBank()
        {
            var data = TestPlatform.LoadFile("TestFiles/Audio/default.sf2");
            var patchBank = new PatchBank();
            var input = ByteBuffer.FromBuffer(data);
            patchBank.LoadSf2(input);

            Assert.AreEqual("GS sound set (16 bit)", patchBank.Name);
            Assert.AreEqual("960920 ver. 1.00.16", patchBank.Comments);
            Assert.AreEqual("0,1,2,3,4,5,6,7,8,9,16,24,32,128", string.Join(",", patchBank.LoadedBanks));

            var gmBank = patchBank.GetBank(0);
            var expectedPatches = new string[]
            {
                "Piano 1", "Piano 2", "Piano 3", "Honky-tonk", "E.Piano 1", "E.Piano 2", "Harpsichord", "Clav.",
                "Celesta", "Glockenspiel", "Music Box", "Vibraphone", "Marimba", "Xylophone", "Tubular-bell", "Santur", "Organ 1",
                "Organ 2", "Organ 3", "Church Org.1", "Reed Organ", "Accordion Fr", "Harmonica", "Bandoneon",
                "Nylon-str.Gt", "Steel-str.Gt", "Jazz Gt.", "Clean Gt.", "Muted Gt.", "Overdrive Gt", "DistortionGt", "Gt.Harmonics",
                "Acoustic Bs.", "Fingered Bs.", "Picked Bs.", "Fretless Bs.", "Slap Bass 1", "Slap Bass 2", "Synth Bass 1",
                "Synth Bass 2", "Violin", "Viola", "Cello", "Contrabass", "Tremolo Str", "PizzicatoStr", "Harp", "Timpani", "Strings",
                "Slow Strings", "Syn.Strings1", "Syn.Strings2", "Choir Aahs", "Voice Oohs", "SynVox", "OrchestraHit", "Trumpet", "Trombone", "Tuba",
                "MutedTrumpet", "French Horns", "Brass 1", "Synth Brass1", "Synth Brass2", "Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax",
                "Oboe", "English Horn", "Bassoon", "Clarinet", "Piccolo", "Flute", "Recorder", "Pan Flute", "Bottle Blow", "Shakuhachi", "Whistle",
                "Ocarina", "Square Wave", "Saw Wave", "Syn.Calliope", "Chiffer Lead", "Charang", "Solo Vox", "5th Saw Wave",
                "Bass & Lead", "Fantasia", "Warm Pad", "Polysynth", "Space Voice", "Bowed Glass", "Metal Pad", "Halo Pad", "Sweep Pad",
                "Ice Rain", "Soundtrack", "Crystal", "Atmosphere", "Brightness", "Goblin", "Echo Drops", "Star Theme", "Sitar",
                "Banjo", "Shamisen", "Koto", "Kalimba", "Bagpipe", "Fiddle", "Shanai", "Tinkle Bell", "Agogo", "Steel Drums", "Woodblock",
                "Taiko", "Melo. Tom 1", "Synth Drum", "Reverse Cym.", "Gt.FretNoise", "Breath Noise", "Seashore", "Bird", "Telephone 1",
                "Helicopter", "Applause", "Gun Shot"
            };
            var actualPatches = new FastList<string>();
            foreach (var patch in gmBank)
            {
                if (patch != null)
                {
                    actualPatches.Add(patch.Name);
                }
            }
            Assert.AreEqual(string.Join(",", expectedPatches), string.Join(",", actualPatches));
        }

        [TestMethod]
        public void TestPcmGeneration()
        {
            var tex = "\\tempo 102 \\tuning E4 B3 G3 D3 A2 E2 \\instrument 25 . r.8 (0.4 0.3 ).8 " +
                        "(-.3 -.4 ).2 {d } | (0.4 0.3 ).8 r.8 (3.3 3.4 ).8 r.8 (5.4 5.3 ).4 r.8 (0.4 0.3 ).8 |" +
                        " r.8 (3.4 3.3 ).8 r.8 (6.3 6.4 ).8 (5.4 5.3 ).4 {d }r.8 |" +
                        " (0.4 0.3).8 r.8(3.4 3.3).8 r.8(5.4 5.3).4 r.8(3.4 3.3).8 | " +
                        "r.8(0.4 0.3).8(-.3 - .4).2 { d } | ";
            var importer = new AlphaTexImporter();
            importer.Init(TestPlatform.CreateStringReader(tex));
            var score = importer.ReadScore();

            var midi = new MidiFile();
            var gen = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
            gen.Generate();

            var testOutput = new TestOutput();
            var synth = new AlphaSynth(testOutput);
            synth.LoadSoundFont(TestPlatform.LoadFile("TestFiles/Audio/default.sf2"));
            synth.LoadMidi(midi);

            synth.Play();

            var finished = false;
            synth.Finished += b => finished = true;

            while (!finished)
            {
                testOutput.Continue();
            }

            //Console.WriteLine(testOutput.Samples.Count);
            //using (var writer = new BinaryWriter(new FileStream("test.pcm", FileMode.Create, FileAccess.Write)))
            //{
            //    for (int i = 0; i < testOutput.Samples.Count; i++)
            //    {
            //        writer.Write(testOutput.Samples[i]);
            //    }
            //}
        }
    }

    class TestOutput : ISynthOutput
    {
        private bool _finished;

        public int SampleRate
        {
            get { return 44100; }
        }

        public FastList<float> Samples { get; set; }

        public void Open()
        {
            Samples = new FastList<float>();
            Ready();
        }

        public void SequencerFinished()
        {
            _finished = true;
        }

        public void Play()
        {
        }

        public void Continue()
        {
            if (_finished)
            {
                Finished();
            }
            else
            {
                SampleRequest();
            }
        }

        public void Pause()
        {
        }

        public void AddSamples(SampleArray f)
        {
            for (int i = 0; i < f.Length; i++)
            {
                Samples.Add(f[i]);
            }
            SamplesPlayed(f.Length);
        }

        public void ResetSamples()
        {
        }

        public event Action Ready;
        public event Action<int> SamplesPlayed;
        public event Action SampleRequest;
        public event Action Finished;
    }
}
