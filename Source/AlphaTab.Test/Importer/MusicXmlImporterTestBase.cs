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
using AlphaTab.Rendering.Layout;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    public class MusicXmlImporterTestBase
    {
        internal MusicXmlImporter PrepareImporterWithBytes(byte[] buffer)
        {
            var readerBase = new MusicXmlImporter();
            readerBase.Init(ByteBuffer.FromBuffer(buffer), new Settings());
            return readerBase;
        }

        //        protected void TestReferenceFile(string file, Action<Score> done, string renderLayout = "page", bool renderAllTracks = false)
        //        {
        //            var gpxImporter = new GpxImporter();
        //            TestPlatform.LoadFile(file, fileData =>
        //            {
        //                var reference = TestPlatform.ChangeExtension(file, ".gpx");
        //                TestPlatform.LoadFile(reference, referenceData =>
        //                {
        //                    try
        //                    {
        //                        var importer = PrepareImporterWithBytes(fileData);
        //                        var score = importer.ReadScore();

        //#if !PHASE
        //                        if (renderAllTracks)
        //                        {
        //                            Render(score.Tracks.ToArray(), Path.ChangeExtension(file, ".all.png"), renderLayout);
        //                        }
        //                        else
        //                        {
        //                            foreach (var track in score.Tracks)
        //                            {
        //                                Render(new[] {track}, Path.ChangeExtension(file, "." + track.Index + ".png"),
        //                                    renderLayout);
        //                            }
        //                        }

        //                        if (!File.Exists(reference))
        //                        {
        //                            Assert.Inconclusive();
        //                        }
        //#endif

        //                        gpxImporter.Init(ByteBuffer.FromBuffer(referenceData));
        //                        var referenceScore = gpxImporter.ReadScore();
        //                        AreEqual(referenceScore, score);

        //                        done(score);
        //                        TestPlatform.Done();
        //                    }
        //                    catch (UnsupportedFormatException e)
        //                    {
        //                        Assert.Fail("Failed to load file {0}: {1}", file, e);
        //                        throw;
        //                    }
        //                }, false);
        //            }, false);
        //        }

        protected void TestReferenceFile(string file, Action<Score> done = null, LayoutMode renderLayout = LayoutMode.Page, bool renderAllTracks = false)
        {
            TestPlatform.LoadFile(file, fileData =>
            {
                try
                {
                    var importer = PrepareImporterWithBytes(fileData);
                    var score = importer.ReadScore();

#if !PHASE
                    if (renderAllTracks)
                    {
                        Render(score.Tracks.ToArray(), Path.ChangeExtension(file, ".all.png"), renderLayout);
                    }
                    else
                    {
                        foreach (var track in score.Tracks)
                        {
                            Render(new[] { track }, Path.ChangeExtension(file, "." + track.Index + ".png"),
                                renderLayout);
                        }
                    }

#endif
                    if (done != null)
                    {
                        done(score);
                    }
                    TestPlatform.Done();
                }
                catch (UnsupportedFormatException e)
                {
                    Assert.Fail("Failed to load file {0}: {1}", file, e);
                    throw;
                }
            }, false);
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
            Assert.AreEqual(expected.Album, actual.Album, "Mismatch on Album");
            Assert.AreEqual(expected.Artist, actual.Artist, "Mismatch on Artist");
            Assert.AreEqual(expected.Copyright, actual.Copyright, "Mismatch on Copyright");
            Assert.AreEqual(expected.Instructions, actual.Instructions, "Mismatch on Instructions");
            Assert.AreEqual(expected.Music, actual.Music, "Mismatch on Music");
            Assert.AreEqual(expected.Notices, actual.Notices, "Mismatch on Notices");
            Assert.AreEqual(expected.SubTitle, actual.SubTitle, "Mismatch on SubTitle");
            Assert.AreEqual(expected.Title, actual.Title, "Mismatch on Title");
            Assert.AreEqual(expected.Words, actual.Words, "Mismatch on Words");
            Assert.AreEqual(expected.Tab, actual.Tab, "Mismatch on Tab");
            Assert.AreEqual(expected.Tempo, actual.Tempo, "Mismatch on Tempo");
            Assert.AreEqual(expected.TempoLabel, actual.TempoLabel, "Mismatch on TempoLabel");
            Assert.AreEqual(expected.MasterBars.Count, actual.MasterBars.Count, "Mismatch on MasterBars.Count");
            for (var i = 0; i < expected.MasterBars.Count; i++)
            {
                AreEqual(expected.MasterBars[i], actual.MasterBars[i]);
            }

            Assert.AreEqual(expected.Tracks.Count, actual.Tracks.Count, "Mismatch on Tracks.Count");
            for (var i = 0; i < expected.Tracks.Count; i++)
            {
                AreEqual(expected.Tracks[i], actual.Tracks[i]);
            }
        }

        protected void AreEqual(Track expected, Track actual)
        {
            Assert.AreEqual(expected.Index, actual.Index, "Mismatch on Index");
            Assert.AreEqual(expected.Name, actual.Name, "Mismatch on Name");
            //Assert.AreEqual(expected.ShortName, actual.ShortName, "Mismatch on ShortName");
            //Assert.AreEqual(expected.Color.Raw, actual.Color.Raw, "Mismatch on Color.Raw");
            AreEqual(expected.PlaybackInfo, actual.PlaybackInfo);
            Assert.AreEqual(expected.Staves.Count, actual.Staves.Count, "Mismatch on Staves.Count");
            for (var i = 0; i < expected.Staves.Count; i++)
            {
                AreEqual(expected.Staves[i], actual.Staves[i]);
            }
        }

        protected void AreEqual(Staff expected, Staff actual)
        {
            Assert.AreEqual(expected.Capo, actual.Capo, "Mismatch on Capo");
            Assert.AreEqual(expected.IsPercussion, actual.IsPercussion, "Mismatch on IsPercussion");
            Assert.AreEqual(expected.ShowStandardNotation, actual.ShowStandardNotation, "Mismatch on ShowStandardNotation");
            Assert.AreEqual(expected.ShowTablature, actual.ShowTablature, "Mismatch on ShowTablature");
            Assert.AreEqual(string.Join(",", expected.Tuning), string.Join(",", actual.Tuning));
            Assert.AreEqual(expected.Tuning.Length, actual.Tuning.Length, "Mismatch on Tuning.Length");
            Assert.AreEqual(expected.Index, actual.Index, "Mismatch on Index");
            Assert.AreEqual(expected.Bars.Count, actual.Bars.Count, "Mismatch on Bars.Count");
            for (var i = 0; i < expected.Bars.Count; i++)
            {
                AreEqual(expected.Bars[i], actual.Bars[i]);
            }
        }

        protected void AreEqual(Bar expected, Bar actual)
        {
            Assert.AreEqual(expected.Index, actual.Index, "Mismatch on Index");
            Assert.AreEqual(expected.Clef, actual.Clef, "Mismatch on Clef");
            Assert.AreEqual(expected.ClefOttava, actual.ClefOttava, "Mismatch on ClefOttavia");
            //Assert.AreEqual(expected.Voices.Count, actual.Voices.Count, "Mismatch on Voices.Count");
            for (var i = 0; i < Math.Min(expected.Voices.Count, actual.Voices.Count); i++)
            {
                AreEqual(expected.Voices[i], actual.Voices[i]);
            }
        }

        protected void AreEqual(Voice expected, Voice actual)
        {
            Assert.AreEqual(expected.Index, actual.Index, "Mismatch on Index");
            Assert.AreEqual(expected.Beats.Count, actual.Beats.Count, "Mismatch on Beats.Count");
            for (var i = 0; i < expected.Beats.Count; i++)
            {
                AreEqual(expected.Beats[i], actual.Beats[i]);
            }
        }

        protected void AreEqual(Beat expected, Beat actual)
        {
            Assert.AreEqual(expected.Index, actual.Index, "Mismatch on Index");
            Assert.AreEqual(expected.IsEmpty, actual.IsEmpty, "Mismatch on IsEmpty");
            Assert.AreEqual(expected.IsRest, actual.IsRest, "Mismatch on IsRest");
            Assert.AreEqual(expected.Dots, actual.Dots, "Mismatch on Dots");
            Assert.AreEqual(expected.FadeIn, actual.FadeIn, "Mismatch on FadeIn");
            Assert.AreEqual(expected.IsLegatoOrigin, actual.IsLegatoOrigin, "Mismatch on IsLegatoOrigin");
            if (expected.Lyrics == null)
            {
                Assert.IsNull(actual.Lyrics);
            }
            else
            {
                Assert.AreEqual(string.Join(" ", expected.Lyrics), string.Join(" ", actual.Lyrics));
            }
            Assert.AreEqual(expected.Pop, actual.Pop, "Mismatch on Pop");
            Assert.AreEqual(expected.HasChord, actual.HasChord, "Mismatch on HasChord");
            Assert.AreEqual(expected.HasRasgueado, actual.HasRasgueado, "Mismatch on HasRasgueado");
            Assert.AreEqual(expected.Slap, actual.Tap);
            Assert.AreEqual(expected.Text, actual.Text, "Mismatch on Text");
            Assert.AreEqual(expected.BrushType, actual.BrushType, "Mismatch on BrushType");
            Assert.AreEqual(expected.BrushDuration, actual.BrushDuration, "Mismatch on BrushDuration");
            Assert.AreEqual(expected.TupletDenominator, actual.TupletDenominator, "Mismatch on TupletDenominator");
            Assert.AreEqual(expected.TupletNumerator, actual.TupletNumerator, "Mismatch on TupletNumerator");
            AreEqual(expected.WhammyBarPoints, actual.WhammyBarPoints);
            Assert.AreEqual(expected.Vibrato, actual.Vibrato, "Mismatch on Vibrato");
            if (expected.HasChord)
            {
                AreEqual(expected.Chord, actual.Chord);
            }
            Assert.AreEqual(expected.GraceType, actual.GraceType, "Mismatch on GraceType");
            Assert.AreEqual(expected.PickStroke, actual.PickStroke, "Mismatch on PickStroke");
            Assert.AreEqual(expected.TremoloSpeed, actual.TremoloSpeed, "Mismatch on TremoloSpeed");
            Assert.AreEqual(expected.Crescendo, actual.Crescendo, "Mismatch on Crescendo");
            Assert.AreEqual(expected.PlaybackStart, actual.PlaybackStart, "Mismatch on Start");
            Assert.AreEqual(expected.DisplayStart, actual.DisplayStart, "Mismatch on Start");
            //Assert.AreEqual(expected.Dynamic, actual.Dynamic, "Mismatch on Dynamic");
            Assert.AreEqual(expected.InvertBeamDirection, actual.InvertBeamDirection, "Mismatch on InvertBeamDirection");

            Assert.AreEqual(expected.Notes.Count, actual.Notes.Count, "Mismatch on Notes.Count");
            for (var i = 0; i < expected.Notes.Count; i++)
            {
                AreEqual(expected.Notes[i], actual.Notes[i]);
            }
        }

        protected void AreEqual(Note expected, Note actual)
        {
            Assert.AreEqual(expected.Index, actual.Index, "Mismatch on Index");
            Assert.AreEqual(expected.Accentuated, actual.Accentuated, "Mismatch on Accentuated");
            AreEqual(expected.BendPoints, actual.BendPoints);
            Assert.AreEqual(expected.IsStringed, actual.IsStringed, "Mismatch on IsStringed");
            if (actual.IsStringed)
            {
                Assert.AreEqual(expected.Fret, actual.Fret, "Mismatch on Fret");
                Assert.AreEqual(expected.String, actual.String, "Mismatch on String");
            }
            Assert.AreEqual(expected.IsPiano, actual.IsPiano, "Mismatch on IsPiano");
            if (actual.IsPiano)
            {
                Assert.AreEqual(expected.Octave, actual.Octave, "Mismatch on Octave");
                Assert.AreEqual(expected.Tone, actual.Tone, "Mismatch on Tone");
            }
            Assert.AreEqual(expected.Variation, actual.Variation, "Mismatch on Variation");
            Assert.AreEqual(expected.Element, actual.Element, "Mismatch on Element");
            Assert.AreEqual(expected.IsHammerPullOrigin, actual.IsHammerPullOrigin, "Mismatch on IsHammerPullOrigin");
            Assert.AreEqual(expected.HarmonicType, actual.HarmonicType, "Mismatch on HarmonicType");
            Assert.AreEqual(expected.HarmonicValue, actual.HarmonicValue, "Mismatch on HarmonicValue");
            Assert.AreEqual(expected.IsGhost, actual.IsGhost, "Mismatch on IsGhost");
            Assert.AreEqual(expected.IsLetRing, actual.IsLetRing, "Mismatch on IsLetRing");
            Assert.AreEqual(expected.IsPalmMute, actual.IsPalmMute, "Mismatch on IsPalmMute");
            Assert.AreEqual(expected.IsDead, actual.IsDead, "Mismatch on IsDead");
            Assert.AreEqual(expected.IsStaccato, actual.IsStaccato, "Mismatch on IsStaccato");
            Assert.AreEqual(expected.SlideType, actual.SlideType, "Mismatch on SlideType");
            Assert.AreEqual(expected.Vibrato, actual.Vibrato, "Mismatch on Vibrato");
            Assert.AreEqual(expected.IsTieDestination, actual.IsTieDestination, "Mismatch on IsTieDestination");
            Assert.AreEqual(expected.IsTieOrigin, actual.IsTieOrigin, "Mismatch on IsTieOrigin");
            Assert.AreEqual(expected.LeftHandFinger, actual.LeftHandFinger, "Mismatch on LeftHandFinger");
            Assert.AreEqual(expected.IsFingering, actual.IsFingering, "Mismatch on IsFingering");
            Assert.AreEqual(expected.TrillValue, actual.TrillValue, "Mismatch on TrillValue");
            Assert.AreEqual(expected.TrillSpeed, actual.TrillSpeed, "Mismatch on TrillSpeed");
            Assert.AreEqual(expected.DurationPercent, actual.DurationPercent, "Mismatch on DurationPercent");
            //Assert.AreEqual(expected.AccidentalMode, actual.AccidentalMode, "Mismatch on AccidentalMode");
            Assert.AreEqual(expected.Dynamics, actual.Dynamics, "Mismatch on Dynamic");
            Assert.AreEqual(expected.RealValue, actual.RealValue, "Mismatch on RealValue");
        }

        protected void AreEqual(Chord expected, Chord actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                //Assert.AreEqual(expected.Name, actual.Name, "Mismatch on Name");
            }
        }

        protected void AreEqual(FastList<BendPoint> expected, FastList<BendPoint> actual)
        {
            Assert.AreEqual(expected.Count, actual.Count, "Mismatch on Count");
            for (var i = 0; i < expected.Count; i++)
            {
                Assert.AreEqual(expected[i].Value, actual[i].Value);
                Assert.AreEqual(expected[i].Offset, actual[i].Offset);
            }
        }

        protected void AreEqual(PlaybackInformation expected, PlaybackInformation actual)
        {
            Assert.AreEqual(expected.Volume, actual.Volume, "Mismatch on Volume");
            Assert.AreEqual(expected.Balance, actual.Balance, "Mismatch on Balance");
            //Assert.AreEqual(expected.Port, actual.Port, "Mismatch on Port");
            Assert.AreEqual(expected.Program, actual.Program, "Mismatch on Program");
            //Assert.AreEqual(expected.PrimaryChannel, actual.PrimaryChannel, "Mismatch on PrimaryChannel");
            //Assert.AreEqual(expected.SecondaryChannel, actual.SecondaryChannel, "Mismatch on SecondaryChannel");
            Assert.AreEqual(expected.IsMute, actual.IsMute, "Mismatch on IsMute");
            Assert.AreEqual(expected.IsSolo, actual.IsSolo, "Mismatch on IsSolo");
        }

        protected void AreEqual(MasterBar expected, MasterBar actual)
        {
            Assert.AreEqual(expected.AlternateEndings, actual.AlternateEndings, "Mismatch on AlternateEndings");
            Assert.AreEqual(expected.Index, actual.Index, "Mismatch on Index");
            Assert.AreEqual(expected.KeySignature, actual.KeySignature, "Mismatch on KeySignature");
            Assert.AreEqual(expected.KeySignatureType, actual.KeySignatureType, "Mismatch on KeySignatureType");
            Assert.AreEqual(expected.IsDoubleBar, actual.IsDoubleBar, "Mismatch on IsDoubleBar");
            Assert.AreEqual(expected.IsRepeatStart, actual.IsRepeatStart, "Mismatch on IsRepeatStart");
            Assert.AreEqual(expected.RepeatCount, actual.RepeatCount, "Mismatch on RepeatCount");
            Assert.AreEqual(expected.TimeSignatureNumerator, actual.TimeSignatureNumerator, "Mismatch on TimeSignatureNumerator");
            Assert.AreEqual(expected.TimeSignatureDenominator, actual.TimeSignatureDenominator, "Mismatch on TimeSignatureDenominator");
            Assert.AreEqual(expected.TripletFeel, actual.TripletFeel, "Mismatch on TripletFeel");
            AreEqual(expected.Section, actual.Section);
            Assert.AreEqual(expected.Start, actual.Start, "Mismatch on Start");
        }

        protected void AreEqual(Section expected, Section actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                Assert.AreEqual(expected.Text, actual.Text, "Mismatch on Text");
                Assert.AreEqual(expected.Marker, actual.Marker, "Mismatch on Marker");
            }
        }

#if !PHASE
        protected void Render(Track[] tracks, string path, LayoutMode renderLayout)
        {
            var settings = new Settings();
            settings.Core.Engine = "gdi";
            settings.Display.LayoutMode = renderLayout;
            var renderer = new ScoreRenderer(settings);
            renderer.Width = 800;
            var images = new FastList<Image>();
            var totalWidth = 0;
            var totalHeight = 0;
            renderer.Error += (s, exception) =>
            {
                if (exception != null)
                {
                    throw exception;
                }
                else
                {
                    throw new Exception(s);
                }
            };
            renderer.PartialRenderFinished += r =>
            {
                images.Add((Image)r.RenderResult);
            };
            renderer.RenderFinished += r =>
            {
                totalWidth = (int)r.TotalWidth;
                totalHeight = (int)r.TotalHeight;
            };
            renderer.RenderScore(tracks[0].Score, tracks.Select(t => t.Index).ToArray());
            using (var bmp = new Bitmap(totalWidth, totalHeight))
            {
                var y = 0;
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
#endif
    }
}
