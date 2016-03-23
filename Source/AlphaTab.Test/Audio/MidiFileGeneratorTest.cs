using System;
using System.IO;
using System.Text;
using AlphaTab.Audio;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Model;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Audio
{
    [TestClass]
    public class MidiFileGeneratorTest
    {
        private Score ParseTex(string tex)
        {
            var import = new AlphaTexImporter();
            import.Init(new StreamWrapper(new MemoryStream(Encoding.UTF8.GetBytes(tex))));
            return import.ReadScore();
        }

        [TestMethod]
        public void TestBend()
        {
            var tex = ":4 15.6{b(0 4)} 15.6";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.Tracks[0].Bars.Count);
            Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices.Count);
            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes.Count);
            Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes.Count);

            var handler = new FlatMidiEventGenerator();
            var generator = new MidiFileGenerator(score, handler);
            generator.Generate();

            var info = score.Tracks[0].PlaybackInfo;
            var note = score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0];

            var expectedEvents = new FlatMidiEventGenerator.MidiEvent[]
            {
                // channel init
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) MidiController.Volume, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) MidiController.Balance, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) MidiController.Expression, Value = 127},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) MidiController.Volume, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) MidiController.Balance, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) MidiController.Expression, Value = 127},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.TimeSignatureEvent { Tick = 0, Numerator = 4, Denominator = 4 },
                new FlatMidiEventGenerator.TempoEvent { Tick = 0, Tempo = 120 },

                // bend effect 
                new FlatMidiEventGenerator.BendEvent { Tick = 0, Track = 0, Channel = info.PrimaryChannel, Value = 64 }, // no bend
                new FlatMidiEventGenerator.BendEvent { Tick = 87, Track = 0, Channel = info.PrimaryChannel, Value = 65 },
                new FlatMidiEventGenerator.BendEvent { Tick = 174, Track = 0, Channel = info.PrimaryChannel, Value = 66 },
                new FlatMidiEventGenerator.BendEvent { Tick = 261, Track = 0, Channel = info.PrimaryChannel, Value = 67 },
                new FlatMidiEventGenerator.BendEvent { Tick = 349, Track = 0, Channel = info.PrimaryChannel, Value = 68 }, 
                new FlatMidiEventGenerator.BendEvent { Tick = 436, Track = 0, Channel = info.PrimaryChannel, Value = 69 },
                new FlatMidiEventGenerator.BendEvent { Tick = 523, Track = 0, Channel = info.PrimaryChannel, Value = 70 },
                new FlatMidiEventGenerator.BendEvent { Tick = 610, Track = 0, Channel = info.PrimaryChannel, Value = 71 }, 
                new FlatMidiEventGenerator.BendEvent { Tick = 698, Track = 0, Channel = info.PrimaryChannel, Value = 72 }, 
                new FlatMidiEventGenerator.BendEvent { Tick = 785, Track = 0, Channel = info.PrimaryChannel, Value = 73 },
                new FlatMidiEventGenerator.BendEvent { Tick = 872, Track = 0, Channel = info.PrimaryChannel, Value = 74 },
                new FlatMidiEventGenerator.BendEvent { Tick = 959, Track = 0, Channel = info.PrimaryChannel, Value = 75 },
                new FlatMidiEventGenerator.BendEvent { Tick = 960, Track = 0, Channel = info.PrimaryChannel, Value = 64 },

                // note itself
                new FlatMidiEventGenerator.NoteEvent { Tick = 0, Track = 0, Channel = info.PrimaryChannel, DynamicValue = note.Dynamic, Key = (byte) note.RealValue, Length = note.Beat.Duration.ToTicks() },
                new FlatMidiEventGenerator.NoteEvent { Tick = 960, Track = 0, Channel = info.PrimaryChannel, DynamicValue = note.Dynamic, Key = (byte) note.RealValue, Length = note.Beat.Duration.ToTicks() }
            };

            for (int i = 0; i < handler.MidiEvents.Count; i++)
            {
                Console.WriteLine("i[{0}] {1}", i, handler.MidiEvents[i]);
                if (i < expectedEvents.Length)
                {
                    Assert.AreEqual(expectedEvents[i], handler.MidiEvents[i]);
                }
            }

            Assert.AreEqual(expectedEvents.Length, handler.MidiEvents.Count);
        }

        [TestMethod]
        public void TestBendMultiPoint()
        {
            var tex = ":4 15.6{b(0 4 0)} 15.6";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.Tracks[0].Bars.Count);
            Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices.Count);
            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes.Count);
            Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes.Count);

            var handler = new FlatMidiEventGenerator();
            var generator = new MidiFileGenerator(score, handler);
            generator.Generate();

            var info = score.Tracks[0].PlaybackInfo;
            var note = score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0];

            var expectedEvents = new FlatMidiEventGenerator.MidiEvent[]
            {
                // channel init
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) MidiController.Volume, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) MidiController.Balance, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) MidiController.Expression, Value = 127},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) MidiController.Volume, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) MidiController.Balance, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) MidiController.Expression, Value = 127},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.TimeSignatureEvent { Tick = 0, Numerator = 4, Denominator = 4 },
                new FlatMidiEventGenerator.TempoEvent { Tick = 0, Tempo = 120 },

                // bend effect 
                new FlatMidiEventGenerator.BendEvent { Tick = 0, Track = 0, Channel = info.PrimaryChannel, Value = 64 }, // no bend
                new FlatMidiEventGenerator.BendEvent { Tick = 43, Track = 0, Channel = info.PrimaryChannel, Value = 65 },
                new FlatMidiEventGenerator.BendEvent { Tick = 87, Track = 0, Channel = info.PrimaryChannel, Value = 66 },
                new FlatMidiEventGenerator.BendEvent { Tick = 130, Track = 0, Channel = info.PrimaryChannel, Value = 67 },
                new FlatMidiEventGenerator.BendEvent { Tick = 174, Track = 0, Channel = info.PrimaryChannel, Value = 68 }, 
                new FlatMidiEventGenerator.BendEvent { Tick = 218, Track = 0, Channel = info.PrimaryChannel, Value = 69 },
                new FlatMidiEventGenerator.BendEvent { Tick = 261, Track = 0, Channel = info.PrimaryChannel, Value = 70 },
                new FlatMidiEventGenerator.BendEvent { Tick = 305, Track = 0, Channel = info.PrimaryChannel, Value = 71 }, 
                new FlatMidiEventGenerator.BendEvent { Tick = 349, Track = 0, Channel = info.PrimaryChannel, Value = 72 }, 
                new FlatMidiEventGenerator.BendEvent { Tick = 392, Track = 0, Channel = info.PrimaryChannel, Value = 73 },
                new FlatMidiEventGenerator.BendEvent { Tick = 436, Track = 0, Channel = info.PrimaryChannel, Value = 74 },
                new FlatMidiEventGenerator.BendEvent { Tick = 479, Track = 0, Channel = info.PrimaryChannel, Value = 75 }, // full bend

                new FlatMidiEventGenerator.BendEvent { Tick = 480, Track = 0, Channel = info.PrimaryChannel, Value = 75 }, // full bend 
                new FlatMidiEventGenerator.BendEvent { Tick = 523, Track = 0, Channel = info.PrimaryChannel, Value = 74 },
                new FlatMidiEventGenerator.BendEvent { Tick = 567, Track = 0, Channel = info.PrimaryChannel, Value = 73 },
                new FlatMidiEventGenerator.BendEvent { Tick = 610, Track = 0, Channel = info.PrimaryChannel, Value = 72 },
                new FlatMidiEventGenerator.BendEvent { Tick = 654, Track = 0, Channel = info.PrimaryChannel, Value = 71 },
                new FlatMidiEventGenerator.BendEvent { Tick = 698, Track = 0, Channel = info.PrimaryChannel, Value = 70 },
                new FlatMidiEventGenerator.BendEvent { Tick = 741, Track = 0, Channel = info.PrimaryChannel, Value = 69 },
                new FlatMidiEventGenerator.BendEvent { Tick = 785, Track = 0, Channel = info.PrimaryChannel, Value = 68 },
                new FlatMidiEventGenerator.BendEvent { Tick = 829, Track = 0, Channel = info.PrimaryChannel, Value = 67 },
                new FlatMidiEventGenerator.BendEvent { Tick = 872, Track = 0, Channel = info.PrimaryChannel, Value = 66 }, 
                new FlatMidiEventGenerator.BendEvent { Tick = 916, Track = 0, Channel = info.PrimaryChannel, Value = 65 },
                new FlatMidiEventGenerator.BendEvent { Tick = 959, Track = 0, Channel = info.PrimaryChannel, Value = 64 }, // no bend 
                new FlatMidiEventGenerator.BendEvent { Tick = 960, Track = 0, Channel = info.PrimaryChannel, Value = 64 }, // finish

                // note itself
                new FlatMidiEventGenerator.NoteEvent { Tick = 0, Track = 0, Channel = info.PrimaryChannel, DynamicValue = note.Dynamic, Key = (byte) note.RealValue, Length = note.Beat.Duration.ToTicks() },
                new FlatMidiEventGenerator.NoteEvent { Tick = 960, Track = 0, Channel = info.PrimaryChannel, DynamicValue = note.Dynamic, Key = (byte) note.RealValue, Length = note.Beat.Duration.ToTicks() }
            };

            for (int i = 0; i < handler.MidiEvents.Count; i++)
            {
                Console.WriteLine("i[{0}] {1}", i, handler.MidiEvents[i]);
                if (i < expectedEvents.Length)
                {
                    Assert.AreEqual(expectedEvents[i], handler.MidiEvents[i]);
                }
            }

            Assert.AreEqual(expectedEvents.Length, handler.MidiEvents.Count);
        }
    }
}
