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
using System;
using System.Diagnostics;
using System.IO;
using AlphaTab.Importer;
using AlphaTab.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class GpxImporterTest : GpImporterTestBase
    {
        internal byte[] Load(string name)
        {
            const string path = "TestFiles/";
            return Environment.FileLoaders["default"]().LoadBinary(Path.Combine(path, name));
        }
        
        internal GpxImporter PrepareImporterWithFile(string name)
        {
            return PrepareImporterWithBytes(Load(name));
        }

        internal GpxImporter PrepareImporterWithBytes(byte[] buffer)
        {
            var readerBase = new GpxImporter();
            readerBase.Init(new StreamWrapper(new MemoryStream(buffer)));
            return readerBase;
        }

        [TestMethod]
        public void TestFileSystemCompressed()
        {
            GpxFileSystem fileSystem = new GpxFileSystem();
            fileSystem.Load(new StreamWrapper(new MemoryStream(Load("GuitarPro6/Compressed.gpx"))));

            string[] names = {"score.gpif", "misc.xml", "BinaryStylesheet", "PartConfiguration", "LayoutConfiguration"};
            int[] sizes = {8488, 130, 12204, 20, 12};

            for (int i = 0; i < fileSystem.Files.Count; i++)
            {
                var file = fileSystem.Files[i];
                Console.WriteLine("{0} - {1}", file.FileName, file.FileSize);
                Assert.AreEqual(names[i], file.FileName);
                Assert.AreEqual(sizes[i], file.FileSize);
            }
        }

        [TestMethod]
        public void TestScoreInfo()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/Test01.gpx");
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
        }

        [TestMethod]
        public void TestNotes()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/Test02.gpx");
            var score = reader.ReadScore();
            CheckTest02Score(score);
            Render(score);
        }

        [TestMethod]
        public void TestTimeSignatures()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/Test03.gpx");
            var score = reader.ReadScore();

            CheckTest03Score(score);
            Render(score);
        }

        [TestMethod]
        public void TestDead()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestDead.gpx");
            var score = reader.ReadScore();
            CheckDead(score);
            Render(score);
        }

        [TestMethod]
        public void TestGrace()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestGrace.gpx");
            var score = reader.ReadScore();
            CheckGrace(score);
            Render(score);
        }

        [TestMethod]
        public void TestAccentuation()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestAccentuations.gpx");
            var score = reader.ReadScore();
            CheckAccentuation(score, true);
            Render(score);
        }

        [TestMethod]
        public void TestHarmonics()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestHarmonics.gpx");
            var score = reader.ReadScore();
            CheckHarmonics(score);
            Render(score);
        }

        [TestMethod]
        public void TestHammer()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestHammer.gpx");
            var score = reader.ReadScore();
            CheckHammer(score);
            Render(score);
        }

        [TestMethod]
        public void TestBend()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestBends.gpx");
            var score = reader.ReadScore();

            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[0].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[1].Offset);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[1].Value);

            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[0].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[1].Offset);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[1].Value);

            Assert.AreEqual(3, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Value);

            Assert.AreEqual(0, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[0].Value);

            Assert.AreEqual(30, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[1].Offset);
            Assert.AreEqual(12, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[1].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[2].Offset);
            Assert.AreEqual(6, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].BendPoints[2].Value);
            Render(score);
        }

        [TestMethod]
        public void TestTremolo()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestTremolo.gpx");
            var score = reader.ReadScore();

            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[0].Value);

            Assert.AreEqual(30, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[1].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[2].Value);


            Assert.AreEqual(2, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[0].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[1].Value);


            Assert.AreEqual(3, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[0].Value);

            Assert.AreEqual(30, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[1].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[2].Value);

            Assert.AreEqual(4, score.Tracks[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[0].Value);

            Assert.AreEqual(15, score.Tracks[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
            Assert.AreEqual(-12, score.Tracks[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[1].Value);

            Assert.AreEqual(30, score.Tracks[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
            Assert.AreEqual(-12, score.Tracks[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[2].Value);

            Assert.AreEqual(45, score.Tracks[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[3].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[3].Voices[0].Beats[0].WhammyBarPoints[3].Value);

            Render(score);
        }

        [TestMethod]
        public void TestSlides()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestSlides.gpx");
            var score = reader.ReadScore();
            CheckSlides(score);
            Render(score);
        }

        [TestMethod]
        public void TestVibrato()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestVibrato.gpx");
            var score = reader.ReadScore();
            CheckVibrato(score, true);
            Render(score);
        }

        [TestMethod]
        public void TestTrills()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestTrills.gpx");
            var score = reader.ReadScore();
            CheckTrills(score);
            Render(score);
        }

        [TestMethod]
        public void TestOtherEffects()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestOtherEffects.gpx");
            var score = reader.ReadScore();
            CheckOtherEffects(score, true /* GPX doesn't support instrument changes */);
            Render(score);
        }

        [TestMethod]
        public void TestFingering()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestFingering.gpx");
            var score = reader.ReadScore();
            CheckFingering(score);
            Render(score);
        }

        [TestMethod]
        public void TestStroke()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestStrokes.gpx");
            var score = reader.ReadScore();
            CheckStroke(score);
            Render(score);
        }

        [TestMethod]
        public void TestTuplets()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestTuplets.gpx");
            var score = reader.ReadScore();
            CheckTuplets(score);
            Render(score);
        }

        [TestMethod]
        public void TestRanges()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestRanges.gpx");
            var score = reader.ReadScore();
            CheckRanges(score);
            Render(score);
        }

        [TestMethod]
        public void TestEffects()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/Effects.gpx");
            var score = reader.ReadScore();
            CheckEffects(score);
            Render(score);
        }

        [TestMethod]
        public void TestSerenade()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/Serenade.gpx");
            var score = reader.ReadScore();// only Check reading
            Render(score);
        }

        [TestMethod]
        public void TestStrings()
        {
            var reader = PrepareImporterWithFile("GuitarPro6/TestStrings.gpx");
            var score = reader.ReadScore();
            CheckStrings(score);
            Render(score);
        }
    }
}
