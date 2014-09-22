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
using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class Gp3ImporterTest : GpImporterTestBase
    {
        [TestMethod]
        public void TestScoreInfo()
        {
            var reader = PrepareImporterWithFile("Test01.gp3");
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
        }

        [TestMethod]
        public void TestNotes()
        {
            var reader = PrepareImporterWithFile("Test02.gp3");
            var score = reader.ReadScore();
            CheckTest02Score(score);
        }

        [TestMethod]
        public void TestTimeSignatures()
        {
            var reader = PrepareImporterWithFile("Test03.gp3");
            var score = reader.ReadScore();

            CheckTest03Score(score);
        }

        [TestMethod]
        public void TestDead()
        {
            var reader = PrepareImporterWithFile("TestDead.gp3");
            var score = reader.ReadScore();
            CheckDead(score);
        }

        [TestMethod]
        public void TestAccentuation()
        {
            var reader = PrepareImporterWithFile("TestAccentuations.gp3");
            var score = reader.ReadScore();

            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].IsGhost);
            // it seems accentuation is handled as Forte Fortissimo
            Assert.AreEqual(DynamicValue.FFF, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].Dynamic);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[3].Notes[0].IsLetRing);
        }

        [TestMethod]
        public void TestGuitarPro3Harmonics() 
        {
            // TODO: Find out about GP3 harmonics!
            //var reader = PrepareImporterWithFile("TestHarmonics.gp3");
            //var score = reader.ReadScore();
            
            //Assert.AreEqual(HarmonicType.Natural, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].HarmonicType);
            //Assert.AreEqual(HarmonicType.Artificial, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].HarmonicType);
        }

        [TestMethod]
        public void TestHammer()
        {
            var reader = PrepareImporterWithFile("TestHammer.gp3");
            var score = reader.ReadScore();
            CheckHammer(score);
        }

        [TestMethod]
        public void TestBend()
        {
            var reader = PrepareImporterWithFile("TestBends.gp3");
            var score = reader.ReadScore();
            CheckBend(score);
        }

        [TestMethod]
        public void TestSlides()
        {
            var reader = PrepareImporterWithFile("TestSlides.gp3");
            var score = reader.ReadScore();

            Assert.AreEqual(SlideType.Shift, score.Tracks[0].Bars[0].Voices[0].Beats[0].GetNoteOnString(5).SlideType);
            Assert.AreEqual(SlideType.Shift, score.Tracks[0].Bars[0].Voices[0].Beats[2].GetNoteOnString(2).SlideType);
        }

        [TestMethod]
        public void TestGuitarPro3Vibrato() 
        {
            // TODO: Check why this vibrato is not recognized
            var reader = PrepareImporterWithFile("TestVibrato.gp3");
            var score = reader.ReadScore();
            CheckVibrato(score, false);
        }

        [TestMethod]
        public void TestOtherEffects()
        {
            var reader = PrepareImporterWithFile("TestOtherEffects.gp3");
            var score = reader.ReadScore();

            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[2].Tap);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[3].Slap);

            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[0].Pop);
            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[1].FadeIn);

            Assert.IsTrue(score.Tracks[0].Bars[3].Voices[0].Beats[0].HasChord);
            Assert.AreEqual("C", score.Tracks[0].Bars[3].Voices[0].Beats[0].Chord.Name);
            Assert.AreEqual("Text", score.Tracks[0].Bars[3].Voices[0].Beats[1].Text);
            Assert.IsTrue(score.Tracks[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Tempo) != null);
            Assert.AreEqual(120.0, score.Tracks[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Tempo).Value);
            Assert.IsTrue(score.Tracks[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Instrument) != null);
            Assert.AreEqual(25.0, score.Tracks[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Instrument).Value);
        }

        [TestMethod]
        public void TestStroke()
        {
            var reader = PrepareImporterWithFile("TestStrokes.gp3");
            var score = reader.ReadScore();

            Assert.AreEqual(BrushType.BrushDown, score.Tracks[0].Bars[0].Voices[0].Beats[0].BrushType);
            Assert.AreEqual(BrushType.BrushUp, score.Tracks[0].Bars[0].Voices[0].Beats[1].BrushType);
        }

        [TestMethod]
        public void TestTuplets()
        {
            var reader = PrepareImporterWithFile("TestTuplets.gp3");
            var score = reader.ReadScore();
            CheckTuplets(score);
        }

        [TestMethod]
        public void TestRanges()
        {
            var reader = PrepareImporterWithFile("TestRanges.gp3");
            var score = reader.ReadScore();

            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[1].Notes[0].IsLetRing);
            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[2].Notes[0].IsLetRing);
            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[3].Notes[0].IsLetRing);
            Assert.IsTrue(score.Tracks[0].Bars[2].Voices[0].Beats[0].Notes[0].IsLetRing);
        }

        [TestMethod]
        public void TestEffects()
        {
            var reader = PrepareImporterWithFile("Effects.gp3");
            var score = reader.ReadScore();
            CheckEffects(score);
        }

        [TestMethod]
        public void TestStrings()
        {
            var reader = PrepareImporterWithFile("TestStrings.gp3");
            var score = reader.ReadScore();
            CheckStrings(score);
        }
    }
}
