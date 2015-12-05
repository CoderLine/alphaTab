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
    public class Gp4ImporterTest : GpImporterTestBase
    {
        [TestMethod]
        public void TestScoreInfo()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/Test01.gp4");
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
        }

        [TestMethod]
        public void TestNotes()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/Test02.gp4");
            var score = reader.ReadScore();
            CheckTest02Score(score);
            Render(score);
        }

        [TestMethod]
        public void TestTimeSignatures()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/Test03.gp4");
            var score = reader.ReadScore();

            CheckTest03Score(score);
            Render(score);
        }

        [TestMethod]
        public void TestDead()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestDead.gp4");
            var score = reader.ReadScore();
            CheckDead(score);
            Render(score);
        }

        [TestMethod]
        public void TestGrace()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestGrace.gp4");
            var score = reader.ReadScore();
            CheckGrace(score);
            Render(score);
        }

        [TestMethod]
        public void TestAccentuation()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestAccentuations.gp4");
            var score = reader.ReadScore();
            CheckAccentuation(score, false);
            Render(score);
        }

        [TestMethod]
        public void TestHarmonics()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestHarmonics.gp4");
            var score = reader.ReadScore();
            CheckHarmonics(score);
            Render(score);
        }

        [TestMethod]
        public void TestHammer()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestHammer.gp4");
            var score = reader.ReadScore();
            CheckHammer(score);
            Render(score);
        }

        [TestMethod]
        public void TestBend()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestBends.gp4");
            var score = reader.ReadScore();
            CheckBend(score);
            Render(score);
        }

        [TestMethod]
        public void TestTremolo()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestTremolo.gp4");
            var score = reader.ReadScore();
            CheckTremolo(score);
            Render(score);
        }

        [TestMethod]
        public void TestSlides()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestSlides.gp4");
            var score = reader.ReadScore();
            CheckSlides(score);
            Render(score);
        }

        [TestMethod]
        public void TestVibrato()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestVibrato.gp4");
            var score = reader.ReadScore();
            CheckVibrato(score, true);
            Render(score);
        }

        [TestMethod]
        public void TestTrills()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestTrills.gp4");
            var score = reader.ReadScore();
            CheckTrills(score);
            Render(score);
        }

        [TestMethod]
        public void TestOtherEffects()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestOtherEffects.gp4");
            var score = reader.ReadScore();
            CheckOtherEffects(score);
            Render(score);
        }

        [TestMethod]
        public void TestFingering()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestFingering.gp4");
            var score = reader.ReadScore();
            CheckFingering(score);
            Render(score);
        }

        [TestMethod]
        public void TestStroke()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestStrokes.gp4");
            var score = reader.ReadScore();
            CheckStroke(score);
            Render(score);
        }

        [TestMethod]
        public void TestTuplets()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestTuplets.gp4");
            var score = reader.ReadScore();
            CheckTuplets(score);
            Render(score);
        }

        [TestMethod]
        public void TestRanges()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestRanges.gp4");
            var score = reader.ReadScore();
            CheckRanges(score);
            Render(score);
        }

        [TestMethod]
        public void TestEffects()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/Effects.gp4");
            var score = reader.ReadScore();
            CheckEffects(score);
            Render(score);
        }

        [TestMethod]
        public void TestStrings()
        {
            var reader = PrepareImporterWithFile("GuitarPro4/TestStrings.gp4");
            var score = reader.ReadScore();
            CheckStrings(score);
            Render(score);
        }

    }
}
