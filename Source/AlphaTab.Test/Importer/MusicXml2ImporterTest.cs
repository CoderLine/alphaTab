using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using AlphaTab.Collections;
using AlphaTab.Exporter;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class MusicXml2ImporterTest
    {
        internal MusicXml2Importer PrepareImporterWithFile(string name)
        {
            const string path = "TestFiles/MusicXml";
            var buffer = Environment.FileLoaders["default"]().LoadBinary(Path.Combine(path, name));
            return PrepareImporterWithBytes(buffer);
        }

        internal MusicXml2Importer PrepareImporterWithBytes(byte[] buffer)
        {
            var readerBase = new MusicXml2Importer();
            readerBase.Init(new StreamWrapper(new MemoryStream(buffer)));
            return readerBase;
        }

        [TestMethod]
        public void TestPitchesPitches()
        {
            var reader = PrepareImporterWithFile("01a-Pitches-Pitches.xml");
            var score = reader.ReadScore();

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(32, score.MasterBars.Count);
            Assert.AreEqual(32, score.Tracks[0].Staves[0].Bars.Count);

            // Bar 1
            var bar = score.Tracks[0].Staves[0].Bars[0];
            var masterBar = score.MasterBars[0];
            Assert.AreEqual(0, masterBar.KeySignature);
            Assert.AreEqual(4, masterBar.TimeSignatureDenominator);
            Assert.AreEqual(4, masterBar.TimeSignatureNumerator);
            Assert.AreEqual(Clef.G2, bar.Clef);
            Assert.AreEqual(1, bar.Voices.Count);
            Assert.AreEqual(4, bar.Voices[0].Beats.Count);
            Assert.AreEqual(Duration.Quarter, bar.Voices[0].Beats[0].Duration);
            Assert.AreEqual(1, bar.Voices[0].Beats[0].Notes.Count);
            Assert.AreEqual(31, bar.Voices[0].Beats[0].Notes[0].RealValue);
        }

        [TestMethod]
        public void TestRendering()
        {
            const string path = "TestFiles/MusicXml";
            var files = Directory.EnumerateFiles(path, "*.xml");
            Console.WriteLine(Path.GetFullPath(path));
            var gpxImporter = new GpxImporter();

            foreach (var file in files)
            {
                try
                {
                    var reference = Path.ChangeExtension(file, ".gpx");
                    Score referenceScore;
                    if (File.Exists(reference))
                    {
                        gpxImporter.Init(ByteBuffer.FromBuffer(File.ReadAllBytes(reference)));
                        referenceScore = gpxImporter.ReadScore();
                    }

                    var buffer = Environment.FileLoaders["default"]().LoadBinary(file);
                    var importer = PrepareImporterWithBytes(buffer);
                    var score = importer.ReadScore();
                    for (int i = 0; i < score.Tracks.Count; i++)
                    {
                        var track = score.Tracks[i];
                        var trackFile = Path.ChangeExtension(file, "." + i + ".png");
                        File.Delete(trackFile);
                        Render(track, trackFile);
                    }
                }
                catch (Exception e)
                {
                    Assert.Fail("Failed to render file {0}: {1}", file, e);
                }
            }
        }

        [TestMethod]
        public void TestReference()
        {
            const string path = "TestFiles/MusicXml";
            var files = Directory.EnumerateFiles(path, "*.xml");
            Console.WriteLine(Path.GetFullPath(path));
            var gpxImporter = new GpxImporter();

            foreach (var file in files)
            {
                try
                {
                    var reference = Path.ChangeExtension(file, ".gpx");
                    Score referenceScore;
                    if (!File.Exists(reference))
                    {
                        return;
                    }

                    gpxImporter.Init(ByteBuffer.FromBuffer(File.ReadAllBytes(reference)));
                    referenceScore = gpxImporter.ReadScore();

                    var buffer = Environment.FileLoaders["default"]().LoadBinary(file);
                    var importer = PrepareImporterWithBytes(buffer);
                    var score = importer.ReadScore();

                    AreEqual(referenceScore, score);
                }
                catch (UnsupportedFormatException e)
                {
                    Assert.Fail("Failed to load file {0}: {1}", file, e);
                }
            }
        }

        private void AreEqual(Score expected, Score actual)
        {
            Assert.AreEqual(expected.Album, actual.Album);
            Assert.AreEqual(expected.Artist, actual.Artist);
            Assert.AreEqual(expected.Copyright, actual.Copyright);
            Assert.AreEqual(expected.Instructions, actual.Instructions);
            Assert.AreEqual(expected.Music, actual.Music);
            Assert.AreEqual(expected.Notices, actual.Notices);
            Assert.AreEqual(expected.SubTitle, actual.SubTitle);
            Assert.AreEqual(expected.Title, actual.Title);
            Assert.AreEqual(expected.Words, actual.Words);
            Assert.AreEqual(expected.Tab, actual.Tab);
            Assert.AreEqual(expected.Tempo, actual.Tempo);
            Assert.AreEqual(expected.TempoLabel, actual.TempoLabel);
            Assert.AreEqual(expected.MasterBars.Count, actual.MasterBars.Count);
            for (int i = 0; i < expected.MasterBars.Count; i++)
            {
                AreEqual(expected.MasterBars[i], actual.MasterBars[i]);
            }

            Assert.AreEqual(expected.Tracks.Count, actual.Tracks.Count);
            for (int i = 0; i < expected.Tracks.Count; i++)
            {
                AreEqual(expected.Tracks[i], actual.Tracks[i]);
            }

        }

        private void AreEqual(Track expected, Track actual)
        {
            Assert.AreEqual(expected.Capo, actual.Capo);
            Assert.AreEqual(expected.Index, actual.Index);
            Assert.AreEqual(expected.Name, actual.Name);
            //Assert.AreEqual(expected.ShortName, actual.ShortName);
            Assert.AreEqual(expected.Tuning.Length, actual.Tuning.Length);
            Assert.AreEqual(string.Join(",", expected.Tuning), string.Join(",", actual.Tuning));
            Assert.AreEqual(expected.Color.Raw, actual.Color.Raw);
            AreEqual(expected.PlaybackInfo, actual.PlaybackInfo);
            Assert.AreEqual(expected.IsPercussion, actual.IsPercussion);
            Assert.AreEqual(expected.Staves.Count, actual.Staves.Count);
            for (int i = 0; i < expected.Staves.Count; i++)
            {
                AreEqual(expected.Staves[i], actual.Staves[i]);
            }
        }

        private void AreEqual(Staff expected, Staff actual)
        {
            Assert.AreEqual(expected.Index, actual.Index);
            Assert.AreEqual(expected.Bars.Count, actual.Bars.Count);
            for (int i = 0; i < expected.Bars.Count; i++)
            {
                AreEqual(expected.Bars[i], actual.Bars[i]);
            }
        }

        private void AreEqual(Bar expected, Bar actual)
        {
            Assert.AreEqual(expected.Index, actual.Index);
            Assert.AreEqual(expected.Clef, actual.Clef);
            //Assert.AreEqual(expected.Voices.Count, actual.Voices.Count);
            for (int i = 0; i < Math.Min(expected.Voices.Count, actual.Voices.Count); i++)
            {
                AreEqual(expected.Voices[i], actual.Voices[i]);
            }
        }

        private void AreEqual(Voice expected, Voice actual)
        {
            Assert.AreEqual(expected.Index, actual.Index);
            Assert.AreEqual(expected.Beats.Count, actual.Beats.Count);
            for (int i = 0; i < expected.Beats.Count; i++)
            {
                AreEqual(expected.Beats[i], actual.Beats[i]);
            }
        }

        private void AreEqual(Beat expected, Beat actual)
        {
            Assert.AreEqual(expected.Index, actual.Index);
            Assert.AreEqual(expected.IsEmpty, actual.IsEmpty);
            Assert.AreEqual(expected.IsRest, actual.IsRest);
            Assert.AreEqual(expected.Dots, actual.Dots);
            Assert.AreEqual(expected.FadeIn, actual.FadeIn);
            Assert.AreEqual(string.Join(" ", expected.Lyrics), string.Join(" ", actual.Lyrics));
            Assert.AreEqual(expected.Pop, actual.Pop);
            Assert.AreEqual(expected.HasChord, actual.HasChord);
            Assert.AreEqual(expected.HasRasgueado, actual.HasRasgueado);
            Assert.AreEqual(expected.Slap, actual.Tap);
            Assert.AreEqual(expected.Text, actual.Text);
            Assert.AreEqual(expected.BrushType, actual.BrushType);
            Assert.AreEqual(expected.BrushDuration, actual.BrushDuration);
            Assert.AreEqual(expected.TupletDenominator, actual.TupletDenominator);
            Assert.AreEqual(expected.TupletNumerator, actual.TupletNumerator);
            AreEqual(expected.WhammyBarPoints, actual.WhammyBarPoints);
            Assert.AreEqual(expected.Vibrato, actual.Vibrato);
            if (expected.HasChord)
            {
                AreEqual(expected.Chord, actual.Chord);
            }
            Assert.AreEqual(expected.GraceType, actual.GraceType);
            Assert.AreEqual(expected.PickStroke, actual.PickStroke);
            Assert.AreEqual(expected.TremoloSpeed, actual.TremoloSpeed);
            Assert.AreEqual(expected.Crescendo, actual.Crescendo);
            Assert.AreEqual(expected.Start, actual.Start);
            //Assert.AreEqual(expected.Dynamic, actual.Dynamic);
            Assert.AreEqual(expected.InvertBeamDirection, actual.InvertBeamDirection);

            Assert.AreEqual(expected.Notes.Count, actual.Notes.Count);
            for (int i = 0; i < expected.Notes.Count; i++)
            {
                AreEqual(expected.Notes[i], actual.Notes[i]);
            }
        }

        private void AreEqual(Note expected, Note actual)
        {
            Assert.AreEqual(expected.Index, actual.Index);
            Assert.AreEqual(expected.Accentuated, actual.Accentuated);
            AreEqual(expected.BendPoints, actual.BendPoints);
            Assert.AreEqual(expected.Fret, actual.Fret);
            Assert.AreEqual(expected.String, actual.String);
            Assert.AreEqual(expected.Octave, actual.Octave);
            Assert.AreEqual(expected.Tone, actual.Tone);
            Assert.AreEqual(expected.Element, actual.Variation);
            Assert.AreEqual(expected.IsHammerPullOrigin, actual.IsHammerPullOrigin);
            Assert.AreEqual(expected.HarmonicType, actual.HarmonicType);
            Assert.AreEqual(expected.HarmonicValue, actual.HarmonicValue);
            Assert.AreEqual(expected.IsGhost, actual.IsGhost);
            Assert.AreEqual(expected.IsLetRing, actual.IsLetRing);
            Assert.AreEqual(expected.IsPalmMute, actual.IsPalmMute);
            Assert.AreEqual(expected.IsDead, actual.IsDead);
            Assert.AreEqual(expected.IsStaccato, actual.IsStaccato);
            Assert.AreEqual(expected.SlideType, actual.SlideType);
            Assert.AreEqual(expected.Vibrato, actual.Vibrato);
            Assert.AreEqual(expected.IsTieDestination, actual.IsTieDestination);
            Assert.AreEqual(expected.IsTieOrigin, actual.IsTieOrigin);
            Assert.AreEqual(expected.LeftHandFinger, actual.LeftHandFinger);
            Assert.AreEqual(expected.IsFingering, actual.IsFingering);
            Assert.AreEqual(expected.TrillValue, actual.TrillValue);
            Assert.AreEqual(expected.TrillSpeed, actual.TrillSpeed);
            Assert.AreEqual(expected.DurationPercent, actual.DurationPercent);
            Assert.AreEqual(expected.AccidentalMode, actual.AccidentalMode);
            Assert.AreEqual(expected.Dynamic, actual.Dynamic);
            Assert.AreEqual(expected.RealValue, actual.RealValue);
        }

        private void AreEqual(Chord expected, Chord actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                Assert.AreEqual(expected.Name, actual.Name);
            }
        }

        private void AreEqual(FastList<BendPoint> expected, FastList<BendPoint> actual)
        {
            Assert.AreEqual(expected.Count, actual.Count);
            for (int i = 0; i < expected.Count; i++)
            {
                Assert.AreEqual(expected[i].Value, actual[i].Value);
                Assert.AreEqual(expected[i].Offset, actual[i].Offset);
            }
        }

        private void AreEqual(PlaybackInformation expected, PlaybackInformation actual)
        {
            Assert.AreEqual(expected.Volume, actual.Volume);
            Assert.AreEqual(expected.Balance, actual.Balance);
            //Assert.AreEqual(expected.Port, actual.Port);
            Assert.AreEqual(expected.Program, actual.Program);
            //Assert.AreEqual(expected.PrimaryChannel, actual.PrimaryChannel);
            //Assert.AreEqual(expected.SecondaryChannel, actual.SecondaryChannel);
            Assert.AreEqual(expected.IsMute, actual.IsMute);
            Assert.AreEqual(expected.IsSolo, actual.IsSolo);
        }

        private void AreEqual(MasterBar expected, MasterBar actual)
        {
            Assert.AreEqual(expected.AlternateEndings, actual.AlternateEndings);
            Assert.AreEqual(expected.Index, actual.Index);
            Assert.AreEqual(expected.KeySignature, actual.KeySignature);
            Assert.AreEqual(expected.KeySignatureType, actual.KeySignatureType);
            Assert.AreEqual(expected.IsDoubleBar, actual.IsDoubleBar);
            Assert.AreEqual(expected.IsRepeatStart, actual.IsRepeatStart);
            Assert.AreEqual(expected.RepeatCount, actual.RepeatCount);
            Assert.AreEqual(expected.TimeSignatureNumerator, actual.TimeSignatureNumerator);
            Assert.AreEqual(expected.TimeSignatureDenominator, actual.TimeSignatureDenominator);
            Assert.AreEqual(expected.TripletFeel, actual.TripletFeel);
            AreEqual(expected.Section, actual.Section);
            Assert.AreEqual(expected.Start, actual.Start);
        }

        private void AreEqual(Section expected, Section actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                Assert.AreEqual(expected.Text, actual.Text);
                Assert.AreEqual(expected.Marker, actual.Marker);
            }
        }

        private void Render(Track track, string path)
        {
            var settings = Settings.Defaults;
            settings.Engine = "gdi";
            var renderer = new ScoreRenderer(settings);
            var images = new List<Image>();
            var totalWidth = 0;
            var totalHeight = 0;
            renderer.PartialRenderFinished += r =>
            {
                images.Add((Image)r.RenderResult);
            };
            renderer.RenderFinished += r =>
            {
                totalWidth = (int)r.TotalWidth;
                totalHeight = (int)r.TotalHeight;
            };
            renderer.Render(track);
            using (var bmp = new Bitmap(totalWidth, totalHeight))
            {
                int y = 0;
                using (var g = Graphics.FromImage(bmp))
                {
                    g.Clear(Color.White);
                    foreach (var image in images)
                    {
                        g.DrawImage(image, new Rectangle(0, y, image.Width, image.Height),
                            new Rectangle(0, 0, image.Width, image.Height), GraphicsUnit.Pixel);
                        y += image.Height;
                    }
                }
                bmp.Save(path, ImageFormat.Png);
            }
        }
    }
}
