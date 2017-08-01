using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    public class MusicXmlImporterTestBase
    {
        protected MusicXmlImporter PrepareImporterWithBytes(byte[] buffer)
        {
            var readerBase = new MusicXmlImporter();
            readerBase.Init(ByteBuffer.FromBuffer(buffer));
            return readerBase;
        }

        protected Score TestReferenceFile(string file, string renderLayout = "page", bool renderAllTracks = false)
        {
            var gpxImporter = new GpxImporter();
            var sw = new Stopwatch();

            try
            {
                sw.Restart();
                var buffer = File.ReadAllBytes(file);
                var importer = PrepareImporterWithBytes(buffer);
                var score = importer.ReadScore();
                sw.Stop();

                if (renderAllTracks)
                {
                    Render(score.Tracks.ToArray(), Path.ChangeExtension(file, ".all.png"), renderLayout);
                }
                else
                {
                    foreach (var track in score.Tracks)
                    {
                        Render(new[] { track }, Path.ChangeExtension(file, "." + track.Index + ".png"), renderLayout);
                    }
                }


                var reference = Path.ChangeExtension(file, ".gpx");
                Score referenceScore;
                if (!File.Exists(reference))
                {
                    Assert.Inconclusive();
                }

                gpxImporter.Init(ByteBuffer.FromBuffer(File.ReadAllBytes(reference)));
                referenceScore = gpxImporter.ReadScore();
                AreEqual(referenceScore, score);

                return score;
            }
            catch (UnsupportedFormatException e)
            {
                Assert.Fail("Failed to load file {0}: {1}", file, e);
                throw;
            }
        }

        [DebuggerStepThrough]
        protected void AreEqual<T>(T expected, T actual, Expression<Func<T, object>> member)
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

        protected string GetHierarchy(object node)
        {
            var note = node as Note;
            if (note != null)
            {
                return GetHierarchy(note.Beat) + "Note[" + note.Index + "]";
            }

            var beat = node as Beat;
            if (beat != null)
            {
                return GetHierarchy(beat.Voice) + "Beat[" + beat.Index + "]";
            }

            var voice = node as Voice;
            if (voice != null)
            {
                return GetHierarchy(voice.Bar) + "Voice[" + voice.Index + "]";
            }

            var bar = node as Bar;
            if (bar != null)
            {
                return GetHierarchy(bar.Staff) + "Bar[" + bar.Index + "]";
            }

            var staff = node as Staff;
            if (staff != null)
            {
                return GetHierarchy(staff.Track) + "Staff[" + staff.Index + "]";
            }

            var track = node as Track;
            if (track != null)
            {
                return "Track[" + track.Index + "]";
            }

            var mb = node as MasterBar;
            if (mb != null)
            {
                return "MasterBar[" + mb.Index + "]";
            }

            return node.GetType().Name;
        }

        protected void AreEqual(Score expected, Score actual)
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

        protected void AreEqual(Track expected, Track actual)
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

        protected void AreEqual(Staff expected, Staff actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Bars.Count);
            for (int i = 0; i < expected.Bars.Count; i++)
            {
                AreEqual(expected.Bars[i], actual.Bars[i]);
            }
        }

        protected void AreEqual(Bar expected, Bar actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Clef);
            AreEqual(expected, actual, t => t.ClefOttavia);
            //AreEqual(expected, actual, t => t.Voices.Count);
            for (int i = 0; i < Math.Min(expected.Voices.Count, actual.Voices.Count); i++)
            {
                AreEqual(expected.Voices[i], actual.Voices[i]);
            }
        }

        protected void AreEqual(Voice expected, Voice actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Beats.Count);
            for (int i = 0; i < expected.Beats.Count; i++)
            {
                AreEqual(expected.Beats[i], actual.Beats[i]);
            }
        }

        protected void AreEqual(Beat expected, Beat actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.IsEmpty);
            AreEqual(expected, actual, t => t.IsRest);
            AreEqual(expected, actual, t => t.Dots);
            AreEqual(expected, actual, t => t.FadeIn);
            AreEqual(expected, actual, t => t.IsLegatoOrigin);
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

        protected void AreEqual(Note expected, Note actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Accentuated);
            AreEqual(expected.BendPoints, actual.BendPoints);
            AreEqual(expected, actual, t => t.IsStringed);
            if (actual.IsStringed)
            {
                AreEqual(expected, actual, t => t.Fret);
                AreEqual(expected, actual, t => t.String);
            }
            AreEqual(expected, actual, t => t.IsPiano);
            if (actual.IsPiano)
            {
                AreEqual(expected, actual, t => t.Octave);
                AreEqual(expected, actual, t => t.Tone);
            }
            AreEqual(expected, actual, t => t.Variation);
            AreEqual(expected, actual, t => t.Element);
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
            //AreEqual(expected, actual, t => t.AccidentalMode);
            AreEqual(expected, actual, t => t.Dynamic);
            AreEqual(expected, actual, t => t.RealValue);
        }

        protected void AreEqual(Chord expected, Chord actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                //AreEqual(expected, actual, t => t.Name);
            }
        }

        protected void AreEqual(FastList<BendPoint> expected, FastList<BendPoint> actual)
        {
            AreEqual(expected, actual, t => t.Count);
            for (int i = 0; i < expected.Count; i++)
            {
                Assert.AreEqual(expected[i].Value, actual[i].Value);
                Assert.AreEqual(expected[i].Offset, actual[i].Offset);
            }
        }

        protected void AreEqual(PlaybackInformation expected, PlaybackInformation actual)
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

        protected void AreEqual(MasterBar expected, MasterBar actual)
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

        protected void AreEqual(Section expected, Section actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                AreEqual(expected, actual, t => t.Text);
                AreEqual(expected, actual, t => t.Marker);
            }
        }

        protected void Render(Track[] tracks, string path, string renderLayout)
        {
            var settings = Settings.Defaults;
            settings.Engine = "gdi";
            settings.Layout = new LayoutSettings
            {
                Mode = renderLayout
            };
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
            renderer.Render(tracks[0].Score, tracks.Select(t => t.Index).ToArray());
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
