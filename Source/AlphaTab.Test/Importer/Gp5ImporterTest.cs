/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
        [TestMethod]
        public void TestScoreInfo()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/Test01.gp5");
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
        }

        [TestMethod]
        public void TestNotes()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/Test02.gp5");
            var score = reader.ReadScore();
            CheckTest02Score(score);
            Render(score);
        }

        [TestMethod]
        public void TestTimeSignatures()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/Test03.gp5");
            var score = reader.ReadScore();

            CheckTest03Score(score);
            Render(score);
        }

        [TestMethod]
        public void TestDead()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestDead.gp5");
            var score = reader.ReadScore();
            CheckDead(score);
            Render(score);
        }

        [TestMethod]
        public void TestGrace()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestGrace.gp5");
            var score = reader.ReadScore();
            CheckGrace(score);
            Render(score);
        }

        [TestMethod]
        public void TestAccentuation()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestAccentuations.gp5");
            var score = reader.ReadScore();
            CheckAccentuation(score, true);
            Render(score);
        }

        [TestMethod]
        public void TestHarmonics()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestHarmonics.gp5");
            var score = reader.ReadScore();
            CheckHarmonics(score);
            Render(score);
        }

        [TestMethod]
        public void TestHammer()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestHammer.gp5");
            var score = reader.ReadScore();
            CheckHammer(score);
            Render(score);
        }

        [TestMethod]
        public void TestBend()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestBends.gp5");
            var score = reader.ReadScore();
            CheckBend(score);
            Render(score);
        }

        [TestMethod]
        public void TestTremolo()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestTremolo.gp5");
            var score = reader.ReadScore();
            CheckTremolo(score);
            Render(score);
        }

        [TestMethod]
        public void TestSlides()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestSlides.gp5");
            var score = reader.ReadScore();
            CheckSlides(score);
            Render(score);
        }

        [TestMethod]
        public void TestVibrato()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestVibrato.gp5");
            var score = reader.ReadScore();
            CheckVibrato(score, true);
            Render(score);
        }

        [TestMethod]
        public void TestTrills()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestTrills.gp5");
            var score = reader.ReadScore();
            CheckTrills(score);
            Render(score);
        }

        [TestMethod]
        public void TestOtherEffects()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestOtherEffects.gp5");
            var score = reader.ReadScore();
            CheckOtherEffects(score);
            Render(score);
        }

        [TestMethod]
        public void TestFingering()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestFingering.gp5");
            var score = reader.ReadScore();
            CheckFingering(score);
            Render(score);
        }

        [TestMethod]
        public void TestStroke()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestStrokes.gp5");
            var score = reader.ReadScore();
            CheckStroke(score);
            Render(score);
        }

        [TestMethod]
        public void TestTuplets()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestTuplets.gp5");
            var score = reader.ReadScore();
            CheckTuplets(score);
            Render(score);
        }

        [TestMethod]
        public void TestRanges()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestRanges.gp5");
            var score = reader.ReadScore();
            CheckRanges(score);
            Render(score);
        }

        [TestMethod]
        public void TestEffects()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/Effects.gp5");
            var score = reader.ReadScore();
            CheckEffects(score);
            Render(score);
        }

        [TestMethod]
        public void TestSerenade()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/Serenade.gp5");
            var score = reader.ReadScore();// only Check reading
            Render(score);
        }

        [TestMethod]
        public void TestStrings()
        {
            var reader = PrepareImporterWithFile("GuitarPro5/TestStrings.gp5");
            var score = reader.ReadScore();
            CheckStrings(score);
            Render(score);
        }
    }
}
