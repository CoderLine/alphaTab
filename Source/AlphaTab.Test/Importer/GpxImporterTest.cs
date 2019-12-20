using System;
using System.IO;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Util;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class GpxImporterTest : GpImporterTestBase
    {
        internal void Load(string name, Action<byte[]> loaded)
        {
            const string path = "TestFiles/";
            TestPlatform.LoadFile(path + name, loaded);
        }

        internal void PrepareGpxImporterWithFile(string name, Action<GpxImporter> ready)
        {
            Load(name, data => ready(PrepareGpxImporterWithBytes(data)));
        }

        internal GpxImporter PrepareGpxImporterWithBytes(byte[] buffer)
        {
            var readerBase = new GpxImporter();
            readerBase.Init(ByteBuffer.FromBuffer(buffer), new Settings());
            return readerBase;
        }

        [TestMethod, AsyncTestMethod]
        public void TestFileSystemCompressed()
        {
            Load("GuitarPro6/Compressed.gpx", data =>
            {
                var fileSystem = new GpxFileSystem();
                fileSystem.Load(ByteBuffer.FromBuffer(data));

                string[] names = { "score.gpif", "misc.xml", "BinaryStylesheet", "PartConfiguration", "LayoutConfiguration" };
                int[] sizes = { 8488, 130, 12204, 20, 12 };

                for (var i = 0; i < fileSystem.Files.Count; i++)
                {
                    var file = fileSystem.Files[i];
                    Logger.Info("Test", $"{file.FileName} - {file.FileSize}");
                    Assert.AreEqual(names[i], file.FileName);
                    Assert.AreEqual(sizes[i], file.FileSize);
                }
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestScoreInfo()
        {
            PrepareGpxImporterWithFile("GuitarPro6/Test01.gpx", reader =>
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
            PrepareGpxImporterWithFile("GuitarPro6/Test02.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckTest02Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTimeSignatures()
        {
            PrepareGpxImporterWithFile("GuitarPro6/Test03.gpx", reader =>
            {
                var score = reader.ReadScore();

                CheckTest03Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestDead()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestDead.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckDead(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestGrace()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestGrace.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckGrace(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestAccentuation()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestAccentuations.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckAccentuation(score, true);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestHarmonics()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestHarmonics.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckHarmonics(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestHammer()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestHammer.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckHammer(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestBend()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestBends.gpx", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[0].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[1].Offset);
                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[1].Value);

                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[0].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[1].Offset);
                Assert.AreEqual(4, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[1].Value);

                Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Value);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Value);

                Assert.AreEqual(30, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[1].Offset);
                Assert.AreEqual(12, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[1].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[2].Offset);
                Assert.AreEqual(6, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[2].Value);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTremolo()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestTremolo.gpx", reader =>
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


                Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints.Count);

                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
                Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[0].Value);

                Assert.AreEqual(30, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
                Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[1].Value);

                Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
                Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[2].Value);

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
            PrepareGpxImporterWithFile("GuitarPro6/TestSlides.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckSlides(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestVibrato()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestVibrato.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckVibrato(score, true);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTrills()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestTrills.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckTrills(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestOtherEffects()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestOtherEffects.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckOtherEffects(score, true /* GPX doesn't support instrument changes */);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestFingering()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestFingering.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckFingering(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStroke()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestStrokes.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckStroke(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTuplets()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestTuplets.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckTuplets(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestRanges()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestRanges.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckRanges(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestEffects()
        {
            PrepareGpxImporterWithFile("GuitarPro6/Effects.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckEffects(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestSerenade()
        {
            PrepareGpxImporterWithFile("GuitarPro6/Serenade.gpx", reader =>
            {
                var score = reader.ReadScore();// only Check reading
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStrings()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestStrings.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckStrings(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestKeySignatures()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestKeySignatures.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckKeySignatures(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestChords()
        {
            PrepareGpxImporterWithFile("GuitarPro6/TestChords.gpx", reader =>
            {
                var score = reader.ReadScore();
                CheckChords(score);
                Render(score);
            });
        }



        [TestMethod, AsyncTestMethod]
        public void TestColors()
        {
            PrepareGpxImporterWithFile("GuitarPro6/Colors.gpx", reader =>
            {
                var score = reader.ReadScore();

                CheckColors(score);
                Render(score);
            });
        }
    }
}
