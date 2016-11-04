using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq.Expressions;
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
                        Console.WriteLine("{0} - Skipped", file);
                        continue;
                    }

                    gpxImporter.Init(ByteBuffer.FromBuffer(File.ReadAllBytes(reference)));
                    referenceScore = gpxImporter.ReadScore();

                    var buffer = Environment.FileLoaders["default"]().LoadBinary(file);
                    var importer = PrepareImporterWithBytes(buffer);
                    var score = importer.ReadScore();

                    AreEqual(referenceScore, score);

                    Console.WriteLine("{0} - OK", file);
                }
                catch (UnsupportedFormatException e)
                {
                    Assert.Fail("Failed to load file {0}: {1}", file, e);
                }
            }
        }

        [DebuggerStepThrough]
        private void AreEqual<T>(T expected, T actual, Expression<Func<T, object>> member)
        {
            var accessor = member.Compile();
            var expectedValue = accessor(expected);
            var actualValue = accessor(actual);
            var memberExpr = member.Body as MemberExpression;
            string propertyName = "";
            if (memberExpr != null)
            {
                propertyName = memberExpr.Member.Name;
            }
            else
            {
                var unary = member.Body as UnaryExpression;
                if (unary != null)
                {
                    memberExpr = unary.Operand as MemberExpression;
                    if (memberExpr != null)
                    {
                        propertyName = memberExpr.Member.Name;
                    }
                }
            }

            if (!Equals(expectedValue, actualValue))
            {
                var hierarchy = GetHierarchy(actual);
                Assert.Fail($"{propertyName} value differs on {hierarchy}. Actual<{actualValue}> Expected<{expectedValue}>");
            }
        }

        private string GetHierarchy(object node)
        {
            var note = node as Note;
            if (note != null)
            {
                return GetHierarchy(note.Beat) + "-" + note.Index;
            }
            
            var beat = node as Beat;
            if (beat != null)
            {
                return GetHierarchy(beat.Voice) + "-" + beat.Index;
            }
            
            var voice = node as Voice;
            if (voice != null)
            {
                return GetHierarchy(voice.Bar) + "-" + voice.Index;
            }
            
            var bar = node as Bar;
            if (bar != null)
            {
                return GetHierarchy(bar.Staff) + "-" + bar.Index;
            }       
                 
            var staff = node as Staff;
            if (staff != null)
            {
                return GetHierarchy(staff.Track) + "-" + staff.Index;
            }
            
            var track = node as Track;
            if (track != null)
            {
                return "Track:" + track.Index;
            }
            
            var mb = node as MasterBar;
            if (mb != null)
            {
                return "MasterBar:" + mb.Index;
            }

            var score = node as Score;
            if (score != null)
            {
                return "Score";
            }

            var playbackInformation = node as PlaybackInformation;
            if (playbackInformation != null)
            {
                return "PlaybackInformation";
            }

            Debug.Fail("Unknown type");
            return "";
        }

        private void AreEqual(Score expected, Score actual)
        {
            AreEqual(expected, actual, t => t.Album);
            AreEqual(expected, actual, t => t.Artist);
            AreEqual(expected, actual, t => t.Copyright);
            AreEqual(expected, actual, t => t.Instructions);
            AreEqual(expected, actual, t => t.Music);
            AreEqual(expected, actual, t => t.Notices);
            AreEqual(expected, actual, t => t.SubTitle);
            AreEqual(expected, actual, t => t.Title);
            AreEqual(expected, actual, t => t.Words);
            AreEqual(expected, actual, t => t.Tab);
            AreEqual(expected, actual, t => t.Tempo);
            AreEqual(expected, actual, t => t.TempoLabel);
            AreEqual(expected, actual, t => t.MasterBars.Count);
            for (int i = 0; i < expected.MasterBars.Count; i++)
            {
                AreEqual(expected.MasterBars[i], actual.MasterBars[i]);
            }

            AreEqual(expected, actual, t => t.Tracks.Count);
            for (int i = 0; i < expected.Tracks.Count; i++)
            {
                AreEqual(expected.Tracks[i], actual.Tracks[i]);
            }

        }

        private void AreEqual(Track expected, Track actual)
        {
            AreEqual(expected, actual, t => t.Capo);
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Name);
            //AreEqual(expected, actual, t => t.ShortName);
            AreEqual(expected, actual, t => t.Tuning.Length);
            Assert.AreEqual(string.Join(",", expected.Tuning), string.Join(",", actual.Tuning));
            AreEqual(expected, actual, t => t.Color.Raw);
            AreEqual(expected.PlaybackInfo, actual.PlaybackInfo);
            AreEqual(expected, actual, t => t.IsPercussion);
            AreEqual(expected, actual, t => t.Staves.Count);
            for (int i = 0; i < expected.Staves.Count; i++)
            {
                AreEqual(expected.Staves[i], actual.Staves[i]);
            }
        }

        private void AreEqual(Staff expected, Staff actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Bars.Count);
            for (int i = 0; i < expected.Bars.Count; i++)
            {
                AreEqual(expected.Bars[i], actual.Bars[i]);
            }
        }

        private void AreEqual(Bar expected, Bar actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Clef);
            //AreEqual(expected, actual, t => t.Voices.Count);
            for (int i = 0; i < Math.Min(expected.Voices.Count, actual.Voices.Count); i++)
            {
                AreEqual(expected.Voices[i], actual.Voices[i]);
            }
        }

        private void AreEqual(Voice expected, Voice actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Beats.Count);
            for (int i = 0; i < expected.Beats.Count; i++)
            {
                AreEqual(expected.Beats[i], actual.Beats[i]);
            }
        }

        private void AreEqual(Beat expected, Beat actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.IsEmpty);
            AreEqual(expected, actual, t => t.IsRest);
            AreEqual(expected, actual, t => t.Dots);
            AreEqual(expected, actual, t => t.FadeIn);
            Assert.AreEqual(string.Join(" ", expected.Lyrics), string.Join(" ", actual.Lyrics));
            AreEqual(expected, actual, t => t.Pop);
            AreEqual(expected, actual, t => t.HasChord);
            AreEqual(expected, actual, t => t.HasRasgueado);
            Assert.AreEqual(expected.Slap, actual.Tap);
            AreEqual(expected, actual, t => t.Text);
            AreEqual(expected, actual, t => t.BrushType);
            AreEqual(expected, actual, t => t.BrushDuration);
            AreEqual(expected, actual, t => t.TupletDenominator);
            AreEqual(expected, actual, t => t.TupletNumerator);
            AreEqual(expected.WhammyBarPoints, actual.WhammyBarPoints);
            AreEqual(expected, actual, t => t.Vibrato);
            if (expected.HasChord)
            {
                AreEqual(expected.Chord, actual.Chord);
            }
            AreEqual(expected, actual, t => t.GraceType);
            AreEqual(expected, actual, t => t.PickStroke);
            AreEqual(expected, actual, t => t.TremoloSpeed);
            AreEqual(expected, actual, t => t.Crescendo);
            AreEqual(expected, actual, t => t.Start);
            //AreEqual(expected, actual, t => t.Dynamic);
            AreEqual(expected, actual, t => t.InvertBeamDirection);

            AreEqual(expected, actual, t => t.Notes.Count);
            for (int i = 0; i < expected.Notes.Count; i++)
            {
                AreEqual(expected.Notes[i], actual.Notes[i]);
            }
        }

        private void AreEqual(Note expected, Note actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Accentuated);
            AreEqual(expected.BendPoints, actual.BendPoints);
            AreEqual(expected, actual, t => t.Fret);
            AreEqual(expected, actual, t => t.String);
            AreEqual(expected, actual, t => t.Octave);
            AreEqual(expected, actual, t => t.Tone);
            Assert.AreEqual(expected.Element, actual.Variation);
            AreEqual(expected, actual, t => t.IsHammerPullOrigin);
            AreEqual(expected, actual, t => t.HarmonicType);
            AreEqual(expected, actual, t => t.HarmonicValue);
            AreEqual(expected, actual, t => t.IsGhost);
            AreEqual(expected, actual, t => t.IsLetRing);
            AreEqual(expected, actual, t => t.IsPalmMute);
            AreEqual(expected, actual, t => t.IsDead);
            AreEqual(expected, actual, t => t.IsStaccato);
            AreEqual(expected, actual, t => t.SlideType);
            AreEqual(expected, actual, t => t.Vibrato);
            AreEqual(expected, actual, t => t.IsTieDestination);
            AreEqual(expected, actual, t => t.IsTieOrigin);
            AreEqual(expected, actual, t => t.LeftHandFinger);
            AreEqual(expected, actual, t => t.IsFingering);
            AreEqual(expected, actual, t => t.TrillValue);
            AreEqual(expected, actual, t => t.TrillSpeed);
            AreEqual(expected, actual, t => t.DurationPercent);
            AreEqual(expected, actual, t => t.AccidentalMode);
            AreEqual(expected, actual, t => t.Dynamic);
            AreEqual(expected, actual, t => t.RealValue);
        }

        private void AreEqual(Chord expected, Chord actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                AreEqual(expected, actual, t => t.Name);
            }
        }

        private void AreEqual(FastList<BendPoint> expected, FastList<BendPoint> actual)
        {
            AreEqual(expected, actual, t => t.Count);
            for (int i = 0; i < expected.Count; i++)
            {
                Assert.AreEqual(expected[i].Value, actual[i].Value);
                Assert.AreEqual(expected[i].Offset, actual[i].Offset);
            }
        }

        private void AreEqual(PlaybackInformation expected, PlaybackInformation actual)
        {
            AreEqual(expected, actual, t => t.Volume);
            AreEqual(expected, actual, t => t.Balance);
            //AreEqual(expected, actual, t => t.Port);
            AreEqual(expected, actual, t => t.Program);
            //AreEqual(expected, actual, t => t.PrimaryChannel);
            //AreEqual(expected, actual, t => t.SecondaryChannel);
            AreEqual(expected, actual, t => t.IsMute);
            AreEqual(expected, actual, t => t.IsSolo);
        }

        private void AreEqual(MasterBar expected, MasterBar actual)
        {
            AreEqual(expected, actual, t => t.AlternateEndings);
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.KeySignature);
            AreEqual(expected, actual, t => t.KeySignatureType);
            AreEqual(expected, actual, t => t.IsDoubleBar);
            AreEqual(expected, actual, t => t.IsRepeatStart);
            AreEqual(expected, actual, t => t.RepeatCount);
            AreEqual(expected, actual, t => t.TimeSignatureNumerator);
            AreEqual(expected, actual, t => t.TimeSignatureDenominator);
            AreEqual(expected, actual, t => t.TripletFeel);
            AreEqual(expected.Section, actual.Section);
            AreEqual(expected, actual, t => t.Start);
        }

        private void AreEqual(Section expected, Section actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                AreEqual(expected, actual, t => t.Text);
                AreEqual(expected, actual, t => t.Marker);
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
