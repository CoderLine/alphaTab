package alphaTab.test.importer;

using system.HaxeExtensions;
class Gp4ImporterTest extends alphaTab.test.importer.GpImporterTestBase
{
    @Test
    public function TestScoreInfo() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/Test01.gp4");
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
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestScoreInfo");
    }

    @Test
    public function TestNotes() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/Test02.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest02Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestNotes");
    }

    @Test
    public function TestTimeSignatures() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/Test03.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest03Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestTimeSignatures");
    }

    @Test
    public function TestDead() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestDead.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckDead(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestDead");
    }

    @Test
    public function TestGrace() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestGrace.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckGrace(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestGrace");
    }

    @Test
    public function TestAccentuation() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestAccentuations.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckAccentuation(score, false);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestAccentuation");
    }

    @Test
    public function TestHarmonics() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestHarmonics.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHarmonics(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestHarmonics");
    }

    @Test
    public function TestHammer() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestHammer.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHammer(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestHammer");
    }

    @Test
    public function TestBend() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestBends.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckBend(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestBend");
    }

    @Test
    public function TestTremolo() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestTremolo.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTremolo(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestTremolo");
    }

    @Test
    public function TestSlides() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestSlides.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckSlides(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestSlides");
    }

    @Test
    public function TestVibrato() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestVibrato.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckVibrato(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestVibrato");
    }

    @Test
    public function TestTrills() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestTrills.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTrills(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestTrills");
    }

    @Test
    public function TestOtherEffects() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestOtherEffects.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckOtherEffects(score, false);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestOtherEffects");
    }

    @Test
    public function TestFingering() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestFingering.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckFingering(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestFingering");
    }

    @Test
    public function TestStroke() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestStrokes.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStroke(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestStroke");
    }

    @Test
    public function TestTuplets() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestTuplets.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTuplets(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestTuplets");
    }

    @Test
    public function TestRanges() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestRanges.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckRanges(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestRanges");
    }

    @Test
    public function TestEffects() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/Effects.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckEffects(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestEffects");
    }

    @Test
    public function TestStrings() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/TestStrings.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStrings(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestStrings");
    }

    @Test
    public function TestColors() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro4/Colors.gp4");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckColors(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp4ImporterTest.cs", "TestColors");
    }

    public function new() 
    {
        super();
    }

}
