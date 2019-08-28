using System;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.SoundFont;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Audio
{
    [TestClass]
    public class AlphaSynthTests
    {
        [TestMethod, AsyncTestMethod]
        public void TestPcmGeneration()
        {
            TestPlatform.LoadFile("TestFiles/Audio/default.sf2", data =>
            {
                var tex = "\\tempo 102 \\tuning E4 B3 G3 D3 A2 E2 \\instrument 25 . r.8 (0.4 0.3 ).8 " +
                          "(-.3 -.4 ).2 {d } | (0.4 0.3 ).8 r.8 (3.3 3.4 ).8 r.8 (5.4 5.3 ).4 r.8 (0.4 0.3 ).8 |" +
                          " r.8 (3.4 3.3 ).8 r.8 (6.3 6.4 ).8 (5.4 5.3 ).4 {d }r.8 |" +
                          " (0.4 0.3).8 r.8(3.4 3.3).8 r.8(5.4 5.3).4 r.8(3.4 3.3).8 | " +
                          "r.8(0.4 0.3).8(-.3 - .4).2 { d } | ";
                var importer = new AlphaTexImporter();
                importer.Init(TestPlatform.CreateStringReader(tex), new Settings());
                var score = importer.ReadScore();

                var midi = new MidiFile();
                var gen = new MidiFileGenerator(score, null, new AlphaSynthMidiFileHandler(midi));
                gen.Generate();

                var testOutput = new TestOutput();
                var synth = new AlphaSynth(testOutput);
                synth.LoadSoundFont(data);
                synth.LoadMidiFile(midi);

                synth.Play();

                var finished = false;
                synth.Finished += () => finished = true;

                while (!finished)
                {
                    testOutput.Next();
                }

                //Console.WriteLine(testOutput.Samples.Count);
                //using (var writer = new BinaryWriter(new FileStream("test.pcm", FileMode.Create, FileAccess.Write)))
                //{
                //    for (int i = 0; i < testOutput.Samples.Count; i++)
                //    {
                //        writer.Write(testOutput.Samples[i]);
                //    }
                //}
            });
        }
    }

    internal class TestOutput : ISynthOutput
    {
        private bool _finished;

        public int SampleRate => 44100;

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

        public void Next()
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

        public void AddSamples(float[] f)
        {
            for (var i = 0; i < f.Length; i++)
            {
                Samples.Add(f[i]);
            }
            SamplesPlayed(f.Length);
        }

        public void ResetSamples()
        {
        }

        public void Activate()
        {
        }

        public event Action Ready;
        public event Action<int> SamplesPlayed;
        public event Action SampleRequest;
        public event Action Finished;
    }
}
