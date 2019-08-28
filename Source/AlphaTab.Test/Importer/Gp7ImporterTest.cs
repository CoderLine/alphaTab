using System;
using System.IO;
using System.Linq;
using AlphaTab.Audio;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class Gp7ImporterTest : GpImporterTestBase
    {
        internal void Load(string name, Action<byte[]> loaded)
        {
            const string path = "TestFiles/";
            TestPlatform.LoadFile(path + name, loaded);
        }

        internal void PrepareGp7ImporterWithFile(string name, Action<Gp7Importer> ready)
        {
            Load(name, data => ready(PrepareGp7ImporterWithBytes(data)));
        }

        internal Gp7Importer PrepareGp7ImporterWithBytes(byte[] buffer)
        {
            var readerBase = new Gp7Importer();
            readerBase.Init(ByteBuffer.FromBuffer(buffer), new Settings());
            return readerBase;
        }

        [TestMethod, AsyncTestMethod]
        public void TestScoreInfo()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/Test01.gp", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual("Title", score.Title);
                Assert.AreEqual("Subtitle", score.SubTitle);
                Assert.AreEqual("Artist", score.Artist);
                Assert.AreEqual("Album", score.Album);
                Assert.AreEqual("Words", score.Words);
                Assert.AreEqual("Music", score.Music);
                Assert.AreEqual("Copyright", score.Copyright);
                Assert.AreEqual("Tab", score.Tab);
                Assert.AreEqual("Instructions", score.Instructions);
                Assert.AreEqual("Notice1\nNotice2", score.Notices);
                Assert.AreEqual(5, score.MasterBars.Count);
                Assert.AreEqual(2, score.Tracks.Count);
                Assert.AreEqual("Track 1", score.Tracks[0].Name);
                Assert.AreEqual("Track 2", score.Tracks[1].Name);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestNotes()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/Test02.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckTest02Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTimeSignatures()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/Test03.gp", reader =>
            {
                var score = reader.ReadScore();

                CheckTest03Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestDead()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestDead.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckDead(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestGrace()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestGrace.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckGrace(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestAccentuation()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestAccentuations.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckAccentuation(score, true);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestHarmonics()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestHarmonics.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckHarmonics(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestHammer()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestHammer.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckHammer(score);
                Render(score);
            });
        }

        [TestMethod]
        public void TestNumber()
        {
            Assert.AreEqual(4, Convert(100));
        }

        private const float ConversionFactor = 1 / 25f;
        private int Convert(float value)
        {
            var converted = value * ConversionFactor;
            return (int)(converted);
        }

        [TestMethod, AsyncTestMethod]
        public void TestBend()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestBends.gp", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(BendType.Bend, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendType);
                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[0].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[1].Offset);
                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[1].Value);

                Assert.AreEqual(BendType.Bend, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendType);
                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[0].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[1].Offset);
                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[1].Value);

                Assert.AreEqual(BendType.BendRelease, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendType);
                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Value);

                Assert.AreEqual(30, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[1].Offset);
                Assert.AreEqual(12, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[1].Value);

                Assert.AreEqual(30, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[2].Offset);
                Assert.AreEqual(12, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[2].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[3].Offset);
                Assert.AreEqual(6, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[3].Value);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestBendAdvanced()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/BendsAdvanced.gp", reader =>
            {
                var score = reader.ReadScore();

                #region Simple Standalone Bends

                #region Bar 1

                var note = score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0];
                Assert.AreEqual(BendType.BendRelease, note.BendType);
                Assert.AreEqual(4, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(10, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);
                Assert.AreEqual(20, note.BendPoints[2].Offset);
                Assert.AreEqual(4, note.BendPoints[2].Value);
                Assert.AreEqual(30, note.BendPoints[3].Offset);
                Assert.AreEqual(0, note.BendPoints[3].Value);

                #endregion

                #region Bar 2

                note = score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(59, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Notes[0];
                Assert.AreEqual(BendType.BendRelease, note.BendType);
                Assert.AreEqual(4, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(10, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);
                Assert.AreEqual(45, note.BendPoints[2].Offset);
                Assert.AreEqual(4, note.BendPoints[2].Value);
                Assert.AreEqual(59, note.BendPoints[3].Offset);
                Assert.AreEqual(0, note.BendPoints[3].Value);

                #endregion

                #region Bar 3

                note = score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.Prebend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(4, note.BendPoints[0].Value);
                Assert.AreEqual(60, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[1].Notes[0];
                Assert.AreEqual(BendType.PrebendBend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(4, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(6, note.BendPoints[1].Value);

                #endregion

                #region Bar 4

                note = score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.PrebendRelease, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(4, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(0, note.BendPoints[1].Value);

                #endregion

                #region Bar 5

                note = score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(14, note.BendPoints[1].Offset);
                Assert.AreEqual(8, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[1].Notes[0];
                Assert.AreEqual(BendType.BendRelease, note.BendType);
                Assert.AreEqual(4, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(9, note.BendPoints[1].Offset);
                Assert.AreEqual(8, note.BendPoints[1].Value);
                Assert.AreEqual(20, note.BendPoints[2].Offset);
                Assert.AreEqual(8, note.BendPoints[2].Value);
                Assert.AreEqual(31, note.BendPoints[3].Offset);
                Assert.AreEqual(4, note.BendPoints[3].Value);

                #endregion

                #region Bar 6

                note = score.Tracks[0].Staves[0].Bars[5].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.Prebend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(8, note.BendPoints[0].Value);
                Assert.AreEqual(60, note.BendPoints[1].Offset);
                Assert.AreEqual(8, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[5].Voices[0].Beats[1].Notes[0];
                Assert.AreEqual(BendType.PrebendBend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(8, note.BendPoints[0].Value);
                Assert.AreEqual(16, note.BendPoints[1].Offset);
                Assert.AreEqual(12, note.BendPoints[1].Value);

                #endregion

                #region Bar 7

                note = score.Tracks[0].Staves[0].Bars[6].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.PrebendRelease, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(8, note.BendPoints[0].Value);
                Assert.AreEqual(14, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                #endregion

                #region Bar 8

                note = score.Tracks[0].Staves[0].Bars[7].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                #endregion

                #region Bar 9

                note = score.Tracks[0].Staves[0].Bars[8].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.BendRelease, note.BendType);
                Assert.AreEqual(4, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(10, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);
                Assert.AreEqual(20, note.BendPoints[2].Offset);
                Assert.AreEqual(4, note.BendPoints[2].Value);
                Assert.AreEqual(30, note.BendPoints[3].Offset);
                Assert.AreEqual(0, note.BendPoints[3].Value);

                #endregion

                #endregion

                #region Combined Bends

                #region Bar 10

                note = score.Tracks[0].Staves[0].Bars[9].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[9].Voices[0].Beats[1].Notes[0];
                Assert.AreEqual(BendType.Release, note.BendType);
                Assert.IsTrue(note.IsContinuedBend);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(4, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(0, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[9].Voices[0].Beats[2].Notes[0];
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.IsFalse(note.IsContinuedBend);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                #endregion


                #region Bar 11

                note = score.Tracks[0].Staves[0].Bars[10].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[10].Voices[0].Beats[1].Notes[0];
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.IsTrue(note.IsContinuedBend);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(4, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(8, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[10].Voices[0].Beats[2].Notes[0];
                Assert.AreEqual(BendType.Release, note.BendType);
                Assert.IsTrue(note.IsContinuedBend);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(8, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[10].Voices[0].Beats[3].Notes[0];
                Assert.AreEqual(BendType.Release, note.BendType);
                Assert.IsTrue(note.IsContinuedBend);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(4, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(0, note.BendPoints[1].Value);

                #endregion


                #endregion

                #region Grace Bends

                #region Bar 12

                note = score.Tracks[0].Staves[0].Bars[11].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(GraceType.BeforeBeat, note.Beat.GraceType);
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                #endregion

                #region Bar 13

                note = score.Tracks[0].Staves[0].Bars[12].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(GraceType.BeforeBeat, note.Beat.GraceType);
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[12].Voices[0].Beats[1].Notes[0];
                Assert.IsTrue(note.IsContinuedBend);
                Assert.AreEqual(BendType.Hold, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(4, note.BendPoints[0].Value);
                Assert.AreEqual(60, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                #endregion

                #region Bar 14

                note = score.Tracks[0].Staves[0].Bars[13].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(GraceType.OnBeat, note.Beat.GraceType);
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(18, note.BendPoints[1].Offset);
                Assert.AreEqual(1, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[13].Voices[0].Beats[1].Notes[0];
                Assert.IsTrue(note.IsContinuedBend);
                Assert.AreEqual(BendType.Hold, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(1, note.BendPoints[0].Value);
                Assert.AreEqual(60, note.BendPoints[1].Offset);
                Assert.AreEqual(1, note.BendPoints[1].Value);

                #endregion

                #region Bar 15

                note = score.Tracks[0].Staves[0].Bars[14].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(GraceType.BeforeBeat, note.Beat.GraceType);
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[14].Voices[0].Beats[1].Notes[0];
                Assert.AreEqual(12, note.Fret);
                Assert.IsTrue(note.IsTieDestination);
                Assert.IsTrue(note.IsContinuedBend);
                Assert.AreEqual(BendType.Hold, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(4, note.BendPoints[0].Value);
                Assert.AreEqual(60, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                note = score.Tracks[0].Staves[0].Bars[14].Voices[0].Beats[1].Notes[1];
                Assert.AreEqual(10, note.Fret);
                Assert.IsFalse(note.IsContinuedBend);
                Assert.IsFalse(note.HasBend);
                Assert.AreEqual(BendType.None, note.BendType);

                #endregion

                #region Bar 16

                note = score.Tracks[0].Staves[0].Bars[15].Voices[0].Beats[0].Notes[0];
                Assert.AreEqual(10, note.Fret);
                Assert.AreEqual(BendType.None, note.BendType);

                note = score.Tracks[0].Staves[0].Bars[15].Voices[0].Beats[0].Notes[1];
                Assert.AreEqual(BendType.Bend, note.BendType);
                Assert.AreEqual(2, note.BendPoints.Count);
                Assert.AreEqual(0, note.BendPoints[0].Offset);
                Assert.AreEqual(0, note.BendPoints[0].Value);
                Assert.AreEqual(15, note.BendPoints[1].Offset);
                Assert.AreEqual(4, note.BendPoints[1].Value);

                #endregion



                #endregion

                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestWhammyAdvanced()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/WhammyAdvanced.gp", reader =>
            {
                var score = reader.ReadScore();

                #region Bar 1

                var beat = score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0];

                Assert.AreEqual(WhammyType.Dive, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(45, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-4, beat.WhammyBarPoints[1].Value);

                beat = score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2];

                Assert.AreEqual(WhammyType.PrediveDive, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(-4, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(60, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-16, beat.WhammyBarPoints[1].Value);

                #endregion

                #region Bar 2

                beat = score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0];

                Assert.AreEqual(WhammyType.Dip, beat.WhammyBarType);
                Assert.AreEqual(3, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(15, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-16, beat.WhammyBarPoints[1].Value);
                Assert.AreEqual(30, beat.WhammyBarPoints[2].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[2].Value);


                beat = score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2];

                Assert.AreEqual(WhammyType.Dip, beat.WhammyBarType);
                Assert.AreEqual(4, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(14, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-12, beat.WhammyBarPoints[1].Value);
                Assert.AreEqual(31, beat.WhammyBarPoints[2].Offset);
                Assert.AreEqual(-12, beat.WhammyBarPoints[2].Value);
                Assert.AreEqual(53, beat.WhammyBarPoints[3].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[3].Value);

                #endregion

                #region Bar 3

                beat = score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0];

                Assert.AreEqual(WhammyType.Dip, beat.WhammyBarType);
                Assert.AreEqual(3, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(15, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-16, beat.WhammyBarPoints[1].Value);
                Assert.AreEqual(30, beat.WhammyBarPoints[2].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[2].Value);


                beat = score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[2];

                Assert.AreEqual(WhammyType.Dip, beat.WhammyBarType);
                Assert.AreEqual(4, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(14, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-12, beat.WhammyBarPoints[1].Value);
                Assert.AreEqual(31, beat.WhammyBarPoints[2].Offset);
                Assert.AreEqual(-12, beat.WhammyBarPoints[2].Value);
                Assert.AreEqual(53, beat.WhammyBarPoints[3].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[3].Value);

                #endregion

                #region Bar 4

                beat = score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0];

                Assert.AreEqual(WhammyType.Predive, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(-8, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(60, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-8, beat.WhammyBarPoints[1].Value);

                #endregion

                #region Bar 5

                beat = score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0];

                Assert.AreEqual(WhammyType.PrediveDive, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(-4, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(30, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[1].Value);

                #endregion

                #region Bar 6

                beat = score.Tracks[0].Staves[0].Bars[5].Voices[0].Beats[0];

                Assert.AreEqual(WhammyType.PrediveDive, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(-4, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(29, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-12, beat.WhammyBarPoints[1].Value);


                beat = score.Tracks[0].Staves[0].Bars[5].Voices[0].Beats[1];

                Assert.AreEqual(WhammyType.Dive, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(-12, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(45, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[1].Value);

                #endregion

                #region Bar 7

                beat = score.Tracks[0].Staves[0].Bars[6].Voices[0].Beats[0];

                Assert.AreEqual(WhammyType.Dive, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(45, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-4, beat.WhammyBarPoints[1].Value);


                beat = score.Tracks[0].Staves[0].Bars[6].Voices[0].Beats[1];
                Assert.AreEqual(WhammyType.Hold, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(-4, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(60, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-4, beat.WhammyBarPoints[1].Value);

                #endregion

                #region Bar 8

                beat = score.Tracks[0].Staves[0].Bars[7].Voices[0].Beats[0];

                Assert.AreEqual(WhammyType.Dive, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(-4, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(46, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-12, beat.WhammyBarPoints[1].Value);

                beat = score.Tracks[0].Staves[0].Bars[7].Voices[0].Beats[1];

                Assert.AreEqual(WhammyType.Dive, beat.WhammyBarType);
                Assert.AreEqual(2, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(-12, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(44, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(8, beat.WhammyBarPoints[1].Value);

                #endregion

                #region Bar 9

                beat = score.Tracks[0].Staves[0].Bars[8].Voices[0].Beats[0];

                Assert.AreEqual(WhammyType.Dip, beat.WhammyBarType);
                Assert.AreEqual(3, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(8, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(15, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(12, beat.WhammyBarPoints[1].Value);
                Assert.AreEqual(30, beat.WhammyBarPoints[2].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[2].Value);

                beat = score.Tracks[0].Staves[0].Bars[8].Voices[0].Beats[1];

                Assert.AreEqual(WhammyType.Dip, beat.WhammyBarType);
                Assert.AreEqual(3, beat.WhammyBarPoints.Count);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[0].Value);
                Assert.AreEqual(15, beat.WhammyBarPoints[1].Offset);
                Assert.AreEqual(-4, beat.WhammyBarPoints[1].Value);
                Assert.AreEqual(30, beat.WhammyBarPoints[2].Offset);
                Assert.AreEqual(0, beat.WhammyBarPoints[2].Value);

                #endregion

                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTremolo()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestTremolo.gp", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[0].Value);

                Assert.AreEqual(30, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
                Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[1].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[2].Value);


                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
                Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[0].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[1].Value);

                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[0].Value);

                Assert.AreEqual(30, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
                Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[1].Value);

                Assert.AreEqual(30, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
                Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[2].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[3].Offset);
                Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[3].Value);

                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
                Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[0].Value);

                Assert.AreEqual(15, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
                Assert.AreEqual(-12, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[1].Value);

                Assert.AreEqual(30, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
                Assert.AreEqual(-12, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[2].Value);

                Assert.AreEqual(45, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[3].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[3].Value);

                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestSlides()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestSlides.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckSlides(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestVibrato()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestVibrato.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckVibrato(score, true);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTrills()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestTrills.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckTrills(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestOtherEffects()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestOtherEffects.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckOtherEffects(score, true /* GPX doesn't support instrument changes */);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestFingering()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestFingering.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckFingering(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStroke()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestStrokes.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckStroke(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTuplets()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestTuplets.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckTuplets(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestRanges()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestRanges.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckRanges(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestEffects()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/Effects.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckEffects(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestSerenade()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/Serenade.gp", reader =>
            {
                var score = reader.ReadScore();// only Check reading
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStrings()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestStrings.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckStrings(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestKeySignatures()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestKeySignatures.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckKeySignatures(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestChords()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestChords.gp", reader =>
            {
                var score = reader.ReadScore();
                CheckChords(score);
                Render(score);
            });
        }



        [TestMethod, AsyncTestMethod]
        public void TestColors()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/Colors.gp", reader =>
            {
                var score = reader.ReadScore();

                CheckColors(score);
                Render(score);
            });
        }


        [TestMethod, AsyncTestMethod]
        public void TestTremoloVibrato()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestTremoloVibrato.gp", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(VibratoType.Slight, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].Vibrato);

                Assert.AreEqual(VibratoType.Wide, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].Vibrato);
                Assert.AreEqual(VibratoType.Slight, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[1].Vibrato);

                Assert.AreEqual(VibratoType.Slight, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Vibrato);

                Assert.AreEqual(VibratoType.Wide, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].Vibrato);

                Assert.AreEqual(VibratoType.Wide, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].Vibrato);

                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestOttavia()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestOttavia.gp", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(Ottavia._8va, score.Tracks[0].Staves[0].Bars[0].ClefOttava);
                Assert.AreEqual(Ottavia._8vb, score.Tracks[0].Staves[0].Bars[1].ClefOttava);
                Assert.AreEqual(Ottavia._15ma, score.Tracks[0].Staves[0].Bars[2].ClefOttava);
                Assert.AreEqual(Ottavia._15mb, score.Tracks[0].Staves[0].Bars[3].ClefOttava);


                Assert.AreEqual(Ottavia._8va, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].Ottava);
                Assert.AreEqual(Ottavia._8vb, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[1].Ottava);
                Assert.AreEqual(Ottavia._15ma, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[2].Ottava);
                Assert.AreEqual(Ottavia._15mb, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[3].Ottava);
            });
        }


        [TestMethod, AsyncTestMethod]
        public void TestSimileMark()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestSimileMark.gp", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(SimileMark.None, score.Tracks[0].Staves[0].Bars[0].SimileMark);
                Assert.AreEqual(SimileMark.Simple, score.Tracks[0].Staves[0].Bars[1].SimileMark);

                Assert.AreEqual(SimileMark.None, score.Tracks[0].Staves[0].Bars[2].SimileMark);
                Assert.AreEqual(SimileMark.None, score.Tracks[0].Staves[0].Bars[3].SimileMark);

                Assert.AreEqual(SimileMark.FirstOfDouble, score.Tracks[0].Staves[0].Bars[4].SimileMark);
                Assert.AreEqual(SimileMark.SecondOfDouble, score.Tracks[0].Staves[0].Bars[5].SimileMark);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestAnacrusis()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestAnacrusis.gp", reader =>
            {
                var score = reader.ReadScore();
                Assert.IsTrue(score.MasterBars[0].IsAnacrusis);
                Assert.AreEqual(1920, score.MasterBars[0].CalculateDuration());
                Assert.AreEqual(3840, score.MasterBars[1].CalculateDuration());
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestFermata()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestFermata.gp", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(5, score.MasterBars[0].Fermata.Count);
                Assert.AreEqual(5, score.MasterBars[1].Fermata.Count);
                Assert.AreEqual(5, score.MasterBars[2].Fermata.Count);

                // Short
                var offsets = new[]
                {
                0,
                (int) (MidiUtils.QuarterTime * (1f / 2f)),
                (int) (MidiUtils.QuarterTime * (1f / 1f)),
                (int) (MidiUtils.QuarterTime * (2f / 1f)),
                (int) (MidiUtils.QuarterTime * (3f / 1f))
            };
                var types = new[]
                {
                FermataType.Short,
                FermataType.Medium,
                FermataType.Long
            };

                for (var i = 0; i < 3; i++)
                {
                    var masterBar = score.MasterBars[i];
                    Assert.AreEqual(5, masterBar.Fermata.Count);
                    foreach (var offset in offsets)
                    {
                        var fermata = masterBar.Fermata[offset];
                        Assert.IsNotNull(fermata);
                        Assert.AreEqual(types[i], fermata.Type);
                    }

                    var beats = score.Tracks[0].Staves[0].Bars[i].Voices[0].Beats;
                    foreach (var beat in beats)
                    {
                        var fermata = masterBar.Fermata[beat.PlaybackStart];
                        var beatFermata = beat.Fermata;
                        Assert.IsNotNull(beatFermata);
                        Assert.IsNotNull(fermata);
                        Assert.AreEqual(types[i], beatFermata.Type);
                        Assert.AreEqual(types[i], fermata.Type);
                    }
                }
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestPickSlide()
        {
            PrepareGp7ImporterWithFile("GuitarPro7/TestPickSlide.gp", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(SlideType.PickSlideUp, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].SlideType);
                Assert.AreEqual(10, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].Fret);
                Assert.AreEqual(10, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].Fret);

                Assert.AreEqual(SlideType.PickSlideDown, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Notes[0].SlideType);
                Assert.AreEqual(10, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Notes[0].Fret);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Notes[0].Fret);


                Assert.AreEqual(SlideType.PickSlideUp, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].SlideType);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].Fret);
                Assert.AreEqual(10, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Notes[0].Fret);

                Assert.AreEqual(SlideType.PickSlideDown, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2].Notes[0].SlideType);
                Assert.AreEqual(10, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2].Notes[0].Fret);
                Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[3].Notes[0].Fret);


                Assert.AreEqual(SlideType.PickSlideDown, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Notes[0].SlideType);
                Assert.AreEqual(20, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Notes[0].Fret);

                Assert.AreEqual(SlideType.PickSlideDown, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[1].Notes[0].SlideType);
                Assert.AreEqual(12, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[1].Notes[0].Fret);

                Assert.AreEqual(SlideType.PickSlideDown, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[2].Notes[0].SlideType);
                Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[2].Notes[0].Fret);

                Assert.AreEqual(SlideType.PickSlideDown, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[3].Notes[0].SlideType);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[3].Notes[0].Fret);


                Assert.AreEqual(SlideType.PickSlideDown, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].Notes[0].SlideType);
                Assert.AreEqual(20, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].Notes[0].Fret);

                Assert.AreEqual(SlideType.PickSlideDown, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[1].Notes[0].SlideType);
                Assert.AreEqual(12, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[1].Notes[0].Fret);

                Assert.AreEqual(SlideType.PickSlideUp, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[2].Notes[0].SlideType);
                Assert.AreEqual(5, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[2].Notes[0].Fret);

                Assert.AreEqual(SlideType.PickSlideUp, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[3].Notes[0].SlideType);
                Assert.AreEqual(10, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[3].Notes[0].Fret);


                Assert.AreEqual(SlideType.PickSlideDown, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].Notes[0].SlideType);
                Assert.AreEqual(20, score.Tracks[0].Staves[0].Bars[4].Voices[0].Beats[0].Notes[0].Fret);

                Render(score);
            });
        }
    }
}
