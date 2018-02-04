package alphaTab.test.importer;

using system.HaxeExtensions;
class Gp3ImporterTest extends alphaTab.test.importer.GpImporterTestBase
{
    @Test
    public function TestScoreInfo() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/Test01.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        massive.munit.Assert.areEqual("Title", score.Title);
        massive.munit.Assert.areEqual("Subtitle", score.SubTitle);
        massive.munit.Assert.areEqual("Artist", score.Artist);
        massive.munit.Assert.areEqual("Album", score.Album);
        massive.munit.Assert.areEqual("Music", score.Words);// no words in gp4

        massive.munit.Assert.areEqual("Music", score.Music);
        massive.munit.Assert.areEqual("Copyright", score.Copyright);
        massive.munit.Assert.areEqual("Tab", score.Tab);
        massive.munit.Assert.areEqual("Instructions", score.Instructions);
        massive.munit.Assert.areEqual("Notice1\r\nNotice2", score.Notices);
        massive.munit.Assert.areEqual(5, score.MasterBars.Count);
        massive.munit.Assert.areEqual(1, score.Tracks.Count);
        massive.munit.Assert.areEqual("Track 1", score.Tracks.get_Item(0).Name);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestScoreInfo");
    }

    @Test
    public function TestNotes() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/Test02.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest02Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestNotes");
    }

    @Test
    public function TestTimeSignatures() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/Test03.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest03Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestTimeSignatures");
    }

    @Test
    public function TestDead() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestDead.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckDead(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestDead");
    }

    @Test
    public function TestAccentuation() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestAccentuations.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsGhost);
        // it seems accentuation is handled as Forte Fortissimo
        massive.munit.Assert.areEqual(alphaTab.model.DynamicValue.FFF, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).Dynamic);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsLetRing);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestAccentuation");
    }

    @Test
    public function TestGuitarPro3Harmonics() : Void 
    {
    }

    @Test
    public function TestHammer() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestHammer.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHammer(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestHammer");
    }

    @Test
    public function TestBend() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestBends.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckBend(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestBend");
    }

    @Test
    public function TestSlides() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestSlides.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        massive.munit.Assert.areEqual(alphaTab.model.SlideType.Shift, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GetNoteOnString(5).SlideType);
        massive.munit.Assert.areEqual(alphaTab.model.SlideType.Shift, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).GetNoteOnString(2).SlideType);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestSlides");
    }

    @Test
    public function TestGuitarPro3Vibrato() : Void 
    {
        // TODO: Check why this vibrato is not recognized
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestVibrato.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckVibrato(score, false);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestGuitarPro3Vibrato");
    }

    @Test
    public function TestOtherEffects() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestOtherEffects.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Tap);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Slap);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Pop);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).FadeIn);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).HasChord);
        massive.munit.Assert.areEqual("C", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).Chord.Name);
        massive.munit.Assert.areEqual("Text", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(1).Text);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(0).GetAutomation(alphaTab.model.AutomationType.Tempo) != null);
        massive.munit.Assert.areEqual(120.0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(0).GetAutomation(alphaTab.model.AutomationType.Tempo).Value);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(0).GetAutomation(alphaTab.model.AutomationType.Instrument) != null);
        massive.munit.Assert.areEqual(25.0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(0).GetAutomation(alphaTab.model.AutomationType.Instrument).Value);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestOtherEffects");
    }

    @Test
    public function TestStroke() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestStrokes.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        massive.munit.Assert.areEqual(alphaTab.model.BrushType.BrushDown, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).BrushType);
        massive.munit.Assert.areEqual(alphaTab.model.BrushType.BrushUp, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).BrushType);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestStroke");
    }

    @Test
    public function TestTuplets() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestTuplets.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTuplets(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestTuplets");
    }

    @Test
    public function TestRanges() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestRanges.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).IsLetRing);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).IsLetRing);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).IsLetRing);
        massive.munit.Assert.isTrue(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsLetRing);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestRanges");
    }

    @Test
    public function TestEffects() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/Effects.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckEffects(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestEffects");
    }

    @Test
    public function TestStrings() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro3/TestStrings.gp3");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStrings(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp3ImporterTest.cs", "TestStrings");
    }

    public function new() 
    {
        super();
    }

}
