﻿using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class Gp3ImporterTest : GpImporterTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void TestScoreInfo()
        {
            PrepareImporterWithFile("GuitarPro3/Test01.gp3", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual("Title", score.Title);
                Assert.AreEqual("Subtitle", score.SubTitle);
                Assert.AreEqual("Artist", score.Artist);
                Assert.AreEqual("Album", score.Album);
                Assert.AreEqual("Music", score.Words); // no words in gp4
                Assert.AreEqual("Music", score.Music);
                Assert.AreEqual("Copyright", score.Copyright);
                Assert.AreEqual("Tab", score.Tab);
                Assert.AreEqual("Instructions", score.Instructions);
                Assert.AreEqual("Notice1\r\nNotice2", score.Notices);
                Assert.AreEqual(5, score.MasterBars.Count);
                Assert.AreEqual(1, score.Tracks.Count);
                Assert.AreEqual("Track 1", score.Tracks[0].Name);

                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestNotes()
        {
            PrepareImporterWithFile("GuitarPro3/Test02.gp3", reader =>
            {
                var score = reader.ReadScore();
                CheckTest02Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTimeSignatures()
        {
            PrepareImporterWithFile("GuitarPro3/Test03.gp3", reader =>
            {
                var score = reader.ReadScore();

                CheckTest03Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestDead()
        {
            PrepareImporterWithFile("GuitarPro3/TestDead.gp3", reader =>
            {
                var score = reader.ReadScore();
                CheckDead(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestAccentuation()
        {
            PrepareImporterWithFile("GuitarPro3/TestAccentuations.gp3", reader =>
            {
                var score = reader.ReadScore();

                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].IsGhost);
                // it seems accentuation is handled as Forte Fortissimo
                Assert.AreEqual(DynamicValue.FFF, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].Dynamics);
                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Notes[0].IsLetRing);
                Render(score);
            });
        }

        [TestMethod]
        public void TestGuitarPro3Harmonics()
        {
            // TODO: Find out about GP3 harmonics!
            //var reader = PrepareImporterWithFile("GuitarPro3/TestHarmonics.gp3");
            //var score = reader.ReadScore();

            //Assert.AreEqual(HarmonicType.Natural, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].HarmonicType);
            //Assert.AreEqual(HarmonicType.Artificial, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].HarmonicType);
        }

        [TestMethod, AsyncTestMethod]
        public void TestHammer()
        {
            PrepareImporterWithFile("GuitarPro3/TestHammer.gp3", reader =>
            {
                var score = reader.ReadScore();
                CheckHammer(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestBend()
        {
            PrepareImporterWithFile("GuitarPro3/TestBends.gp3", reader =>
            {
                var score = reader.ReadScore();
                CheckBend(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestSlides()
        {
            PrepareImporterWithFile("GuitarPro3/TestSlides.gp3", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(SlideOutType.Shift, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].GetNoteOnString(5).SlideOutType);
                Assert.AreEqual(SlideOutType.Shift, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].GetNoteOnString(2).SlideOutType);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestGuitarPro3Vibrato()
        {
            // TODO: Check why this vibrato is not recognized
            PrepareImporterWithFile("GuitarPro3/TestVibrato.gp3", reader =>
            {
                var score = reader.ReadScore();
                CheckVibrato(score, false);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestOtherEffects()
        {
            PrepareImporterWithFile("GuitarPro3/TestOtherEffects.gp3", reader =>
            {
                var score = reader.ReadScore();

                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Tap);
                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Slap);

                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Pop);
                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].FadeIn);

                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].HasChord);
                Assert.AreEqual("C", score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].Chord.Name);
                Assert.AreEqual("Text", score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[1].Text);
                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Tempo) != null);
                Assert.AreEqual(120.0, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Tempo).Value);
                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Instrument) != null);
                Assert.AreEqual(25.0, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Instrument).Value);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStroke()
        {
            PrepareImporterWithFile("GuitarPro3/TestStrokes.gp3", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(BrushType.BrushDown, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].BrushType);
                Assert.AreEqual(BrushType.BrushUp, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].BrushType);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTuplets()
        {
            PrepareImporterWithFile("GuitarPro3/TestTuplets.gp3", reader =>
            {
                var score = reader.ReadScore();
                CheckTuplets(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestRanges()
        {
            PrepareImporterWithFile("GuitarPro3/TestRanges.gp3", reader =>
            {
                var score = reader.ReadScore();

                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Notes[0].IsLetRing);
                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2].Notes[0].IsLetRing);
                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[3].Notes[0].IsLetRing);
                Assert.IsTrue(score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Notes[0].IsLetRing);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestEffects()
        {
            PrepareImporterWithFile("GuitarPro3/Effects.gp3", reader =>
            {
                var score = reader.ReadScore();
                CheckEffects(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStrings()
        {
            PrepareImporterWithFile("GuitarPro3/TestStrings.gp3", reader =>
            {
                var score = reader.ReadScore();
                CheckStrings(score);
                Render(score);
            });
        }
    }
}
