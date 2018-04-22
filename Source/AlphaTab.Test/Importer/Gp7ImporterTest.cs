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

using System;
using System.Linq;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class Gp7ImporterTest : GpImporterTestBase
    {
        internal byte[] Load(string name)
        {
            const string path = "TestFiles/";
            return TestPlatform.LoadFile(path + name);
        }
        
        internal Gp7Importer PrepareGp7ImporterWithBytes(string name)
        {
            return PrepareGp7ImporterWithBytes(Load(name));
        }

        internal Gp7Importer PrepareGp7ImporterWithBytes(byte[] buffer)
        {
            var readerBase = new Gp7Importer();
            readerBase.Init(ByteBuffer.FromBuffer(buffer));
            return readerBase;
        }

        [TestMethod]
        public void TestScoreInfo()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/Test01.gp");
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
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/Test02.gp");
            var score = reader.ReadScore();
            CheckTest02Score(score);
            Render(score);
        }

        [TestMethod]
        public void TestTimeSignatures()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/Test03.gp");
            var score = reader.ReadScore();

            CheckTest03Score(score);
            Render(score);
        }

        [TestMethod]
        public void TestDead()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestDead.gp");
            var score = reader.ReadScore();
            CheckDead(score);
            Render(score);
        }

        [TestMethod]
        public void TestGrace()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestGrace.gp");
            var score = reader.ReadScore();
            CheckGrace(score);
            Render(score);
        }

        [TestMethod]
        public void TestAccentuation()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestAccentuations.gp");
            var score = reader.ReadScore();
            CheckAccentuation(score, true);
            Render(score);
        }

        [TestMethod]
        public void TestHarmonics()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestHarmonics.gp");
            var score = reader.ReadScore();
            CheckHarmonics(score);
            Render(score);
        }

        [TestMethod]
        public void TestHammer()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestHammer.gp");
            var score = reader.ReadScore();
            CheckHammer(score);
            Render(score);
        }

        [TestMethod]
        [Ignore("appveyor fails for some reason, locally everything is fine?")]
        public void TestBend()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestBends.gp");
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
        }

        [TestMethod]
        [Ignore("appveyor fails for some reason, locally everything is fine?")]
        public void TestBendAdvanced()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/BendsAdvanced.gp");
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
            Assert.AreEqual(3, note.BendPoints.Count);
            Assert.AreEqual(0, note.BendPoints[0].Offset);
            Assert.AreEqual(4, note.BendPoints[0].Value);
            Assert.AreEqual(7, note.BendPoints[1].Offset);
            Assert.AreEqual(5, note.BendPoints[1].Value);
            Assert.AreEqual(15, note.BendPoints[2].Offset);
            Assert.AreEqual(5, note.BendPoints[2].Value);

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
            Assert.AreEqual(3, note.BendPoints.Count);
            Assert.AreEqual(0, note.BendPoints[0].Offset);
            Assert.AreEqual(8, note.BendPoints[0].Value);
            Assert.AreEqual(7, note.BendPoints[1].Offset);
            Assert.AreEqual(10, note.BendPoints[1].Value);
            Assert.AreEqual(16, note.BendPoints[2].Offset);
            Assert.AreEqual(10, note.BendPoints[2].Value);

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
        }

        [TestMethod]
        [Ignore("appveyor fails for some reason, locally everything is fine?")]
        public void TestTremolo()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestTremolo.gp");
            var score = reader.ReadScore();

            Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[0].Value);

            Assert.AreEqual(30, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[1].Value);

            Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
            Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[2].Value);


            Assert.AreEqual(3, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[0].Value);

            // in case of dive the middle point is already on an earlier position
            Assert.AreEqual(15, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
            Assert.AreEqual(-2, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[1].Value);

            Assert.AreEqual(60, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
            Assert.AreEqual(0, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[2].Value);

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
        }

        [TestMethod]
        public void TestSlides()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestSlides.gp");
            var score = reader.ReadScore();
            CheckSlides(score);
            Render(score);
        }

        [TestMethod]
        public void TestVibrato()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestVibrato.gp");
            var score = reader.ReadScore();
            CheckVibrato(score, true);
            Render(score);
        }

        [TestMethod]
        public void TestTrills()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestTrills.gp");
            var score = reader.ReadScore();
            CheckTrills(score);
            Render(score);
        }

        [TestMethod]
        public void TestOtherEffects()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestOtherEffects.gp");
            var score = reader.ReadScore();
            CheckOtherEffects(score, true /* GPX doesn't support instrument changes */);
            Render(score);
        }

        [TestMethod]
        public void TestFingering()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestFingering.gp");
            var score = reader.ReadScore();
            CheckFingering(score);
            Render(score);
        }

        [TestMethod]
        public void TestStroke()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestStrokes.gp");
            var score = reader.ReadScore();
            CheckStroke(score);
            Render(score);
        }

        [TestMethod]
        public void TestTuplets()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestTuplets.gp");
            var score = reader.ReadScore();
            CheckTuplets(score);
            Render(score);
        }

        [TestMethod]
        public void TestRanges()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestRanges.gp");
            var score = reader.ReadScore();
            CheckRanges(score);
            Render(score);
        }

        [TestMethod]
        public void TestEffects()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/Effects.gp");
            var score = reader.ReadScore();
            CheckEffects(score);
            Render(score);
        }

        [TestMethod]
        public void TestSerenade()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/Serenade.gp");
            var score = reader.ReadScore();// only Check reading
            Render(score);
        }

        [TestMethod]
        public void TestStrings()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestStrings.gp");
            var score = reader.ReadScore();
            CheckStrings(score);
            Render(score);
        }

        [TestMethod]
        public void TestKeySignatures()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestKeySignatures.gp");
            var score = reader.ReadScore();
            CheckKeySignatures(score);
            Render(score);
        }

        [TestMethod]
        public void TestChords()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/TestChords.gp");
            var score = reader.ReadScore();
            CheckChords(score);
            Render(score);
        }



        [TestMethod]
        public void TestColors()
        {
            var reader = PrepareGp7ImporterWithBytes("GuitarPro7/Colors.gp");
            var score = reader.ReadScore();

            CheckColors(score);
            Render(score);
        }
    }
}
