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
using System.IO;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    public class GpImporterTestBase
    {
        internal Gp3To5Importer PrepareImporterWithFile(string name)
        {
            const string path = "TestFiles/GuitarPro";
            var buffer = Environment.FileLoaders["default"]().LoadBinary(Path.Combine(path, name));
            return PrepareImporterWithBytes(buffer);
        }

        internal Gp3To5Importer PrepareImporterWithBytes(byte[] buffer)
        {
            var readerBase = new Gp3To5Importer();
            readerBase.Init(new StreamWrapper(new MemoryStream(buffer)));
            return readerBase;
        }

        #region Some general checks for common files

        protected void CheckTest02Score(Score score)
        {
            // Whole Notes
            int beat = 0;

            foreach (var duration in Enum.GetValues(typeof(Duration)))
            {
                Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Notes[0].Fret);
                Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Notes[0].String);
                Assert.AreEqual(duration, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Duration);
                beat++;

                Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Notes[0].Fret);
                Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Notes[0].String);
                Assert.AreEqual(duration, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Duration);
                beat++;

                Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Notes[0].Fret);
                Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Notes[0].String);
                Assert.AreEqual(duration, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Duration);
                beat++;

                Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Notes[0].Fret);
                Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Notes[0].String);
                Assert.AreEqual(duration, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Duration);
                beat++;

                Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[beat].IsRest);
                Assert.AreEqual(duration, score.Tracks[0].Bars[0].Voices[0].Beats[beat].Duration);
                beat++;
            }
        }


        protected void CheckTest03Score(Score score)
        {
            Assert.AreEqual(4, score.MasterBars[0].TimeSignatureNumerator);
            Assert.AreEqual(4, score.MasterBars[0].TimeSignatureDenominator);

            Assert.AreEqual(3, score.MasterBars[1].TimeSignatureNumerator);
            Assert.AreEqual(4, score.MasterBars[1].TimeSignatureDenominator);

            Assert.AreEqual(2, score.MasterBars[2].TimeSignatureNumerator);
            Assert.AreEqual(4, score.MasterBars[2].TimeSignatureDenominator);

            Assert.AreEqual(1, score.MasterBars[3].TimeSignatureNumerator);
            Assert.AreEqual(4, score.MasterBars[3].TimeSignatureDenominator);

            Assert.AreEqual(20, score.MasterBars[4].TimeSignatureNumerator);
            Assert.AreEqual(32, score.MasterBars[4].TimeSignatureDenominator);
        }

        protected void CheckDead(Score score)
        {
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].IsDead);
            Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].String);

            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].IsDead);
            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].String);

            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes[0].IsDead);
            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes[0].String);

            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[3].Notes[0].IsDead);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[3].Notes[0].String);
        }

        protected void CheckGrace(Score score)
        {
            Assert.AreEqual(GraceType.BeforeBeat, score.Tracks[0].Bars[0].Voices[0].Beats[0].GraceType);
            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].Fret);
            Assert.AreEqual(Duration.ThirtySecond, score.Tracks[0].Bars[0].Voices[0].Beats[0].Duration);
            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].Fret);
            Assert.AreEqual(Duration.Quarter, score.Tracks[0].Bars[0].Voices[0].Beats[1].Duration);

            Assert.AreEqual(GraceType.BeforeBeat, score.Tracks[0].Bars[0].Voices[0].Beats[2].GraceType);
            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes[0].Fret);
            Assert.AreEqual(Duration.ThirtySecond, score.Tracks[0].Bars[0].Voices[0].Beats[2].Duration);
            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[3].Notes[0].Fret);
            Assert.AreEqual(Duration.Quarter, score.Tracks[0].Bars[0].Voices[0].Beats[3].Duration);
        }

        protected void CheckAccentuation(Score score, bool includeHeavy)
        {
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].IsGhost);
            Assert.AreEqual(AccentuationType.Normal, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].Accentuated);
            if (includeHeavy)
            {
                Assert.AreEqual(AccentuationType.Heavy, score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes[0].Accentuated);
            }
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[3].Notes[0].IsLetRing);
        }

        protected void CheckHarmonics(Score score)
        {
            Assert.AreEqual(HarmonicType.Natural, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].HarmonicType);
            Assert.AreEqual(HarmonicType.Artificial, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].HarmonicType);
            Assert.AreEqual(HarmonicType.Tap, score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes[0].HarmonicType);
            Assert.AreEqual(HarmonicType.Semi, score.Tracks[0].Bars[0].Voices[0].Beats[3].Notes[0].HarmonicType);
            Assert.AreEqual(HarmonicType.Pinch, score.Tracks[0].Bars[0].Voices[0].Beats[4].Notes[0].HarmonicType);
            // TODO: Harmonic Values
        }

        protected void CheckHammer(Score score)
        {
            Assert.AreEqual(false, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].IsHammerPullOrigin);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[1].IsHammerPullOrigin);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[2].IsHammerPullOrigin);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[3].IsHammerPullOrigin);

            Assert.IsNull(score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].HammerPullOrigin);
            Assert.IsNotNull(score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[1].HammerPullOrigin);
            Assert.IsNotNull(score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[2].HammerPullOrigin);
            Assert.IsNotNull(score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[3].HammerPullOrigin);

            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].IsHammerPullOrigin);
            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[1].Notes[0].IsHammerPullOrigin);
            Assert.IsNotNull(score.Tracks[0].Bars[1].Voices[0].Beats[2].Notes[0].HammerPullOrigin);
        }

        protected void CheckBend(Score score)
        {
            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[0].Value);

            Assert.AreEqual(15, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[1].Offset);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[1].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[2].Offset);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].BendPoints[2].Value);

            Assert.AreEqual(7, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints.Count);


            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[0].Value);

            Assert.AreEqual(10, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[1].Offset);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[1].Value);

            Assert.AreEqual(20, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[2].Offset);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[2].Value);

            Assert.AreEqual(30, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[3].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[3].Value);

            Assert.AreEqual(40, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[4].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[4].Value);

            Assert.AreEqual(50, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[5].Offset);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[5].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[6].Offset);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].BendPoints[6].Value);
        }

        protected void CheckTremolo(Score score)
        {
            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[0].Value);

            Assert.AreEqual(30, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[1].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].WhammyBarPoints[2].Value);

            Assert.AreEqual(3, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[0].Value);

            Assert.AreEqual(45, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[1].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[1].Voices[0].Beats[0].WhammyBarPoints[2].Value);

            Assert.AreEqual(3, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints.Count);

            Assert.AreEqual(0, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[0].Offset);
            Assert.AreEqual(0, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[0].Value);

            Assert.AreEqual(45, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[1].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[1].Value);

            Assert.AreEqual(60, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[2].Offset);
            Assert.AreEqual(-4, score.Tracks[0].Bars[2].Voices[0].Beats[0].WhammyBarPoints[2].Value);

        }

        protected void CheckSlides(Score score)
        {
            Assert.AreEqual(SlideType.Legato, score.Tracks[0].Bars[0].Voices[0].Beats[0].GetNoteOnString(5).SlideType);
            Assert.AreEqual(SlideType.Shift, score.Tracks[0].Bars[0].Voices[0].Beats[2].GetNoteOnString(2).SlideType);
            Assert.AreEqual(SlideType.IntoFromBelow, score.Tracks[0].Bars[1].Voices[0].Beats[0].GetNoteOnString(5).SlideType);
            Assert.AreEqual(SlideType.IntoFromAbove, score.Tracks[0].Bars[1].Voices[0].Beats[1].GetNoteOnString(5).SlideType);
            Assert.AreEqual(SlideType.OutDown, score.Tracks[0].Bars[1].Voices[0].Beats[2].GetNoteOnString(5).SlideType);
            Assert.AreEqual(SlideType.OutUp, score.Tracks[0].Bars[1].Voices[0].Beats[3].GetNoteOnString(5).SlideType);
        }

        protected void CheckStrings(Score score)
        {
            Assert.AreEqual(6, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes.Count);
            Assert.AreEqual(6, score.Tracks[0].Bars[0].Voices[0].Beats[0].GetNoteOnString(1).Fret);
            Assert.AreEqual(5, score.Tracks[0].Bars[0].Voices[0].Beats[0].GetNoteOnString(2).Fret);
            Assert.AreEqual(4, score.Tracks[0].Bars[0].Voices[0].Beats[0].GetNoteOnString(3).Fret);
            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[0].GetNoteOnString(4).Fret);
            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[0].GetNoteOnString(5).Fret);
            Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[0].GetNoteOnString(6).Fret);
        }

        protected void CheckVibrato(Score score, bool checkNotes)
        {
            if (checkNotes)
            {
                Assert.AreEqual(VibratoType.Slight, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].Vibrato);
                Assert.AreEqual(VibratoType.Slight, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].Vibrato);
            }

            Assert.AreEqual(VibratoType.Slight, score.Tracks[0].Bars[0].Voices[0].Beats[2].Vibrato);
            Assert.AreEqual(VibratoType.Slight, score.Tracks[0].Bars[0].Voices[0].Beats[3].Vibrato);
        }

        protected void CheckTrills(Score score)
        {
            Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].TrillFret);
            Assert.AreEqual(Duration.Sixteenth, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].TrillSpeed);

            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[1].IsTremolo);
            Assert.AreEqual(Duration.ThirtySecond, score.Tracks[0].Bars[0].Voices[0].Beats[1].TremoloSpeed);

            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[2].IsTremolo);
            Assert.AreEqual(Duration.Sixteenth, score.Tracks[0].Bars[0].Voices[0].Beats[2].TremoloSpeed);

            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[3].IsTremolo);
            Assert.AreEqual(Duration.Eighth, score.Tracks[0].Bars[0].Voices[0].Beats[3].TremoloSpeed);
        }

        protected void CheckOtherEffects(Score score)
        {
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].IsPalmMute);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].IsStaccato);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[2].Tap);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[3].Slap);

            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[0].Pop);
            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[1].FadeIn);

            Assert.IsTrue(score.Tracks[0].Bars[3].Voices[0].Beats[0].HasChord);
            Assert.AreEqual("C", score.Tracks[0].Bars[3].Voices[0].Beats[0].Chord.Name);
            Assert.AreEqual("Text", score.Tracks[0].Bars[3].Voices[0].Beats[1].Text);
            Assert.IsTrue(score.MasterBars[4].IsDoubleBar);
            Assert.IsTrue(score.Tracks[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Tempo) != null);
            Assert.AreEqual(120.0, score.Tracks[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Tempo).Value);
            Assert.IsTrue(score.Tracks[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Instrument) != null);
            Assert.AreEqual(25.0, score.Tracks[0].Bars[4].Voices[0].Beats[0].GetAutomation(AutomationType.Instrument).Value);
        }

        protected void CheckFingering(Score score)
        {
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].IsFingering);
            Assert.AreEqual(Fingers.Thumb, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.IndexFinger, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.MiddleFinger, score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.AnnularFinger, score.Tracks[0].Bars[0].Voices[0].Beats[3].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.LittleFinger, score.Tracks[0].Bars[0].Voices[0].Beats[4].Notes[0].LeftHandFinger);
            Assert.AreEqual(Fingers.Thumb, score.Tracks[0].Bars[0].Voices[0].Beats[5].Notes[0].RightHandFinger);
            Assert.AreEqual(Fingers.IndexFinger, score.Tracks[0].Bars[0].Voices[0].Beats[6].Notes[0].RightHandFinger);
            Assert.AreEqual(Fingers.MiddleFinger, score.Tracks[0].Bars[0].Voices[0].Beats[7].Notes[0].RightHandFinger);
            Assert.AreEqual(Fingers.AnnularFinger, score.Tracks[0].Bars[0].Voices[0].Beats[8].Notes[0].RightHandFinger);
            Assert.AreEqual(Fingers.LittleFinger, score.Tracks[0].Bars[0].Voices[0].Beats[9].Notes[0].RightHandFinger);
        }

        protected void CheckStroke(Score score)
        {
            Assert.AreEqual(BrushType.BrushDown, score.Tracks[0].Bars[0].Voices[0].Beats[0].BrushType);
            Assert.AreEqual(BrushType.BrushUp, score.Tracks[0].Bars[0].Voices[0].Beats[1].BrushType);
            Assert.AreEqual(PickStrokeType.Up, score.Tracks[0].Bars[0].Voices[0].Beats[2].PickStroke);
            Assert.AreEqual(PickStrokeType.Down, score.Tracks[0].Bars[0].Voices[0].Beats[3].PickStroke);
        }

        protected void CheckTuplets(Score score)
        {
            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[0].TupletNumerator);
            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[1].TupletNumerator);
            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[2].TupletNumerator);

            Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats[0].TupletNumerator);
            Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats[1].TupletNumerator);
            Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats[2].TupletNumerator);
            Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats[3].TupletNumerator);
            Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats[4].TupletNumerator);
        }

        protected void CheckRanges(Score score)
        {
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].IsPalmMute);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].IsPalmMute);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes[0].IsPalmMute);
            Assert.IsTrue(score.Tracks[0].Bars[0].Voices[0].Beats[3].Notes[0].IsPalmMute);
            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].IsPalmMute);
            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].IsPalmMute);

            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[1].Notes[0].IsLetRing);
            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[2].Notes[0].IsLetRing);
            Assert.IsTrue(score.Tracks[0].Bars[1].Voices[0].Beats[3].Notes[0].IsLetRing);
            Assert.IsTrue(score.Tracks[0].Bars[2].Voices[0].Beats[0].Notes[0].IsLetRing);
        }

        protected void CheckEffects(Score score)
        {
            // just check if reading works
            Assert.IsTrue(true);
        }

        #endregion
    }
}
