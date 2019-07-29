using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class Gp4ImporterTest : GpImporterTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void TestScoreInfo()
        {
            PrepareImporterWithFile("GuitarPro4/Test01.gp4", reader =>
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
            PrepareImporterWithFile("GuitarPro4/Test02.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckTest02Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTimeSignatures()
        {
            PrepareImporterWithFile("GuitarPro4/Test03.gp4", reader =>
            {
                var score = reader.ReadScore();

                CheckTest03Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestDead()
        {
            PrepareImporterWithFile("GuitarPro4/TestDead.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckDead(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestGrace()
        {
            PrepareImporterWithFile("GuitarPro4/TestGrace.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckGrace(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestAccentuation()
        {
            PrepareImporterWithFile("GuitarPro4/TestAccentuations.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckAccentuation(score, false);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestHarmonics()
        {
            PrepareImporterWithFile("GuitarPro4/TestHarmonics.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckHarmonics(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestHammer()
        {
            PrepareImporterWithFile("GuitarPro4/TestHammer.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckHammer(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestBend()
        {
            PrepareImporterWithFile("GuitarPro4/TestBends.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckBend(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTremolo()
        {
            PrepareImporterWithFile("GuitarPro4/TestTremolo.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckTremolo(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestSlides()
        {
            PrepareImporterWithFile("GuitarPro4/TestSlides.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckSlides(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestVibrato()
        {
            PrepareImporterWithFile("GuitarPro4/TestVibrato.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckVibrato(score, true);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTrills()
        {
            PrepareImporterWithFile("GuitarPro4/TestTrills.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckTrills(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestOtherEffects()
        {
            PrepareImporterWithFile("GuitarPro4/TestOtherEffects.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckOtherEffects(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestFingering()
        {
            PrepareImporterWithFile("GuitarPro4/TestFingering.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckFingering(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStroke()
        {
            PrepareImporterWithFile("GuitarPro4/TestStrokes.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckStroke(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTuplets()
        {
            PrepareImporterWithFile("GuitarPro4/TestTuplets.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckTuplets(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestRanges()
        {
            PrepareImporterWithFile("GuitarPro4/TestRanges.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckRanges(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestEffects()
        {
            PrepareImporterWithFile("GuitarPro4/Effects.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckEffects(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStrings()
        {
            PrepareImporterWithFile("GuitarPro4/TestStrings.gp4", reader =>
            {
                var score = reader.ReadScore();
                CheckStrings(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestColors()
        {
            PrepareImporterWithFile("GuitarPro4/Colors.gp4", reader =>
            {
                var score = reader.ReadScore();

                CheckColors(score);
                Render(score);
            });
        }
    }
}
