package alphaTab.test.importer;

using system.HaxeExtensions;
class GpImporterTestBase
{
    public function PrepareImporterWithFile(name : system.CsString) : alphaTab.importer.Gp3To5Importer 
    {
        var path : system.CsString = "TestFiles/";
        var buffer : system.FixedArray<system.Byte> = alphaTab.test.TestPlatform.LoadFile(path + name);
        return PrepareImporterWithBytes(buffer);

    }

    public function PrepareImporterWithBytes(buffer : system.FixedArray<system.Byte>) : alphaTab.importer.Gp3To5Importer 
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
            massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).Fret);
            massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).String);
            massive.munit.Assert.areEqual(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
            massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).Fret);
            massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).String);
            massive.munit.Assert.areEqual(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
            massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).Fret);
            massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).String);
            massive.munit.Assert.areEqual(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
            massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).Fret);
            massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Notes.get_Item(0).String);
            massive.munit.Assert.areEqual(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
            massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).IsRest);
            massive.munit.Assert.areEqual(duration, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(beat).Duration);
            beat++;
        }
    }

    private function CheckTest03Score(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(4, score.MasterBars.get_Item(0).TimeSignatureNumerator);
        massive.munit.Assert.areEqual(4, score.MasterBars.get_Item(0).TimeSignatureDenominator);
        massive.munit.Assert.areEqual(3, score.MasterBars.get_Item(1).TimeSignatureNumerator);
        massive.munit.Assert.areEqual(4, score.MasterBars.get_Item(1).TimeSignatureDenominator);
        massive.munit.Assert.areEqual(2, score.MasterBars.get_Item(2).TimeSignatureNumerator);
        massive.munit.Assert.areEqual(4, score.MasterBars.get_Item(2).TimeSignatureDenominator);
        massive.munit.Assert.areEqual(1, score.MasterBars.get_Item(3).TimeSignatureNumerator);
        massive.munit.Assert.areEqual(4, score.MasterBars.get_Item(3).TimeSignatureDenominator);
        massive.munit.Assert.areEqual(20, score.MasterBars.get_Item(4).TimeSignatureNumerator);
        massive.munit.Assert.areEqual(32, score.MasterBars.get_Item(4).TimeSignatureDenominator);
    }

    private function CheckDead(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsDead);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).String);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsDead);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).String);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).IsDead);
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).String);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsDead);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).String);
    }

    private function CheckGrace(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(alphaTab.model.GraceType.BeforeBeat, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GraceType);
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Fret);
        massive.munit.Assert.areEqual(alphaTab.model.Duration.ThirtySecond, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Duration);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).Fret);
        massive.munit.Assert.areEqual(alphaTab.model.Duration.Quarter, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Duration);
        massive.munit.Assert.areEqual(alphaTab.model.GraceType.BeforeBeat, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).GraceType);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).Fret);
        massive.munit.Assert.areEqual(alphaTab.model.Duration.ThirtySecond, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Duration);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).Fret);
        massive.munit.Assert.areEqual(alphaTab.model.Duration.Quarter, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Duration);
    }

    private function CheckAccentuation(score : alphaTab.model.Score, includeHeavy : system.Boolean) : Void 
    {
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsGhost);
        massive.munit.Assert.areEqual(alphaTab.model.AccentuationType.Normal, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).Accentuated);
        if (includeHeavy)
        {
            massive.munit.Assert.areEqual(alphaTab.model.AccentuationType.Heavy, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).Accentuated);
        }
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsLetRing);
    }

    private function CheckHarmonics(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(alphaTab.model.HarmonicType.Natural, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).HarmonicType);
        massive.munit.Assert.areEqual(alphaTab.model.HarmonicType.Artificial, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).HarmonicType);
        massive.munit.Assert.areEqual(alphaTab.model.HarmonicType.Tap, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).HarmonicType);
        massive.munit.Assert.areEqual(alphaTab.model.HarmonicType.Semi, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).HarmonicType);
        massive.munit.Assert.areEqual(alphaTab.model.HarmonicType.Pinch, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(4).Notes.get_Item(0).HarmonicType);
    }

    private function CheckHammer(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(false, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsHammerPullOrigin);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(1).IsHammerPullOrigin);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(2).IsHammerPullOrigin);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(3).IsHammerPullOrigin);
        massive.munit.Assert.isNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).HammerPullOrigin);
        massive.munit.Assert.isNotNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(1).HammerPullOrigin);
        massive.munit.Assert.isNotNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(2).HammerPullOrigin);
        massive.munit.Assert.isNotNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(3).HammerPullOrigin);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsHammerPullOrigin);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsHammerPullOrigin);
        massive.munit.Assert.isNotNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).HammerPullOrigin);
    }

    private function CheckBend(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(15, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Offset);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Value);
        massive.munit.Assert.areEqual(7, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(10, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(20, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(2).Offset);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(2).Value);
        massive.munit.Assert.areEqual(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(3).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(3).Value);
        massive.munit.Assert.areEqual(40, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(4).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(4).Value);
        massive.munit.Assert.areEqual(50, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(5).Offset);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(5).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(6).Offset);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(6).Value);
    }

    private function CheckTremolo(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(45, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(45, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
    }

    private function CheckSlides(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(alphaTab.model.SlideType.Legato, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(5).SlideType);
        massive.munit.Assert.areEqual(alphaTab.model.SlideType.Shift, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).GetNoteOnString(2).SlideType);
        massive.munit.Assert.areEqual(alphaTab.model.SlideType.IntoFromBelow, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(5).SlideType);
        massive.munit.Assert.areEqual(alphaTab.model.SlideType.IntoFromAbove, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).GetNoteOnString(5).SlideType);
        massive.munit.Assert.areEqual(alphaTab.model.SlideType.OutDown, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).GetNoteOnString(5).SlideType);
        massive.munit.Assert.areEqual(alphaTab.model.SlideType.OutUp, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).GetNoteOnString(5).SlideType);
    }

    private function CheckStrings(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(6, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
        massive.munit.Assert.areEqual(6, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(1).Fret);
        massive.munit.Assert.areEqual(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(2).Fret);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(3).Fret);
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(4).Fret);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(5).Fret);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(6).Fret);
    }

    private function CheckVibrato(score : alphaTab.model.Score, checkNotes : system.Boolean) : Void 
    {
        if (checkNotes)
        {
            massive.munit.Assert.areEqual(alphaTab.model.VibratoType.Slight, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Vibrato);
            massive.munit.Assert.areEqual(alphaTab.model.VibratoType.Slight, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).Vibrato);
        }
        massive.munit.Assert.areEqual(alphaTab.model.VibratoType.Slight, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Vibrato);
        massive.munit.Assert.areEqual(alphaTab.model.VibratoType.Slight, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Vibrato);
    }

    private function CheckTrills(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).TrillFret);
        massive.munit.Assert.areEqual(alphaTab.model.Duration.Sixteenth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).TrillSpeed);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).IsTremolo);
        massive.munit.Assert.areEqual(alphaTab.model.Duration.ThirtySecond, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).TremoloSpeed);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).IsTremolo);
        massive.munit.Assert.areEqual(alphaTab.model.Duration.Sixteenth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).TremoloSpeed);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).IsTremolo);
        massive.munit.Assert.areEqual(alphaTab.model.Duration.Eighth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).TremoloSpeed);
    }

    private function CheckOtherEffects(score : alphaTab.model.Score, skipInstrumentCheck : system.Boolean = false) : Void 
    {
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPalmMute);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsStaccato);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Tap);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Slap);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Pop);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).FadeIn);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).HasChord);
        massive.munit.Assert.areEqual("C", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).Chord.Name);
        massive.munit.Assert.areEqual("Text", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(1).Text);
        massive.munit.Assert.isTrue(score.MasterBars.get_Item(4).IsDoubleBar);
        massive.munit.Assert.isNotNull(score.MasterBars.get_Item(4).TempoAutomation);
        massive.munit.Assert.areEqual(120.0, score.MasterBars.get_Item(4).TempoAutomation.Value);
        if (!skipInstrumentCheck)
        {
            massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(0).GetAutomation(alphaTab.model.AutomationType.Instrument) != null);
            massive.munit.Assert.areEqual(25.0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(0).GetAutomation(alphaTab.model.AutomationType.Instrument).Value);
        }
    }

    private function CheckFingering(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsFingering);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.Thumb, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).LeftHandFinger);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.IndexFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).LeftHandFinger);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.MiddleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).LeftHandFinger);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.AnnularFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).LeftHandFinger);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.LittleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(4).Notes.get_Item(0).LeftHandFinger);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.Thumb, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(5).Notes.get_Item(0).RightHandFinger);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.IndexFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(6).Notes.get_Item(0).RightHandFinger);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.MiddleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(7).Notes.get_Item(0).RightHandFinger);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.AnnularFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(8).Notes.get_Item(0).RightHandFinger);
        massive.munit.Assert.areEqual(alphaTab.model.Fingers.LittleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(9).Notes.get_Item(0).RightHandFinger);
    }

    private function CheckStroke(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(alphaTab.model.BrushType.BrushDown, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).BrushType);
        massive.munit.Assert.areEqual(alphaTab.model.BrushType.BrushUp, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).BrushType);
        massive.munit.Assert.areEqual(alphaTab.model.PickStrokeType.Up, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).PickStroke);
        massive.munit.Assert.areEqual(alphaTab.model.PickStrokeType.Down, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).PickStroke);
    }

    private function CheckTuplets(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).TupletNumerator);
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).TupletNumerator);
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).TupletNumerator);
        massive.munit.Assert.areEqual(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).TupletNumerator);
        massive.munit.Assert.areEqual(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).TupletNumerator);
        massive.munit.Assert.areEqual(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).TupletNumerator);
        massive.munit.Assert.areEqual(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).TupletNumerator);
        massive.munit.Assert.areEqual(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(4).TupletNumerator);
    }

    private function CheckRanges(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPalmMute);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsPalmMute);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).IsPalmMute);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsPalmMute);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPalmMute);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPalmMute);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsLetRing);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).IsLetRing);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsLetRing);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsLetRing);
    }

    private function CheckEffects(score : alphaTab.model.Score) : Void 
    {
        // just check if reading works
        massive.munit.Assert.isTrue(true);
    }

    private function CheckKeySignatures(score : alphaTab.model.Score) : Void 
    {
        // major - flats
        massive.munit.Assert.areEqual(0, score.MasterBars.get_Item(0).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(0).KeySignatureType);
        massive.munit.Assert.areEqual(-1, score.MasterBars.get_Item(1).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(1).KeySignatureType);
        massive.munit.Assert.areEqual(-2, score.MasterBars.get_Item(2).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(2).KeySignatureType);
        massive.munit.Assert.areEqual(-3, score.MasterBars.get_Item(3).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(3).KeySignatureType);
        massive.munit.Assert.areEqual(-4, score.MasterBars.get_Item(4).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(4).KeySignatureType);
        massive.munit.Assert.areEqual(-5, score.MasterBars.get_Item(5).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(5).KeySignatureType);
        massive.munit.Assert.areEqual(-6, score.MasterBars.get_Item(6).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(6).KeySignatureType);
        massive.munit.Assert.areEqual(-7, score.MasterBars.get_Item(7).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(7).KeySignatureType);
        // major - sharps
        massive.munit.Assert.areEqual(0, score.MasterBars.get_Item(8).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(8).KeySignatureType);
        massive.munit.Assert.areEqual(1, score.MasterBars.get_Item(9).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(9).KeySignatureType);
        massive.munit.Assert.areEqual(2, score.MasterBars.get_Item(10).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(10).KeySignatureType);
        massive.munit.Assert.areEqual(3, score.MasterBars.get_Item(11).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(11).KeySignatureType);
        massive.munit.Assert.areEqual(4, score.MasterBars.get_Item(12).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(12).KeySignatureType);
        massive.munit.Assert.areEqual(5, score.MasterBars.get_Item(13).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(13).KeySignatureType);
        massive.munit.Assert.areEqual(6, score.MasterBars.get_Item(14).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(14).KeySignatureType);
        massive.munit.Assert.areEqual(7, score.MasterBars.get_Item(15).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Major, score.MasterBars.get_Item(15).KeySignatureType);
        // minor flats
        massive.munit.Assert.areEqual(0, score.MasterBars.get_Item(16).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(16).KeySignatureType);
        massive.munit.Assert.areEqual(-1, score.MasterBars.get_Item(17).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(17).KeySignatureType);
        massive.munit.Assert.areEqual(-2, score.MasterBars.get_Item(18).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(18).KeySignatureType);
        massive.munit.Assert.areEqual(-3, score.MasterBars.get_Item(19).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(19).KeySignatureType);
        massive.munit.Assert.areEqual(-4, score.MasterBars.get_Item(20).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(20).KeySignatureType);
        massive.munit.Assert.areEqual(-5, score.MasterBars.get_Item(21).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(21).KeySignatureType);
        massive.munit.Assert.areEqual(-6, score.MasterBars.get_Item(22).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(22).KeySignatureType);
        massive.munit.Assert.areEqual(-7, score.MasterBars.get_Item(23).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(23).KeySignatureType);
        // minor sharps
        massive.munit.Assert.areEqual(0, score.MasterBars.get_Item(24).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(24).KeySignatureType);
        massive.munit.Assert.areEqual(1, score.MasterBars.get_Item(25).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(25).KeySignatureType);
        massive.munit.Assert.areEqual(2, score.MasterBars.get_Item(26).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(26).KeySignatureType);
        massive.munit.Assert.areEqual(3, score.MasterBars.get_Item(27).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(27).KeySignatureType);
        massive.munit.Assert.areEqual(4, score.MasterBars.get_Item(28).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(28).KeySignatureType);
        massive.munit.Assert.areEqual(5, score.MasterBars.get_Item(29).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(29).KeySignatureType);
        massive.munit.Assert.areEqual(6, score.MasterBars.get_Item(30).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(30).KeySignatureType);
        massive.munit.Assert.areEqual(7, score.MasterBars.get_Item(31).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(31).KeySignatureType);
        massive.munit.Assert.areEqual(0, score.MasterBars.get_Item(32).KeySignature);
        massive.munit.Assert.areEqual(alphaTab.model.KeySignatureType.Minor, score.MasterBars.get_Item(32).KeySignatureType);
    }

    private function CheckColors(score : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual("Red", score.Tracks.get_Item(0).Name);
        massive.munit.Assert.areEqual("#FF0000", score.Tracks.get_Item(0).Color.RGBA);
        massive.munit.Assert.areEqual("Green", score.Tracks.get_Item(1).Name);
        massive.munit.Assert.areEqual("#00FF00", score.Tracks.get_Item(1).Color.RGBA);
        massive.munit.Assert.areEqual("Yellow", score.Tracks.get_Item(2).Name);
        massive.munit.Assert.areEqual("#FFFF00", score.Tracks.get_Item(2).Color.RGBA);
        massive.munit.Assert.areEqual("Blue", score.Tracks.get_Item(3).Name);
        massive.munit.Assert.areEqual("#0000FF", score.Tracks.get_Item(3).Color.RGBA);
    }

    private function CheckChords(score : alphaTab.model.Score) : Void 
    {
        var track : alphaTab.model.Track = score.Tracks.get_Item(0);
        massive.munit.Assert.areEqual(8, track.Chords.Count);
        CheckChord(new alphaTab.model.Chord(), track.Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Chord);
        CheckChord(new alphaTab.model.Chord(), track.Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Chord);
        CheckChord(new alphaTab.model.Chord(), track.Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Chord);
        CheckChord(new alphaTab.model.Chord(), track.Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Chord);
        CheckChord(new alphaTab.model.Chord(), track.Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Chord);
        CheckChord(new alphaTab.model.Chord(), track.Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Chord);
        CheckChord(new alphaTab.model.Chord(), track.Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Chord);
        CheckChord(new alphaTab.model.Chord(), track.Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Chord);
    }

    private function CheckChord(expected : alphaTab.model.Chord, actual : alphaTab.model.Chord) : Void 
    {
        massive.munit.Assert.areEqual(expected.Name, actual.Name);
        massive.munit.Assert.areEqual(expected.FirstFret, actual.FirstFret);
        massive.munit.Assert.areEqual(expected.Strings.Count, actual.Strings.Count);
        massive.munit.Assert.areEqual(system.CsString.Join_CsString_IEnumerable_T1(",", expected.Strings.ToEnumerable()), system.CsString.Join_CsString_IEnumerable_T1(",", actual.Strings.ToEnumerable()));
        massive.munit.Assert.areEqual(system.CsString.Join_CsString_IEnumerable_T1(",", expected.BarreFrets.ToEnumerable()), system.CsString.Join_CsString_IEnumerable_T1(",", actual.BarreFrets.ToEnumerable()));
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
