using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Effects;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Xml;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class AlphaTexImporterTest
    {
        private Score ParseTex(string tex)
        {
            var importer = new AlphaTexImporter();
            importer.Init(TestPlatform.CreateStringReader(tex), new Settings());
            return importer.ReadScore();
        }

        [TestMethod]
        public void EnsureMetadataParsing_Issue73()
        {
            var tex = @"\title Test
                        \words test
                        \music alphaTab
                        \copyright test
                        \tempo 200
                        \instrument 30
                        \capo 2
                        \tuning G3 D2 G2 B2 D3 A4
                        .
                        0.5.2 1.5.4 3.4.4 | 5.3.8 5.3.8 5.3.8 5.3.8 r.2";

            var score = ParseTex(tex);

            Assert.AreEqual("Test", score.Title);
            Assert.AreEqual("test", score.Words);
            Assert.AreEqual("alphaTab", score.Music);
            Assert.AreEqual("test", score.Copyright);
            Assert.AreEqual(200, score.Tempo);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(30, score.Tracks[0].PlaybackInfo.Program);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Capo);
            Assert.AreEqual("55,38,43,47,50,69", string.Join(",", score.Tracks[0].Staves[0].Tuning));

            Assert.AreEqual(2, score.MasterBars.Count);

            Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            {
                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes.Count);
                Assert.AreEqual(Duration.Half, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Duration);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].Fret);
                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes.Count);
                Assert.AreEqual(Duration.Quarter, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Duration);
                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].Fret);
                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Notes.Count);
                Assert.AreEqual(Duration.Quarter, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Duration);
                Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Notes[0].Fret);
                Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Notes[0].String);
            }

            Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats.Count);
            {
                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes.Count);
                Assert.AreEqual(Duration.Eighth, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Duration);
                Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].Fret);
                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Notes.Count);
                Assert.AreEqual(Duration.Eighth, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Duration);
                Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Notes[0].Fret);
                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2].Notes.Count);
                Assert.AreEqual(Duration.Eighth, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2].Duration);
                Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2].Notes[0].Fret);
                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[3].Notes.Count);
                Assert.AreEqual(Duration.Eighth, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[3].Duration);
                Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[3].Notes[0].Fret);
                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[3].Notes[0].String);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[4].Notes.Count);
                Assert.AreEqual(Duration.Half, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[4].Duration);
                Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[4].IsRest);
            }
        }


        [TestMethod]
        public void TestTuning()
        {
            var tex = @"\tuning E4 B3 G3 D3 A2 E2
                        .
                        0.5.1";

            var score = ParseTex(tex);

            Assert.AreEqual(string.Join(",", Tuning.GetDefaultTuningFor(6).Tunings),
                string.Join(",", score.Tracks[0].Staves[0].Tuning));
        }

        [TestMethod]
        public void DeadNotes1_Issue79()
        {
            var tex = @":4 x.3";

            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].Fret);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].IsDead);
        }

        [TestMethod]
        public void DeadNotes2_Issue79()
        {
            var tex = @":4 3.3{x}";

            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].Fret);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].IsDead);
        }

        [TestMethod]
        public void Trill_Issue79()
        {
            var tex = @":4 3.3{tr 5 16}";

            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].Fret);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].IsTrill);
            Assert.AreEqual(Duration.Sixteenth,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].TrillSpeed);
            Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].TrillFret);
        }

        [TestMethod]
        public void Tremolo_Issue79()
        {
            var tex = @":4 3.3{tr 5 16}";

            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].Fret);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].IsTrill);
            Assert.AreEqual(Duration.Sixteenth,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].TrillSpeed);
            Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].TrillFret);
        }

        [TestMethod]
        public void TremoloPicking_Issue79()
        {
            var tex = @":4 3.3{tp 16}";

            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].Fret);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].IsTremolo);
            Assert.AreEqual(Duration.Sixteenth,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].TremoloSpeed.Value);
        }

        [TestMethod]
        public void Hamonics_Issue79()
        {
            var tex = @":8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(HarmonicType.Natural,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].HarmonicType);
            Assert.AreEqual(HarmonicType.Artificial,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].HarmonicType);
            Assert.AreEqual(HarmonicType.Tap,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Notes[0].HarmonicType);
            Assert.AreEqual(HarmonicType.Pinch,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Notes[0].HarmonicType);
            Assert.AreEqual(HarmonicType.Semi,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[4].Notes[0].HarmonicType);
        }

        [TestMethod]
        public void HamonicsRenderingText_Issue79()
        {
            var tex = @":8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}";
            var score = ParseTex(tex);

            var settings = new Settings();
            settings.Core.Engine = "svg";
            settings.Display.StaveProfile = StaveProfile.ScoreTab;

            var renderer = new ScoreRenderer(settings);
            renderer.Width = 970;
            var svg = "";
            renderer.PartialRenderFinished += r =>
            {
                svg += r.RenderResult.ToString();
            };
            renderer.RenderScore(score,
                new[]
                {
                    0
                });

            var regexTemplate = @"<text[^>]+>\s*{0}\s*</text>";

            Assert.IsTrue(TestPlatform.IsMatch(svg,
                string.Format(regexTemplate, HarmonicsEffectInfo.HarmonicToString(HarmonicType.Natural))));
            Assert.IsTrue(TestPlatform.IsMatch(svg,
                string.Format(regexTemplate, HarmonicsEffectInfo.HarmonicToString(HarmonicType.Artificial))));
            Assert.IsTrue(TestPlatform.IsMatch(svg,
                string.Format(regexTemplate, HarmonicsEffectInfo.HarmonicToString(HarmonicType.Tap))));
            Assert.IsTrue(TestPlatform.IsMatch(svg,
                string.Format(regexTemplate, HarmonicsEffectInfo.HarmonicToString(HarmonicType.Pinch))));
            Assert.IsTrue(TestPlatform.IsMatch(svg,
                string.Format(regexTemplate, HarmonicsEffectInfo.HarmonicToString(HarmonicType.Semi))));
        }

        [TestMethod]
        public void Grace_Issue79()
        {
            var tex = @":8 3.3{gr} 3.3{gr ob}";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(GraceType.BeforeBeat, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].GraceType);
            Assert.AreEqual(GraceType.OnBeat, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].GraceType);
        }

        [TestMethod]
        public void TestLeftHandFingerSingleNote()
        {
            var tex = @":8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5}";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(Fingers.Thumb,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.IndexFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.MiddleFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.AnnularFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.LittleFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[4].Notes[0].LeftHandFinger);
        }

        [TestMethod]
        public void TestRightHandFingerSingleNote()
        {
            var tex = @":8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{rf 5}";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(Fingers.Thumb,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].RightHandFinger);
            Assert.AreEqual(Fingers.IndexFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].RightHandFinger);
            Assert.AreEqual(Fingers.MiddleFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Notes[0].RightHandFinger);
            Assert.AreEqual(Fingers.AnnularFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Notes[0].RightHandFinger);
            Assert.AreEqual(Fingers.LittleFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[4].Notes[0].RightHandFinger);
        }

        [TestMethod]
        public void TestLeftHandFingerChord()
        {
            var tex = @":8 (3.1{lf 1} 3.2{lf 2} 3.3{lf 3} 3.4{lf 4} 3.5{lf 5})";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes.Count);
            Assert.AreEqual(Fingers.Thumb,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.IndexFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[1].LeftHandFinger);
            Assert.AreEqual(Fingers.MiddleFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[2].LeftHandFinger);
            Assert.AreEqual(Fingers.AnnularFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[3].LeftHandFinger);
            Assert.AreEqual(Fingers.LittleFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[4].LeftHandFinger);
        }

        [TestMethod]
        public void TestRightHandFingerChord()
        {
            var tex = @":8 (3.1{rf 1} 3.2{rf 2} 3.3{rf 3} 3.4{rf 4} 3.5{rf 5})";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes.Count);
            Assert.AreEqual(Fingers.Thumb,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].RightHandFinger);
            Assert.AreEqual(Fingers.IndexFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[1].RightHandFinger);
            Assert.AreEqual(Fingers.MiddleFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[2].RightHandFinger);
            Assert.AreEqual(Fingers.AnnularFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[3].RightHandFinger);
            Assert.AreEqual(Fingers.LittleFinger,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[4].RightHandFinger);
        }


        [TestMethod]
        public void TestUnstringed()
        {
            var tex = @"\tuning piano . c4 c#4 d4 d#4 | c4 db4 d4 eb4";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(2, score.MasterBars.Count);

            Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats.Count);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].IsPiano);
            Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].RealValue);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].IsPiano);
            Assert.AreEqual(61, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].RealValue);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].IsPiano);
            Assert.AreEqual(62, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Notes[0].RealValue);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].IsPiano);
            Assert.AreEqual(63, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Notes[0].RealValue);


            Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats.Count);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].IsPiano);
            Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].RealValue);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].IsPiano);
            Assert.AreEqual(61, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Notes[0].RealValue);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].IsPiano);
            Assert.AreEqual(62, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2].Notes[0].RealValue);
            Assert.AreEqual(true, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].IsPiano);
            Assert.AreEqual(63, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[3].Notes[0].RealValue);
        }

        [TestMethod]
        public void TestMultiStaffDefaultSettings()
        {
            var tex = @"1.1 | 1.1 | \staff 2.1 | 2.1";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(2, score.MasterBars.Count);
            Assert.AreEqual(2, score.Tracks[0].Staves.Count);

            Assert.IsTrue(score.Tracks[0].Staves[0].ShowTablature);
            Assert.IsTrue(score.Tracks[0].Staves[0].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars.Count);

            Assert.IsTrue(score.Tracks[0].Staves[1].ShowTablature); // default settings used
            Assert.IsTrue(score.Tracks[0].Staves[1].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[1].Bars.Count);
        }

        [TestMethod]
        public void TestMultiStaffDefaultSettingsBraces()
        {
            var tex = @"1.1 | 1.1 | \staff{} 2.1 | 2.1";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(2, score.MasterBars.Count);
            Assert.AreEqual(2, score.Tracks[0].Staves.Count);

            Assert.IsTrue(score.Tracks[0].Staves[0].ShowTablature);
            Assert.IsTrue(score.Tracks[0].Staves[0].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars.Count);

            Assert.IsTrue(score.Tracks[0].Staves[1].ShowTablature); // default settings used
            Assert.IsTrue(score.Tracks[0].Staves[1].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[1].Bars.Count);
        }

        [TestMethod]
        public void TestSingleStaffWithSetting()
        {
            var tex = @"\staff{score} 1.1 | 1.1";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(2, score.MasterBars.Count);
            Assert.AreEqual(1, score.Tracks[0].Staves.Count);

            Assert.IsFalse(score.Tracks[0].Staves[0].ShowTablature);
            Assert.IsTrue(score.Tracks[0].Staves[0].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars.Count);
        }

        [TestMethod]
        public void TestMultiStaffWithSettings()
        {
            var tex = @"\staff{score} 1.1 | 1.1 |
                        \staff{tabs} \capo 2 2.1 | 2.1 |
                        \staff{score tabs} \tuning A1 D2 A2 D3 G3 B3 E4 3.1 | 3.1";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(2, score.MasterBars.Count);
            Assert.AreEqual(3, score.Tracks[0].Staves.Count);

            Assert.IsFalse(score.Tracks[0].Staves[0].ShowTablature);
            Assert.IsTrue(score.Tracks[0].Staves[0].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars.Count);

            Assert.IsTrue(score.Tracks[0].Staves[1].ShowTablature);
            Assert.IsFalse(score.Tracks[0].Staves[1].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[1].Bars.Count);
            Assert.AreEqual(2, score.Tracks[0].Staves[1].Capo);

            Assert.IsTrue(score.Tracks[0].Staves[2].ShowTablature);
            Assert.IsTrue(score.Tracks[0].Staves[2].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[2].Bars.Count);
            Assert.AreEqual(7, score.Tracks[0].Staves[2].Tuning.Length);
        }

        [TestMethod]
        public void TestMultiTrack()
        {
            var tex = @"\track ""First"" 1.1 | 1.1 | \track ""Second"" 2.2 | 2.2";
            var score = ParseTex(tex);

            Assert.AreEqual(2, score.Tracks.Count);
            Assert.AreEqual(2, score.MasterBars.Count);

            Assert.AreEqual(1, score.Tracks[0].Staves.Count);
            Assert.AreEqual("First", score.Tracks[0].Name);
            Assert.AreEqual(0, score.Tracks[0].PlaybackInfo.PrimaryChannel);
            Assert.AreEqual(1, score.Tracks[0].PlaybackInfo.SecondaryChannel);
            Assert.IsTrue(score.Tracks[0].Staves[0].ShowTablature);
            Assert.IsTrue(score.Tracks[0].Staves[0].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars.Count);

            Assert.AreEqual(1, score.Tracks[1].Staves.Count);
            Assert.AreEqual("Second", score.Tracks[1].Name);
            Assert.AreEqual(2, score.Tracks[1].PlaybackInfo.PrimaryChannel);
            Assert.AreEqual(3, score.Tracks[1].PlaybackInfo.SecondaryChannel);
            Assert.IsTrue(score.Tracks[1].Staves[0].ShowTablature);
            Assert.IsTrue(score.Tracks[1].Staves[0].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[1].Staves[0].Bars.Count);
        }

        [TestMethod]
        public void TestMultiTrackNames()
        {
            var tex =
                @"\track 1.1 | 1.1 | \track ""Only Long Name"" 2.2 | 2.2 | \track ""Very Long Name"" ""shrt"" 3.3 | 3.3 ";
            var score = ParseTex(tex);

            Assert.AreEqual(3, score.Tracks.Count);
            Assert.AreEqual(2, score.MasterBars.Count);

            Assert.AreEqual(1, score.Tracks[0].Staves.Count);
            Assert.AreEqual("", score.Tracks[0].Name);
            Assert.AreEqual("", score.Tracks[0].ShortName);
            Assert.AreEqual(0, score.Tracks[0].PlaybackInfo.PrimaryChannel);
            Assert.AreEqual(1, score.Tracks[0].PlaybackInfo.SecondaryChannel);
            Assert.IsTrue(score.Tracks[0].Staves[0].ShowTablature);
            Assert.IsTrue(score.Tracks[0].Staves[0].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars.Count);

            Assert.AreEqual(1, score.Tracks[1].Staves.Count);
            Assert.AreEqual("Only Long Name", score.Tracks[1].Name);
            Assert.AreEqual("Only Long ", score.Tracks[1].ShortName);
            Assert.AreEqual(2, score.Tracks[1].PlaybackInfo.PrimaryChannel);
            Assert.AreEqual(3, score.Tracks[1].PlaybackInfo.SecondaryChannel);
            Assert.IsTrue(score.Tracks[1].Staves[0].ShowTablature);
            Assert.IsTrue(score.Tracks[1].Staves[0].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[1].Staves[0].Bars.Count);

            Assert.AreEqual(1, score.Tracks[2].Staves.Count);
            Assert.AreEqual("Very Long Name", score.Tracks[2].Name);
            Assert.AreEqual("shrt", score.Tracks[2].ShortName);
            Assert.AreEqual(4, score.Tracks[2].PlaybackInfo.PrimaryChannel);
            Assert.AreEqual(5, score.Tracks[2].PlaybackInfo.SecondaryChannel);
            Assert.IsTrue(score.Tracks[2].Staves[0].ShowTablature);
            Assert.IsTrue(score.Tracks[2].Staves[0].ShowStandardNotation);
            Assert.AreEqual(2, score.Tracks[2].Staves[0].Bars.Count);
        }

        [TestMethod]
        public void TestMultiTrackMultiStaff()
        {
            var tex =
                @"\track ""Piano""
                \staff{score} \tuning piano \instrument acousticgrandpiano
                c4 d4 e4 f4 |

                \staff{score} \tuning piano \clef F4
                c2 c2 c2 c2 |

              \track ""Guitar""
                \staff{tabs}
                1.2 3.2 0.1 1.1 |

              \track ""Second Guitar""
                1.2 3.2 0.1 1.1
            ";
            var score = ParseTex(tex);

            Assert.AreEqual(3, score.Tracks.Count);
            Assert.AreEqual(1, score.MasterBars.Count);

            {
                var track1 = score.Tracks[0];
                Assert.AreEqual("Piano", track1.Name);
                Assert.AreEqual(2, track1.Staves.Count);
                Assert.AreEqual(0, track1.PlaybackInfo.Program);
                Assert.AreEqual(0, track1.PlaybackInfo.PrimaryChannel);
                Assert.AreEqual(1, track1.PlaybackInfo.SecondaryChannel);

                {
                    var staff1 = track1.Staves[0];
                    Assert.IsFalse(staff1.ShowTablature);
                    Assert.IsTrue(staff1.ShowStandardNotation);
                    Assert.AreEqual(0, staff1.Tuning.Length);
                    Assert.AreEqual(1, staff1.Bars.Count);
                    Assert.AreEqual(Clef.G2, staff1.Bars[0].Clef);
                }

                {
                    var staff2 = track1.Staves[1];
                    Assert.IsFalse(staff2.ShowTablature);
                    Assert.IsTrue(staff2.ShowStandardNotation);
                    Assert.AreEqual(0, staff2.Tuning.Length);
                    Assert.AreEqual(1, staff2.Bars.Count);
                    Assert.AreEqual(Clef.F4, staff2.Bars[0].Clef);
                }
            }

            {
                var track2 = score.Tracks[1];
                Assert.AreEqual("Guitar", track2.Name);
                Assert.AreEqual(1, track2.Staves.Count);
                Assert.AreEqual(25, track2.PlaybackInfo.Program);
                Assert.AreEqual(2, track2.PlaybackInfo.PrimaryChannel);
                Assert.AreEqual(3, track2.PlaybackInfo.SecondaryChannel);

                {
                    var staff1 = track2.Staves[0];
                    Assert.IsTrue(staff1.ShowTablature);
                    Assert.IsFalse(staff1.ShowStandardNotation);
                    Assert.AreEqual(6, staff1.Tuning.Length);
                    Assert.AreEqual(1, staff1.Bars.Count);
                    Assert.AreEqual(Clef.G2, staff1.Bars[0].Clef);
                }
            }

            {
                var track3 = score.Tracks[2];
                Assert.AreEqual("Second Guitar", track3.Name);
                Assert.AreEqual(1, track3.Staves.Count);
                Assert.AreEqual(25, track3.PlaybackInfo.Program);
                Assert.AreEqual(4, track3.PlaybackInfo.PrimaryChannel);
                Assert.AreEqual(5, track3.PlaybackInfo.SecondaryChannel);

                {
                    var staff1 = track3.Staves[0];
                    Assert.IsTrue(staff1.ShowTablature);
                    Assert.IsTrue(staff1.ShowStandardNotation);
                    Assert.AreEqual(6, staff1.Tuning.Length);
                    Assert.AreEqual(1, staff1.Bars.Count);
                    Assert.AreEqual(Clef.G2, staff1.Bars[0].Clef);
                }
            }
        }

        [TestMethod]
        public void TestMultiTrackMultiStaffInconsistentBars()
        {
            var tex =
                @"\track ""Piano""
                \staff{score} \tuning piano \instrument acousticgrandpiano
                c4 d4 e4 f4 |

                \staff{score} \tuning piano \clef F4
                c2 c2 c2 c2 | c2 c2 c2 c2 | c2 c2 c2 c2 |

              \track ""Guitar""
                \staff{tabs}
                1.2 3.2 0.1 1.1 | 1.2 3.2 0.1 1.1 |

              \track ""Second Guitar""
                1.2 3.2 0.1 1.1
            ";
            var score = ParseTex(tex);

            Assert.AreEqual(3, score.Tracks.Count);
            Assert.AreEqual(3, score.MasterBars.Count);

            {
                var track1 = score.Tracks[0];
                Assert.AreEqual("Piano", track1.Name);
                Assert.AreEqual(2, track1.Staves.Count);
                Assert.AreEqual(0, track1.PlaybackInfo.Program);
                Assert.AreEqual(0, track1.PlaybackInfo.PrimaryChannel);
                Assert.AreEqual(1, track1.PlaybackInfo.SecondaryChannel);

                {
                    var staff1 = track1.Staves[0];
                    Assert.IsFalse(staff1.ShowTablature);
                    Assert.IsTrue(staff1.ShowStandardNotation);
                    Assert.AreEqual(0, staff1.Tuning.Length);
                    Assert.AreEqual(3, staff1.Bars.Count);
                    Assert.IsFalse(staff1.Bars[0].IsEmpty);
                    Assert.IsTrue(staff1.Bars[1].IsEmpty);
                    Assert.IsTrue(staff1.Bars[2].IsEmpty);
                    Assert.AreEqual(Clef.G2, staff1.Bars[0].Clef);
                }

                {
                    var staff2 = track1.Staves[1];
                    Assert.IsFalse(staff2.ShowTablature);
                    Assert.IsTrue(staff2.ShowStandardNotation);
                    Assert.AreEqual(0, staff2.Tuning.Length);
                    Assert.AreEqual(3, staff2.Bars.Count);
                    Assert.IsFalse(staff2.Bars[0].IsEmpty);
                    Assert.IsFalse(staff2.Bars[1].IsEmpty);
                    Assert.IsFalse(staff2.Bars[2].IsEmpty);
                    Assert.AreEqual(Clef.F4, staff2.Bars[0].Clef);
                }
            }

            {
                var track2 = score.Tracks[1];
                Assert.AreEqual("Guitar", track2.Name);
                Assert.AreEqual(1, track2.Staves.Count);
                Assert.AreEqual(25, track2.PlaybackInfo.Program);
                Assert.AreEqual(2, track2.PlaybackInfo.PrimaryChannel);
                Assert.AreEqual(3, track2.PlaybackInfo.SecondaryChannel);

                {
                    var staff1 = track2.Staves[0];
                    Assert.IsTrue(staff1.ShowTablature);
                    Assert.IsFalse(staff1.ShowStandardNotation);
                    Assert.AreEqual(6, staff1.Tuning.Length);
                    Assert.AreEqual(3, staff1.Bars.Count);
                    Assert.IsFalse(staff1.Bars[0].IsEmpty);
                    Assert.IsFalse(staff1.Bars[1].IsEmpty);
                    Assert.IsTrue(staff1.Bars[2].IsEmpty);

                    Assert.AreEqual(Clef.G2, staff1.Bars[0].Clef);
                }
            }

            {
                var track3 = score.Tracks[2];
                Assert.AreEqual("Second Guitar", track3.Name);
                Assert.AreEqual(1, track3.Staves.Count);
                Assert.AreEqual(25, track3.PlaybackInfo.Program);
                Assert.AreEqual(4, track3.PlaybackInfo.PrimaryChannel);
                Assert.AreEqual(5, track3.PlaybackInfo.SecondaryChannel);

                {
                    var staff1 = track3.Staves[0];
                    Assert.IsTrue(staff1.ShowTablature);
                    Assert.IsTrue(staff1.ShowStandardNotation);
                    Assert.AreEqual(6, staff1.Tuning.Length);
                    Assert.AreEqual(3, staff1.Bars.Count);
                    Assert.IsFalse(staff1.Bars[0].IsEmpty);
                    Assert.IsTrue(staff1.Bars[1].IsEmpty);
                    Assert.IsTrue(staff1.Bars[2].IsEmpty);
                    Assert.AreEqual(Clef.G2, staff1.Bars[0].Clef);
                }
            }
        }

        [TestMethod]
        public void TestSlides()
        {
            var tex = @"3.3{sl} 4.3 | 3.3{ss} 4.3 | 3.3{sib} 3.3{sia} 3.3{sou} 3.3{sod} | 3.3{psd} 3.3{psu}";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(4, score.MasterBars.Count);

            Assert.AreEqual(SlideType.Legato, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].SlideType);
            Assert.AreEqual(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].Id,
                score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].SlideTarget.Id);

            Assert.AreEqual(SlideType.Shift, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].SlideType);
            Assert.AreEqual(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Notes[0].Id,
                score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].SlideTarget.Id);

            Assert.AreEqual(SlideType.IntoFromBelow,
                score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Notes[0].SlideType);
            Assert.AreEqual(SlideType.IntoFromAbove,
                score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[1].Notes[0].SlideType);
            Assert.AreEqual(SlideType.OutUp, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[2].Notes[0].SlideType);
            Assert.AreEqual(SlideType.OutDown, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[3].Notes[0].SlideType);

            Assert.AreEqual(SlideType.PickSlideDown,
                score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].Notes[0].SlideType);
            Assert.AreEqual(SlideType.PickSlideUp,
                score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[1].Notes[0].SlideType);
        }

        [TestMethod]
        public void TestSection()
        {
            var tex = @"\section Intro 1.1 | 1.1 | \section ""Chorus 01"" 1.1 | \section S Solo";
            var score = ParseTex(tex);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(4, score.MasterBars.Count);

            Assert.IsTrue(score.MasterBars[0].IsSectionStart);
            Assert.AreEqual("Intro", score.MasterBars[0].Section.Text);
            Assert.AreEqual("", score.MasterBars[0].Section.Marker);

            Assert.IsFalse(score.MasterBars[1].IsSectionStart);

            Assert.IsTrue(score.MasterBars[2].IsSectionStart);
            Assert.AreEqual("Chorus 01", score.MasterBars[2].Section.Text);
            Assert.AreEqual("", score.MasterBars[2].Section.Marker);

            Assert.IsTrue(score.MasterBars[3].IsSectionStart);
            Assert.AreEqual("Solo", score.MasterBars[3].Section.Text);
            Assert.AreEqual("S", score.MasterBars[3].Section.Marker);
        }

        [TestMethod]
        public void TestPopSlapTap()
        {
            var tex = @"3.3{p} 3.3{s} 3.3{tt} r";
            var score = ParseTex(tex);

            Assert.IsTrue(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Pop, "Pop not set");
            Assert.IsTrue(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Slap, "Slap not set");
            Assert.IsTrue(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Tap, "Tap not set");
        }

        [TestMethod]
        public void TestTripletFeelNumeric()
        {
            var tex = @"\tf 0 | \tf 1 | \tf 2 | \tf 3 | \tf 4 | \tf 5 | \tf 6";
            var score = ParseTex(tex);

            Assert.AreEqual(TripletFeel.NoTripletFeel, score.MasterBars[0].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet16th, score.MasterBars[1].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet8th, score.MasterBars[2].TripletFeel);
            Assert.AreEqual(TripletFeel.Dotted16th, score.MasterBars[3].TripletFeel);
            Assert.AreEqual(TripletFeel.Dotted8th, score.MasterBars[4].TripletFeel);
            Assert.AreEqual(TripletFeel.Scottish16th, score.MasterBars[5].TripletFeel);
            Assert.AreEqual(TripletFeel.Scottish8th, score.MasterBars[6].TripletFeel);
        }

        [TestMethod]
        public void TestTripletFeelLongNames()
        {
            var tex =
                @"\tf none | \tf triplet-16th | \tf triplet-8th | \tf dotted-16th | \tf dotted-8th | \tf scottish-16th | \tf scottish-8th";
            var score = ParseTex(tex);

            Assert.AreEqual(TripletFeel.NoTripletFeel, score.MasterBars[0].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet16th, score.MasterBars[1].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet8th, score.MasterBars[2].TripletFeel);
            Assert.AreEqual(TripletFeel.Dotted16th, score.MasterBars[3].TripletFeel);
            Assert.AreEqual(TripletFeel.Dotted8th, score.MasterBars[4].TripletFeel);
            Assert.AreEqual(TripletFeel.Scottish16th, score.MasterBars[5].TripletFeel);
            Assert.AreEqual(TripletFeel.Scottish8th, score.MasterBars[6].TripletFeel);
        }

        [TestMethod]
        public void TestTripletFeelShortNames()
        {
            var tex = @"\tf no | \tf t16 | \tf t8 | \tf d16 | \tf d8 | \tf s16 | \tf s8";
            var score = ParseTex(tex);

            Assert.AreEqual(TripletFeel.NoTripletFeel, score.MasterBars[0].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet16th, score.MasterBars[1].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet8th, score.MasterBars[2].TripletFeel);
            Assert.AreEqual(TripletFeel.Dotted16th, score.MasterBars[3].TripletFeel);
            Assert.AreEqual(TripletFeel.Dotted8th, score.MasterBars[4].TripletFeel);
            Assert.AreEqual(TripletFeel.Scottish16th, score.MasterBars[5].TripletFeel);
            Assert.AreEqual(TripletFeel.Scottish8th, score.MasterBars[6].TripletFeel);
        }

        [TestMethod]
        public void TestTripletFeelMultiBar()
        {
            var tex = @"\tf t16 | | | \tf t8 | | | \tf no | | ";
            var score = ParseTex(tex);

            Assert.AreEqual(TripletFeel.Triplet16th, score.MasterBars[0].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet16th, score.MasterBars[1].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet16th, score.MasterBars[2].TripletFeel);

            Assert.AreEqual(TripletFeel.Triplet8th, score.MasterBars[3].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet8th, score.MasterBars[4].TripletFeel);
            Assert.AreEqual(TripletFeel.Triplet8th, score.MasterBars[5].TripletFeel);

            Assert.AreEqual(TripletFeel.NoTripletFeel, score.MasterBars[6].TripletFeel);
            Assert.AreEqual(TripletFeel.NoTripletFeel, score.MasterBars[7].TripletFeel);
            Assert.AreEqual(TripletFeel.NoTripletFeel, score.MasterBars[8].TripletFeel);
        }

        [TestMethod]
        public void TestTupletRepeat()
        {
            var tex = @":8 5.3{tu 3}*3";
            var score = ParseTex(tex);

            var durations = new[]
            {
                Duration.Eighth, Duration.Eighth, Duration.Eighth,
            };

            var tuplets = new[]
            {
                3, 3, 3
            };

            var i = 0;
            var b = score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0];
            while (b != null)
            {
                Assert.AreEqual(durations[i], b.Duration, "Duration on beat " + i + " was wrong");
                if (tuplets[i] == 1)
                {
                    Assert.IsFalse(b.HasTuplet, "Beat " + i + " had wrongly a tuplet");
                }
                else
                {
                    Assert.AreEqual(tuplets[i], b.TupletNumerator, "Tuplet on beat " + i + " was wrong");
                }

                b = b.NextBeat;
                i++;
            }

            Assert.AreEqual(durations.Length, i);
        }

        [TestMethod]
        public void TestSimpleAnacrusis()
        {
            var tex = @"\ac 3.3 3.3 | 1.1 2.1 3.1 4.1";
            var score = ParseTex(tex);
            Assert.IsTrue(score.MasterBars[0].IsAnacrusis);
            Assert.AreEqual(1920, score.MasterBars[0].CalculateDuration());
            Assert.AreEqual(3840, score.MasterBars[1].CalculateDuration());
        }

        [TestMethod]
        public void TestMultiBarAnacrusis()
        {
            var tex = @"\ac 3.3 3.3 | \ac 3.3 3.3 | 1.1 2.1 3.1 4.1";
            var score = ParseTex(tex);
            Assert.IsTrue(score.MasterBars[0].IsAnacrusis);
            Assert.IsTrue(score.MasterBars[1].IsAnacrusis);
            Assert.AreEqual(1920, score.MasterBars[0].CalculateDuration());
            Assert.AreEqual(1920, score.MasterBars[1].CalculateDuration());
            Assert.AreEqual(3840, score.MasterBars[2].CalculateDuration());
        }

        [TestMethod]
        public void TestRandomAnacrusis()
        {
            var tex = @"\ac 3.3 3.3 | 1.1 2.1 3.1 4.1 | \ac 3.3 3.3 | 1.1 2.1 3.1 4.1";
            var score = ParseTex(tex);
            Assert.IsTrue(score.MasterBars[0].IsAnacrusis);
            Assert.IsFalse(score.MasterBars[1].IsAnacrusis);
            Assert.IsTrue(score.MasterBars[2].IsAnacrusis);
            Assert.IsFalse(score.MasterBars[3].IsAnacrusis);
            Assert.AreEqual(1920, score.MasterBars[0].CalculateDuration());
            Assert.AreEqual(3840, score.MasterBars[1].CalculateDuration());
            Assert.AreEqual(1920, score.MasterBars[2].CalculateDuration());
            Assert.AreEqual(3840, score.MasterBars[3].CalculateDuration());
        }
    }
}
