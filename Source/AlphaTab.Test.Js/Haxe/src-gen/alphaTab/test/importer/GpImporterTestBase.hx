package alphaTab.test.importer;

using system.HaxeExtensions;
class GpImporterTestBase
{
    public function PrepareImporterWithFile(name : system.CsString) : alphaTab.importer.Gp3To5Importer 
    {
        var path : system.CsString = "TestFiles/";
        var buffer : system.ByteArray = alphaTab.test.TestPlatform.LoadFile(path + name);
        return PrepareImporterWithBytes(buffer);

    }

    public function PrepareImporterWithBytes(buffer : system.ByteArray) : alphaTab.importer.Gp3To5Importer 
    {
        var readerBase : alphaTab.importer.Gp3To5Importer = new alphaTab.importer.Gp3To5Importer();
        readerBase.Init(alphaTab.io.ByteBuffer.FromBuffer(buffer));
        return readerBase;

    }

    private function CheckTest02Score(score : alphaTab.model.Score) : Void 
    {
        // Whole Notes
        var beat : system.Int32 = 0;
        var durationsInFile : system.FixedArray<alphaTab.model.Duration> = [alphaTab.model.Duration.Whole, alphaTab.model.Duration.Half, alphaTab.model.Duration.Quarter, alphaTab.model.Duration.Eighth, alphaTab.model.Duration.Sixteenth, alphaTab.model.Duration.ThirtySecond, alphaTab.model.Duration.SixtyFourth];
        for (duration in durationsInFile)
        {
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
            alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
            alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
            alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
            alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).IsRest);
            alphaTab.test.Assert.AreEqual_T1_T22(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
        }
    }

    private function CheckTest03Score(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.MasterBars.get_Item(0).TimeSignatureNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.MasterBars.get_Item(0).TimeSignatureDenominator);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.MasterBars.get_Item(1).TimeSignatureNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.MasterBars.get_Item(1).TimeSignatureDenominator);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.MasterBars.get_Item(2).TimeSignatureNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.MasterBars.get_Item(2).TimeSignatureDenominator);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.get_Item(3).TimeSignatureNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.MasterBars.get_Item(3).TimeSignatureDenominator);
        alphaTab.test.Assert.AreEqual_T1_T22(20, score.MasterBars.get_Item(4).TimeSignatureNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(32, score.MasterBars.get_Item(4).TimeSignatureDenominator);
    }

    private function CheckDead(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsDead);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).String);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsDead);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).String);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).IsDead);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).String);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsDead);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).String);
    }

    private function CheckGrace(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.GraceType.BeforeBeat, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GraceType);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.ThirtySecond, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Duration);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Quarter, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Duration);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.GraceType.BeforeBeat, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).GraceType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.ThirtySecond, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Duration);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Quarter, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Duration);
    }

    private function CheckAccentuation(score : alphaTab.model.Score, includeHeavy : system.Boolean) : Void 
    {
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsGhost);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.AccentuationType.Normal, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).Accentuated);
        if (includeHeavy)
        {
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.AccentuationType.Heavy, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).Accentuated);
        }
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsLetRing);
    }

    private function CheckHarmonics(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Natural, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).HarmonicType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Artificial, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).HarmonicType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Tap, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).HarmonicType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Semi, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).HarmonicType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Pinch, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(4).Notes.get_Item(0).HarmonicType);
    }

    private function CheckHammer(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(false, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsHammerPullOrigin);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(1).IsHammerPullOrigin);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(2).IsHammerPullOrigin);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(3).IsHammerPullOrigin);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).HammerPullOrigin);
        alphaTab.test.Assert.IsNotNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(1).HammerPullOrigin);
        alphaTab.test.Assert.IsNotNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(2).HammerPullOrigin);
        alphaTab.test.Assert.IsNotNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(3).HammerPullOrigin);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsHammerPullOrigin);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsHammerPullOrigin);
        alphaTab.test.Assert.IsNotNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).HammerPullOrigin);
    }

    private function CheckBend(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(7, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(10, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(20, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(3).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(3).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(40, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(4).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(4).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(50, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(5).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(5).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(6).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(6).Value);
    }

    private function CheckTremolo(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(45, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(45, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
    }

    private function CheckSlides(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.SlideType.Legato, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(5).SlideType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.SlideType.Shift, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).GetNoteOnString(2).SlideType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.SlideType.IntoFromBelow, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(5).SlideType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.SlideType.IntoFromAbove, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).GetNoteOnString(5).SlideType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.SlideType.OutDown, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).GetNoteOnString(5).SlideType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.SlideType.OutUp, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).GetNoteOnString(5).SlideType);
    }

    private function CheckStrings(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(6, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(6, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(1).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(2).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(3).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(4).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(5).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(6).Fret);
    }

    private function CheckVibrato(score : alphaTab.model.Score, checkNotes : system.Boolean) : Void 
    {
        if (checkNotes)
        {
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.VibratoType.Slight, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Vibrato);
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.VibratoType.Slight, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).Vibrato);
        }
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.VibratoType.Slight, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Vibrato);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.VibratoType.Slight, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Vibrato);
    }

    private function CheckTrills(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).TrillFret);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Sixteenth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).TrillSpeed);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).IsTremolo);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.ThirtySecond, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).TremoloSpeed);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).IsTremolo);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Sixteenth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).TremoloSpeed);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).IsTremolo);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Eighth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).TremoloSpeed);
    }

    private function CheckOtherEffects(score : alphaTab.model.Score, skipInstrumentCheck : system.Boolean = false) : Void 
    {
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPalmMute);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsStaccato);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Tap);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Slap);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Pop);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).FadeIn);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).HasChord);
        alphaTab.test.Assert.AreEqual_T1_T22("C", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).Chord.Name);
        alphaTab.test.Assert.AreEqual_T1_T22("Text", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(1).Text);
        alphaTab.test.Assert.IsTrue(score.MasterBars.get_Item(4).IsDoubleBar);
        alphaTab.test.Assert.IsNotNull(score.MasterBars.get_Item(4).TempoAutomation);
        alphaTab.test.Assert.AreEqual_T1_T22(120.0, score.MasterBars.get_Item(4).TempoAutomation.Value);
        if (!skipInstrumentCheck)
        {
            alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(0).GetAutomation(alphaTab.model.AutomationType.Instrument) != null);
            alphaTab.test.Assert.AreEqual_T1_T22(25.0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(0).GetAutomation(alphaTab.model.AutomationType.Instrument).Value);
        }
    }

    private function CheckFingering(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsFingering);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.Thumb, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.IndexFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.MiddleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.AnnularFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.LittleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(4).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.Thumb, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(5).Notes.get_Item(0).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.IndexFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(6).Notes.get_Item(0).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.MiddleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(7).Notes.get_Item(0).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.AnnularFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(8).Notes.get_Item(0).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.LittleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(9).Notes.get_Item(0).RightHandFinger);
    }

    private function CheckStroke(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BrushType.BrushDown, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).BrushType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BrushType.BrushUp, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).BrushType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.PickStrokeType.Up, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).PickStroke);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.PickStrokeType.Down, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).PickStroke);
    }

    private function CheckTuplets(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).TupletNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).TupletNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).TupletNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).TupletNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).TupletNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).TupletNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).TupletNumerator);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(4).TupletNumerator);
    }

    private function CheckRanges(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPalmMute);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsPalmMute);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).IsPalmMute);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsPalmMute);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPalmMute);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPalmMute);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsLetRing);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).IsLetRing);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsLetRing);
        alphaTab.test.Assert.IsTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsLetRing);
    }

    private function CheckEffects(score : alphaTab.model.Score) : Void 
    {
        // just check if reading works
        alphaTab.test.Assert.IsTrue(true);
    }

    private function CheckKeySignatures(score : alphaTab.model.Score) : Void 
    {
        // major - flats
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.MasterBars.get_Item(0).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(0).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-1, score.MasterBars.get_Item(1).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(1).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-2, score.MasterBars.get_Item(2).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(2).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-3, score.MasterBars.get_Item(3).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(3).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.MasterBars.get_Item(4).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(4).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-5, score.MasterBars.get_Item(5).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(5).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-6, score.MasterBars.get_Item(6).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(6).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-7, score.MasterBars.get_Item(7).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(7).KeySignatureType);
        // major - sharps
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.MasterBars.get_Item(8).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(8).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.get_Item(9).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(9).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.MasterBars.get_Item(10).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(10).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.MasterBars.get_Item(11).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(11).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.MasterBars.get_Item(12).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(12).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.MasterBars.get_Item(13).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(13).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(6, score.MasterBars.get_Item(14).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(14).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(7, score.MasterBars.get_Item(15).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(15).KeySignatureType);
        // minor flats
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.MasterBars.get_Item(16).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(16).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-1, score.MasterBars.get_Item(17).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(17).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-2, score.MasterBars.get_Item(18).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(18).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-3, score.MasterBars.get_Item(19).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(19).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.MasterBars.get_Item(20).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(20).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-5, score.MasterBars.get_Item(21).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(21).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-6, score.MasterBars.get_Item(22).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(22).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(-7, score.MasterBars.get_Item(23).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(23).KeySignatureType);
        // minor sharps
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.MasterBars.get_Item(24).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(24).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.get_Item(25).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(25).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.MasterBars.get_Item(26).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(26).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.MasterBars.get_Item(27).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(27).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.MasterBars.get_Item(28).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(28).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.MasterBars.get_Item(29).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(29).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(6, score.MasterBars.get_Item(30).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(30).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(7, score.MasterBars.get_Item(31).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(31).KeySignatureType);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.MasterBars.get_Item(32).KeySignature);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(32).KeySignatureType);
    }

    private function CheckColors(score : alphaTab.model.Score) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22("Red", score.Tracks.get_Item(0).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("#FF0000", score.Tracks.get_Item(0).Color.RGBA);
        alphaTab.test.Assert.AreEqual_T1_T22("Green", score.Tracks.get_Item(1).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("#00FF00", score.Tracks.get_Item(1).Color.RGBA);
        alphaTab.test.Assert.AreEqual_T1_T22("Yellow", score.Tracks.get_Item(2).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("#FFFF00", score.Tracks.get_Item(2).Color.RGBA);
        alphaTab.test.Assert.AreEqual_T1_T22("Blue", score.Tracks.get_Item(3).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("#0000FF", score.Tracks.get_Item(3).Color.RGBA);
    }

    private function CheckChords(score : alphaTab.model.Score) : Void 
    {
        var track : alphaTab.model.Track = score.Tracks.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(8, track.Chords.Count);
        CheckChord((function (){
    var _tmp = new alphaTab.model.Chord();
    _tmp.Name = "C";
    _tmp.FirstFret = 1;
    _tmp.Strings = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(0);
        _tmp1.Add(1);
        _tmp1.Add(0);
        _tmp1.Add(2);
        _tmp1.Add(3);
        _tmp1.Add(-1);
        return _tmp1;
    })();
    return _tmp;
})(), track.Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Chord);
        CheckChord((function (){
    var _tmp = new alphaTab.model.Chord();
    _tmp.Name = "Cm";
    _tmp.FirstFret = 1;
    _tmp.Strings = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(-1);
        _tmp1.Add(-1);
        _tmp1.Add(0);
        _tmp1.Add(1);
        _tmp1.Add(3);
        _tmp1.Add(-1);
        return _tmp1;
    })();
    return _tmp;
})(), track.Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Chord);
        CheckChord((function (){
    var _tmp = new alphaTab.model.Chord();
    _tmp.Name = "C";
    _tmp.FirstFret = 1;
    _tmp.Strings = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(3);
        _tmp1.Add(5);
        _tmp1.Add(5);
        _tmp1.Add(5);
        _tmp1.Add(3);
        _tmp1.Add(-1);
        return _tmp1;
    })();
    _tmp.BarreFrets = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(3);
        return _tmp1;
    })();
    return _tmp;
})(), track.Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Chord);
        CheckChord((function (){
    var _tmp = new alphaTab.model.Chord();
    _tmp.Name = "Cm";
    _tmp.FirstFret = 1;
    _tmp.Strings = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(3);
        _tmp1.Add(4);
        _tmp1.Add(5);
        _tmp1.Add(5);
        _tmp1.Add(3);
        _tmp1.Add(-1);
        return _tmp1;
    })();
    _tmp.BarreFrets = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(3);
        return _tmp1;
    })();
    return _tmp;
})(), track.Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Chord);
        CheckChord((function (){
    var _tmp = new alphaTab.model.Chord();
    _tmp.Name = "D";
    _tmp.FirstFret = 1;
    _tmp.Strings = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(2);
        _tmp1.Add(3);
        _tmp1.Add(2);
        _tmp1.Add(0);
        _tmp1.Add(-1);
        _tmp1.Add(-1);
        return _tmp1;
    })();
    _tmp.BarreFrets = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(2);
        return _tmp1;
    })();
    return _tmp;
})(), track.Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Chord);
        CheckChord((function (){
    var _tmp = new alphaTab.model.Chord();
    _tmp.Name = "Dm";
    _tmp.FirstFret = 1;
    _tmp.Strings = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(1);
        _tmp1.Add(3);
        _tmp1.Add(2);
        _tmp1.Add(0);
        _tmp1.Add(-1);
        _tmp1.Add(-1);
        return _tmp1;
    })();
    return _tmp;
})(), track.Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Chord);
        CheckChord((function (){
    var _tmp = new alphaTab.model.Chord();
    _tmp.Name = "D";
    _tmp.FirstFret = 5;
    _tmp.Strings = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(5);
        _tmp1.Add(7);
        _tmp1.Add(7);
        _tmp1.Add(7);
        _tmp1.Add(5);
        _tmp1.Add(-1);
        return _tmp1;
    })();
    _tmp.BarreFrets = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(5);
        return _tmp1;
    })();
    return _tmp;
})(), track.Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Chord);
        CheckChord((function (){
    var _tmp = new alphaTab.model.Chord();
    _tmp.Name = "Dm";
    _tmp.FirstFret = 5;
    _tmp.Strings = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(5);
        _tmp1.Add(6);
        _tmp1.Add(7);
        _tmp1.Add(7);
        _tmp1.Add(5);
        _tmp1.Add(-1);
        return _tmp1;
    })();
    _tmp.BarreFrets = (function (){
        var _tmp1 = new alphaTab.collections.FastList<system.Int32>();
        _tmp1.Add(5);
        return _tmp1;
    })();
    return _tmp;
})(), track.Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Chord);
    }

    private function CheckChord(expected : alphaTab.model.Chord, actual : alphaTab.model.Chord) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(expected.Name, actual.Name);
        alphaTab.test.Assert.AreEqual_T1_T22(expected.FirstFret, actual.FirstFret);
        alphaTab.test.Assert.AreEqual_T1_T22(expected.Strings.Count, actual.Strings.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(system.CsString.Join_CsString_IEnumerable_T1(",", expected.Strings.ToEnumerable()), system.CsString.Join_CsString_IEnumerable_T1(",", actual.Strings.ToEnumerable()));
        alphaTab.test.Assert.AreEqual_T1_T22(system.CsString.Join_CsString_IEnumerable_T1(",", expected.BarreFrets.ToEnumerable()), system.CsString.Join_CsString_IEnumerable_T1(",", actual.BarreFrets.ToEnumerable()));
    }

    private function Render(score : alphaTab.model.Score, callerFile : system.CsString = null, caller : system.CsString = null) : Void 
    {
        if (caller == null)
        {
            throw new system.ArgumentNullException().ArgumentNullException_CsString_CsString("caller", "svg rendering failed because caller info was missing");
        }
    }

    public function new() 
    {
    }

}
