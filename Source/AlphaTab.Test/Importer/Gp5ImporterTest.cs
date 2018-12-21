/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class Gp5ImporterTest : GpImporterTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void TestScoreInfo()
        {
            PrepareImporterWithFile("GuitarPro5/Test01.gp5", reader =>
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
                Assert.AreEqual("Notice1\r\nNotice2", score.Notices);
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
            PrepareImporterWithFile("GuitarPro5/Test02.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckTest02Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTimeSignatures()
        {
            PrepareImporterWithFile("GuitarPro5/Test03.gp5", reader =>
            {
                var score = reader.ReadScore();

                CheckTest03Score(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestDead()
        {
            PrepareImporterWithFile("GuitarPro5/TestDead.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckDead(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestGrace()
        {
            PrepareImporterWithFile("GuitarPro5/TestGrace.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckGrace(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestAccentuation()
        {
            PrepareImporterWithFile("GuitarPro5/TestAccentuations.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckAccentuation(score, true);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestHarmonics()
        {
            PrepareImporterWithFile("GuitarPro5/TestHarmonics.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckHarmonics(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestHammer()
        {
            PrepareImporterWithFile("GuitarPro5/TestHammer.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckHammer(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestBend()
        {
            PrepareImporterWithFile("GuitarPro5/TestBends.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckBend(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTremolo()
        {
            PrepareImporterWithFile("GuitarPro5/TestTremolo.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckTremolo(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestSlides()
        {
            PrepareImporterWithFile("GuitarPro5/TestSlides.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckSlides(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestVibrato()
        {
            PrepareImporterWithFile("GuitarPro5/TestVibrato.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckVibrato(score, true);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTrills()
        {
            PrepareImporterWithFile("GuitarPro5/TestTrills.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckTrills(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestOtherEffects()
        {
            PrepareImporterWithFile("GuitarPro5/TestOtherEffects.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckOtherEffects(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestFingering()
        {
            PrepareImporterWithFile("GuitarPro5/TestFingering.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckFingering(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStroke()
        {
            PrepareImporterWithFile("GuitarPro5/TestStrokes.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckStroke(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestTuplets()
        {
            PrepareImporterWithFile("GuitarPro5/TestTuplets.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckTuplets(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestRanges()
        {
            PrepareImporterWithFile("GuitarPro5/TestRanges.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckRanges(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestEffects()
        {
            PrepareImporterWithFile("GuitarPro5/Effects.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckEffects(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestSerenade()
        {
            PrepareImporterWithFile("GuitarPro5/Serenade.gp5", reader =>
            {
                var score = reader.ReadScore();// only Check reading
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestStrings()
        {
            PrepareImporterWithFile("GuitarPro5/TestStrings.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckStrings(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestKeySignatures()
        {
            PrepareImporterWithFile("GuitarPro5/TestKeySignatures.gp5", reader =>
            {
                var score = reader.ReadScore();
                CheckKeySignatures(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestChords()
        {
            PrepareImporterWithFile("GuitarPro5/TestChords.gp5", reader =>
            {
                var score = reader.ReadScore();

                CheckChords(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestColors()
        {
            PrepareImporterWithFile("GuitarPro5/Colors.gp5", reader =>
            {
                var score = reader.ReadScore();

                CheckColors(score);
                Render(score);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestCanon()
        {
            PrepareImporterWithFile("GuitarPro5/Canon.gp5", reader =>
            {
                var score = reader.ReadScore();

                Assert.AreEqual("Canon Rock", score.Title);
                Assert.AreEqual("", score.SubTitle);
                Assert.AreEqual("JerryC", score.Artist);
                Assert.AreEqual("", score.Album);
                Assert.AreEqual("", score.Words);
                Assert.AreEqual("JerryC", score.Music);
                Assert.AreEqual("", score.Copyright);
                Assert.AreEqual("", score.Tab);
                Assert.AreEqual("", score.Instructions);
                Assert.AreEqual("", score.Notices);
                Assert.AreEqual(224, score.MasterBars.Count);
                Assert.AreEqual(9, score.Tracks.Count);
                Assert.AreEqual("Guitar Player", score.Tracks[0].Name);
                Assert.AreEqual("Low Bassy Sound", score.Tracks[1].Name);
                Assert.AreEqual("High Soundy Thing", score.Tracks[2].Name);
                Assert.AreEqual("Second Guitar", score.Tracks[3].Name);
                Assert.AreEqual("Drums", score.Tracks[4].Name);
                Assert.AreEqual("Harmonizer", score.Tracks[5].Name);
                Assert.AreEqual("The clean guitar", score.Tracks[6].Name);
                Assert.AreEqual("Track 8", score.Tracks[7].Name);
                Assert.AreEqual("Percussion", score.Tracks[8].Name);
            });
        }
    }
}
