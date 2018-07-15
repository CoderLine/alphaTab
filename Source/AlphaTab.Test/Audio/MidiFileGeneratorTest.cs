using System;
using System.IO;
using System.Text;
using AlphaTab.Audio;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Util;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Audio
{
    [TestClass]
    public class MidiFileGeneratorTest
    {
        private Score ParseTex(string tex)
        {
            var importer = new AlphaTexImporter();
            importer.Init(TestPlatform.CreateStringReader(tex));
            return importer.ReadScore();
        }

        [TestMethod]
        public void TestCorrectMidiOrder()
        {
            var midiFile = new MidiFile();
            midiFile.AddEvent(new MidiEvent(0, 0, 0, 0));
            midiFile.AddEvent(new MidiEvent(0, 0, 1, 0));
            midiFile.AddEvent(new MidiEvent(100, 0, 2, 0));
            midiFile.AddEvent(new MidiEvent(50, 0, 3, 0));
            midiFile.AddEvent(new MidiEvent(50, 0, 4, 0));

            Assert.AreEqual(0, midiFile.Events[0].Data1);
            Assert.AreEqual(1, midiFile.Events[1].Data1);
            Assert.AreEqual(3, midiFile.Events[2].Data1);
            Assert.AreEqual(4, midiFile.Events[3].Data1);
            Assert.AreEqual(2, midiFile.Events[4].Data1);
        }

        [TestMethod]
        public void TestBend()
        {
            var tex = ":4 15.6{b(0 4)} 15.6";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices.Count);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes.Count);

            var handler = new FlatMidiEventGenerator();
            var generator = new MidiFileGenerator(score, null, handler);
            generator.Generate();

            var info = score.Tracks[0].PlaybackInfo;
            var note = score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0];

            var expectedEvents = new FlatMidiEventGenerator.MidiEvent[]
            {
                // channel init
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.VolumeCoarse, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.PanCoarse, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.ExpressionControllerCoarse, Value = 127},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterCourse, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryCoarse, Value = 12},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.VolumeCoarse, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.PanCoarse, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.ExpressionControllerCoarse, Value = 127},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterCourse, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryCoarse, Value = 12},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.TimeSignatureEvent { Tick = 0, Numerator = 4, Denominator = 4 },
                new FlatMidiEventGenerator.TempoEvent { Tick = 0, Tempo = 120 },

                // bend effect 
                new FlatMidiEventGenerator.BendEvent { Tick = 0, Track = 0, Channel = info.SecondaryChannel, Value = 64 }, // no bend
                new FlatMidiEventGenerator.BendEvent { Tick = 0, Track = 0, Channel = info.SecondaryChannel, Value = 64 }, 
                new FlatMidiEventGenerator.BendEvent { Tick = 87, Track = 0, Channel = info.SecondaryChannel, Value = 65 },
                new FlatMidiEventGenerator.BendEvent { Tick = 174, Track = 0, Channel = info.SecondaryChannel, Value = 66 },
                new FlatMidiEventGenerator.BendEvent { Tick = 261, Track = 0, Channel = info.SecondaryChannel, Value = 67 },
                new FlatMidiEventGenerator.BendEvent { Tick = 349, Track = 0, Channel = info.SecondaryChannel, Value = 68 },
                new FlatMidiEventGenerator.BendEvent { Tick = 436, Track = 0, Channel = info.SecondaryChannel, Value = 69 },
                new FlatMidiEventGenerator.BendEvent { Tick = 523, Track = 0, Channel = info.SecondaryChannel, Value = 70 },
                new FlatMidiEventGenerator.BendEvent { Tick = 610, Track = 0, Channel = info.SecondaryChannel, Value = 71 },
                new FlatMidiEventGenerator.BendEvent { Tick = 698, Track = 0, Channel = info.SecondaryChannel, Value = 72 },
                new FlatMidiEventGenerator.BendEvent { Tick = 785, Track = 0, Channel = info.SecondaryChannel, Value = 73 },
                new FlatMidiEventGenerator.BendEvent { Tick = 872, Track = 0, Channel = info.SecondaryChannel, Value = 74 },
                new FlatMidiEventGenerator.BendEvent { Tick = 959, Track = 0, Channel = info.SecondaryChannel, Value = 75 },

                // note itself
                new FlatMidiEventGenerator.NoteEvent { Tick = 0, Track = 0, Channel = info.SecondaryChannel, DynamicValue = note.Dynamic, Key = (byte) note.RealValue, Length = note.Beat.Duration.ToTicks() },
                
                // reset bend
                new FlatMidiEventGenerator.BendEvent { Tick = 960, Track = 0, Channel = info.PrimaryChannel, Value = 64 },
                new FlatMidiEventGenerator.NoteEvent { Tick = 960, Track = 0, Channel = info.PrimaryChannel, DynamicValue = note.Dynamic, Key = (byte) note.RealValue, Length = note.Beat.Duration.ToTicks() },

                // end of track
                new FlatMidiEventGenerator.TrackEndEvent { Tick = 3840, Track = 0 } // 3840 = end of bar
            };

            for (int i = 0; i < handler.MidiEvents.Count; i++)
            {
                Logger.Info("Test", $"i[{i}] {handler.MidiEvents[i]}");
                if (i < expectedEvents.Length)
                {
                    Assert.AreEqual(expectedEvents[i], handler.MidiEvents[i]);
                }
            }

            Assert.AreEqual(expectedEvents.Length, handler.MidiEvents.Count);
        }

        [TestMethod]
        public void TestGraceBeatGeneration()
        {
            var reader = new Gp7Importer();
            var buffer = TestPlatform.LoadFile("TestFiles/Audio/GraceBeats.gp");

            var settings = Settings.SongBook;
            reader.Init(ByteBuffer.FromBuffer(buffer), settings);
            var score = reader.ReadScore();

            var handler = new FlatMidiEventGenerator();
            var generator = new MidiFileGenerator(score, null, handler);
            generator.Generate();

            // on beat
            Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].AbsolutePlaybackStart);
            Assert.AreEqual(3840, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].PlaybackDuration);

            Assert.AreEqual(0 + 3840, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].AbsolutePlaybackStart);
            Assert.AreEqual(480, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].PlaybackDuration);

            Assert.AreEqual(0+ 3840 + 480, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].AbsolutePlaybackStart);
            Assert.AreEqual(3360, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].PlaybackDuration);

            // before beat
            Assert.AreEqual(0+3840+480+3360, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].AbsolutePlaybackStart);
            Assert.AreEqual(3360, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].PlaybackDuration);

            Assert.AreEqual(0 + 3840 + 480 + 3360 + 3360, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].AbsolutePlaybackStart);
            Assert.AreEqual(480, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].PlaybackDuration);

            Assert.AreEqual(0 + 3840 + 480 + 3360 + 3360 + 480, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[1].AbsolutePlaybackStart);
            Assert.AreEqual(3840, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[1].PlaybackDuration);

            // bend
            Assert.AreEqual(GraceType.BendGrace, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].GraceType);
            Assert.AreEqual(0 + 3840 + 480 + 3360 + 3360 + 480 + 3840, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].AbsolutePlaybackStart);
            Assert.AreEqual(480, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].PlaybackDuration);

            Assert.AreEqual(0 + 3840 + 480 + 3360 + 3360 + 480 + 3840 + 480, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[1].AbsolutePlaybackStart);
            Assert.AreEqual(3840 - 480, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[1].PlaybackDuration);

            var info = score.Tracks[0].PlaybackInfo;
            var expectedEvents = new FlatMidiEventGenerator.MidiEvent[]
            {
                // channel init
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.VolumeCoarse, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.PanCoarse, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.ExpressionControllerCoarse, Value = 127},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterCourse, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryCoarse, Value = 12},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.VolumeCoarse, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.PanCoarse, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.ExpressionControllerCoarse, Value = 127},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterCourse, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryCoarse, Value = 12},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.TimeSignatureEvent { Tick = 0, Numerator = 4, Denominator = 4 },
                new FlatMidiEventGenerator.TempoEvent { Tick = 0, Tempo = 120 },

                // on beat
                new FlatMidiEventGenerator.BendEvent { Tick = 0, Track = 0, Channel = info.PrimaryChannel, Value = 64 },
                new FlatMidiEventGenerator.NoteEvent { Tick = 0, Track = 0, Channel = info.PrimaryChannel, DynamicValue = DynamicValue.F, Key = (byte) 67, Length = 3840 },

                new FlatMidiEventGenerator.BendEvent { Tick = 3840, Track = 0, Channel = info.PrimaryChannel, Value = 64 }, 
                new FlatMidiEventGenerator.NoteEvent { Tick = 3840, Track = 0, Channel = info.PrimaryChannel, DynamicValue = DynamicValue.F, Key = (byte) 67, Length = 480 },

                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480, Track = 0, Channel = info.PrimaryChannel, Value = 64 },
                new FlatMidiEventGenerator.NoteEvent { Tick = 3840 + 480, Track = 0, Channel = info.PrimaryChannel, DynamicValue = DynamicValue.F, Key = (byte) 67, Length = 3360},
                

                // before beat
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360, Track = 0, Channel = info.PrimaryChannel, Value = 64 },
                new FlatMidiEventGenerator.NoteEvent { Tick = 3840 + 480 + 3360, Track = 0, Channel = info.PrimaryChannel, DynamicValue = DynamicValue.F, Key = (byte) 67, Length = 3360 },

                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360, Track = 0, Channel = info.PrimaryChannel, Value = 64 }, 
                new FlatMidiEventGenerator.NoteEvent { Tick = 3840 + 480 + 3360 + 3360, Track = 0, Channel = info.PrimaryChannel, DynamicValue = DynamicValue.F, Key = (byte) 67, Length = 480 },

                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480, Track = 0, Channel = info.PrimaryChannel, Value = 64 },
                new FlatMidiEventGenerator.NoteEvent { Tick = 3840 + 480 + 3360 + 3360 + 480, Track = 0, Channel = info.PrimaryChannel, DynamicValue = DynamicValue.F, Key = (byte) 67, Length = 3840},

                // bend beat
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840, Track = 0, Channel = info.SecondaryChannel, Value = 64},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 0, Track = 0, Channel = info.SecondaryChannel, Value = 64},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 1, Track = 0, Channel = info.SecondaryChannel, Value = 65},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 2, Track = 0, Channel = info.SecondaryChannel, Value = 66},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 3, Track = 0, Channel = info.SecondaryChannel, Value = 67},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 4, Track = 0, Channel = info.SecondaryChannel, Value = 68},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 5, Track = 0, Channel = info.SecondaryChannel, Value = 69},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 6 + 1, Track = 0, Channel = info.SecondaryChannel, Value = 70},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 7 + 1, Track = 0, Channel = info.SecondaryChannel, Value = 71},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 8 + 1, Track = 0, Channel = info.SecondaryChannel, Value = 72},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 9 + 1, Track = 0, Channel = info.SecondaryChannel, Value = 73},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 10 + 1, Track = 0, Channel = info.SecondaryChannel, Value = 74},
                new FlatMidiEventGenerator.BendEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840 + 2560 + 58 * 11 + 2, Track = 0, Channel = info.SecondaryChannel, Value = 75},
                new FlatMidiEventGenerator.NoteEvent { Tick = 3840 + 480 + 3360 + 3360 + 480 + 3840, Track = 0, Channel = info.SecondaryChannel, Length = 3840, Key = 67, DynamicValue = DynamicValue.F},

                // end of track
                new FlatMidiEventGenerator.TrackEndEvent { Tick = 19200, Track = 0 } // 3840 = end of bar
            };

            for (int i = 0; i < handler.MidiEvents.Count; i++)
            {
                Logger.Info("Test", $"i[{i}] {handler.MidiEvents[i]}");
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
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices.Count);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes.Count);

            var handler = new FlatMidiEventGenerator();
            var generator = new MidiFileGenerator(score, null, handler);
            generator.Generate();

            var info = score.Tracks[0].PlaybackInfo;
            var note = score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0];

            var expectedEvents = new FlatMidiEventGenerator.MidiEvent[]
            {
                // channel init
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.VolumeCoarse, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.PanCoarse, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.ExpressionControllerCoarse, Value = 127},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterCourse, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryCoarse, Value = 12},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.PrimaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.VolumeCoarse, Value = 120},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.PanCoarse, Value = 64},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.ExpressionControllerCoarse, Value = 127},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.RegisteredParameterCourse, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryFine, Value = 0},
                new FlatMidiEventGenerator.ControlChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Controller = (byte) ControllerTypeEnum.DataEntryCoarse, Value = 12},
                new FlatMidiEventGenerator.ProgramChangeEvent { Tick = 0, Track = 0, Channel=info.SecondaryChannel, Program = (byte) info.Program },

                new FlatMidiEventGenerator.TimeSignatureEvent { Tick = 0, Numerator = 4, Denominator = 4 },
                new FlatMidiEventGenerator.TempoEvent { Tick = 0, Tempo = 120 },

                // bend effect 
                new FlatMidiEventGenerator.BendEvent { Tick = 0, Track = 0, Channel = info.SecondaryChannel, Value = 64 }, // no bend
                new FlatMidiEventGenerator.BendEvent { Tick = 0, Track = 0, Channel = info.SecondaryChannel, Value = 64 },
                new FlatMidiEventGenerator.BendEvent { Tick = 43, Track = 0, Channel = info.SecondaryChannel, Value = 65 },
                new FlatMidiEventGenerator.BendEvent { Tick = 87, Track = 0, Channel = info.SecondaryChannel, Value = 66 },
                new FlatMidiEventGenerator.BendEvent { Tick = 130, Track = 0, Channel = info.SecondaryChannel, Value = 67 },
                new FlatMidiEventGenerator.BendEvent { Tick = 174, Track = 0, Channel = info.SecondaryChannel, Value = 68 },
                new FlatMidiEventGenerator.BendEvent { Tick = 218, Track = 0, Channel = info.SecondaryChannel, Value = 69 },
                new FlatMidiEventGenerator.BendEvent { Tick = 261, Track = 0, Channel = info.SecondaryChannel, Value = 70 },
                new FlatMidiEventGenerator.BendEvent { Tick = 305, Track = 0, Channel = info.SecondaryChannel, Value = 71 },
                new FlatMidiEventGenerator.BendEvent { Tick = 349, Track = 0, Channel = info.SecondaryChannel, Value = 72 },
                new FlatMidiEventGenerator.BendEvent { Tick = 392, Track = 0, Channel = info.SecondaryChannel, Value = 73 },
                new FlatMidiEventGenerator.BendEvent { Tick = 436, Track = 0, Channel = info.SecondaryChannel, Value = 74 },
                new FlatMidiEventGenerator.BendEvent { Tick = 479, Track = 0, Channel = info.SecondaryChannel, Value = 75 }, // full bend

                new FlatMidiEventGenerator.BendEvent { Tick = 480, Track = 0, Channel = info.SecondaryChannel, Value = 75 }, // full bend 
                new FlatMidiEventGenerator.BendEvent { Tick = 523, Track = 0, Channel = info.SecondaryChannel, Value = 74 },
                new FlatMidiEventGenerator.BendEvent { Tick = 567, Track = 0, Channel = info.SecondaryChannel, Value = 73 },
                new FlatMidiEventGenerator.BendEvent { Tick = 610, Track = 0, Channel = info.SecondaryChannel, Value = 72 },
                new FlatMidiEventGenerator.BendEvent { Tick = 654, Track = 0, Channel = info.SecondaryChannel, Value = 71 },
                new FlatMidiEventGenerator.BendEvent { Tick = 698, Track = 0, Channel = info.SecondaryChannel, Value = 70 },
                new FlatMidiEventGenerator.BendEvent { Tick = 741, Track = 0, Channel = info.SecondaryChannel, Value = 69 },
                new FlatMidiEventGenerator.BendEvent { Tick = 785, Track = 0, Channel = info.SecondaryChannel, Value = 68 },
                new FlatMidiEventGenerator.BendEvent { Tick = 829, Track = 0, Channel = info.SecondaryChannel, Value = 67 },
                new FlatMidiEventGenerator.BendEvent { Tick = 872, Track = 0, Channel = info.SecondaryChannel, Value = 66 },
                new FlatMidiEventGenerator.BendEvent { Tick = 916, Track = 0, Channel = info.SecondaryChannel, Value = 65 },
                new FlatMidiEventGenerator.BendEvent { Tick = 959, Track = 0, Channel = info.SecondaryChannel, Value = 64 }, // no bend 

                // note itself
                new FlatMidiEventGenerator.NoteEvent { Tick = 0, Track = 0, Channel = info.SecondaryChannel, DynamicValue = note.Dynamic, Key = (byte) note.RealValue, Length = note.Beat.Duration.ToTicks() },

                // reset bend
                new FlatMidiEventGenerator.BendEvent { Tick = 960, Track = 0, Channel = info.PrimaryChannel, Value = 64 }, // finish
                new FlatMidiEventGenerator.NoteEvent { Tick = 960, Track = 0, Channel = info.PrimaryChannel, DynamicValue = note.Dynamic, Key = (byte) note.RealValue, Length = note.Beat.Duration.ToTicks() },
                // end of track 
                new FlatMidiEventGenerator.TrackEndEvent { Tick = 3840, Track = 0 } // 3840 = end of bar
            };

            for (int i = 0; i < handler.MidiEvents.Count; i++)
            {
                Logger.Info("Test", $"i[{i}] {handler.MidiEvents[i]}");
                if (i < expectedEvents.Length)
                {
                    Assert.AreEqual(expectedEvents[i], handler.MidiEvents[i]);
                }
            }

            Assert.AreEqual(expectedEvents.Length, handler.MidiEvents.Count);
        }
    }
}
