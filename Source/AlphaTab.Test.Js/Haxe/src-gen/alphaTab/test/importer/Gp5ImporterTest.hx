package alphaTab.test.importer;

using system.HaxeExtensions;
class Gp5ImporterTest extends alphaTab.test.importer.GpImporterTestBase
{
    @Test
    public function TestScoreInfo() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Test01.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        massive.munit.Assert.areEqual("Title", score.Title);
        massive.munit.Assert.areEqual("Subtitle", score.SubTitle);
        massive.munit.Assert.areEqual("Artist", score.Artist);
        massive.munit.Assert.areEqual("Album", score.Album);
        massive.munit.Assert.areEqual("Words", score.Words);
        massive.munit.Assert.areEqual("Music", score.Music);
        massive.munit.Assert.areEqual("Copyright", score.Copyright);
        massive.munit.Assert.areEqual("Tab", score.Tab);
        massive.munit.Assert.areEqual("Instructions", score.Instructions);
        massive.munit.Assert.areEqual("Notice1\r\nNotice2", score.Notices);
        massive.munit.Assert.areEqual(5, score.MasterBars.Count);
        massive.munit.Assert.areEqual(2, score.Tracks.Count);
        massive.munit.Assert.areEqual("Track 1", score.Tracks.get_Item(0).Name);
        massive.munit.Assert.areEqual("Track 2", score.Tracks.get_Item(1).Name);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestScoreInfo");
    }

    @Test
    public function TestNotes() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Test02.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest02Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestNotes");
    }

    @Test
    public function TestTimeSignatures() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Test03.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest03Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestTimeSignatures");
    }

    @Test
    public function TestDead() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestDead.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckDead(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestDead");
    }

    @Test
    public function TestGrace() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestGrace.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckGrace(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestGrace");
    }

    @Test
    public function TestAccentuation() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestAccentuations.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckAccentuation(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestAccentuation");
    }

    @Test
    public function TestHarmonics() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestHarmonics.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHarmonics(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestHarmonics");
    }

    @Test
    public function TestHammer() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestHammer.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHammer(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestHammer");
    }

    @Test
    public function TestBend() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestBends.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckBend(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestBend");
    }

    @Test
    public function TestTremolo() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestTremolo.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTremolo(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestTremolo");
    }

    @Test
    public function TestSlides() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestSlides.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckSlides(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestSlides");
    }

    @Test
    public function TestVibrato() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestVibrato.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckVibrato(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestVibrato");
    }

    @Test
    public function TestTrills() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestTrills.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTrills(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestTrills");
    }

    @Test
    public function TestOtherEffects() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestOtherEffects.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckOtherEffects(score, false);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestOtherEffects");
    }

    @Test
    public function TestFingering() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestFingering.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckFingering(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestFingering");
    }

    @Test
    public function TestStroke() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestStrokes.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStroke(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestStroke");
    }

    @Test
    public function TestTuplets() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestTuplets.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTuplets(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestTuplets");
    }

    @Test
    public function TestRanges() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestRanges.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckRanges(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestRanges");
    }

    @Test
    public function TestEffects() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Effects.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckEffects(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestEffects");
    }

    @Test
    public function TestSerenade() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Serenade.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        // only Check reading
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestSerenade");
    }

    @Test
    public function TestStrings() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestStrings.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStrings(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestStrings");
    }

    @Test
    public function TestKeySignatures() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestKeySignatures.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckKeySignatures(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestKeySignatures");
    }

    @Test
    public function TestChords() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestChords.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckChords(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestChords");
    }

    @Test
    public function TestColors() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Colors.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckColors(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestColors");
    }

    public function new() 
    {
        super();
    }

}
