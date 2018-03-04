package alphaTab.test.importer;

using system.HaxeExtensions;
@:testClass
class Gp5ImporterTest extends alphaTab.test.importer.GpImporterTestBase
{
    @:testMethod
    public function TestScoreInfo() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Test01.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        alphaTab.test.Assert.AreEqual_T1_T22("Title", score.Title);
        alphaTab.test.Assert.AreEqual_T1_T22("Subtitle", score.SubTitle);
        alphaTab.test.Assert.AreEqual_T1_T22("Artist", score.Artist);
        alphaTab.test.Assert.AreEqual_T1_T22("Album", score.Album);
        alphaTab.test.Assert.AreEqual_T1_T22("Words", score.Words);
        alphaTab.test.Assert.AreEqual_T1_T22("Music", score.Music);
        alphaTab.test.Assert.AreEqual_T1_T22("Copyright", score.Copyright);
        alphaTab.test.Assert.AreEqual_T1_T22("Tab", score.Tab);
        alphaTab.test.Assert.AreEqual_T1_T22("Instructions", score.Instructions);
        alphaTab.test.Assert.AreEqual_T1_T22("Notice1\r\nNotice2", score.Notices);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22("Track 1", score.Tracks.get_Item(0).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("Track 2", score.Tracks.get_Item(1).Name);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestScoreInfo");
    }

    @:testMethod
    public function TestNotes() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Test02.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest02Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestNotes");
    }

    @:testMethod
    public function TestTimeSignatures() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Test03.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest03Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestTimeSignatures");
    }

    @:testMethod
    public function TestDead() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestDead.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckDead(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestDead");
    }

    @:testMethod
    public function TestGrace() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestGrace.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckGrace(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestGrace");
    }

    @:testMethod
    public function TestAccentuation() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestAccentuations.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckAccentuation(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestAccentuation");
    }

    @:testMethod
    public function TestHarmonics() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestHarmonics.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHarmonics(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestHarmonics");
    }

    @:testMethod
    public function TestHammer() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestHammer.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHammer(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestHammer");
    }

    @:testMethod
    public function TestBend() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestBends.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckBend(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestBend");
    }

    @:testMethod
    public function TestTremolo() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestTremolo.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTremolo(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestTremolo");
    }

    @:testMethod
    public function TestSlides() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestSlides.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckSlides(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestSlides");
    }

    @:testMethod
    public function TestVibrato() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestVibrato.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckVibrato(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestVibrato");
    }

    @:testMethod
    public function TestTrills() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestTrills.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTrills(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestTrills");
    }

    @:testMethod
    public function TestOtherEffects() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestOtherEffects.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckOtherEffects(score, false);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestOtherEffects");
    }

    @:testMethod
    public function TestFingering() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestFingering.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckFingering(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestFingering");
    }

    @:testMethod
    public function TestStroke() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestStrokes.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStroke(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestStroke");
    }

    @:testMethod
    public function TestTuplets() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestTuplets.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTuplets(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestTuplets");
    }

    @:testMethod
    public function TestRanges() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestRanges.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckRanges(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestRanges");
    }

    @:testMethod
    public function TestEffects() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Effects.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckEffects(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestEffects");
    }

    @:testMethod
    public function TestSerenade() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Serenade.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        // only Check reading
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestSerenade");
    }

    @:testMethod
    public function TestStrings() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestStrings.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStrings(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestStrings");
    }

    @:testMethod
    public function TestKeySignatures() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestKeySignatures.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckKeySignatures(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestKeySignatures");
    }

    @:testMethod
    public function TestChords() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/TestChords.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckChords(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestChords");
    }

    @:testMethod
    public function TestColors() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Colors.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckColors(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp5ImporterTest.cs", "TestColors");
    }

    @:testMethod
    public function TestCanon() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5/Canon.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        alphaTab.test.Assert.AreEqual_T1_T22("Canon Rock", score.Title);
        alphaTab.test.Assert.AreEqual_T1_T22("", score.SubTitle);
        alphaTab.test.Assert.AreEqual_T1_T22("JerryC", score.Artist);
        alphaTab.test.Assert.AreEqual_T1_T22("", score.Album);
        alphaTab.test.Assert.AreEqual_T1_T22("", score.Words);
        alphaTab.test.Assert.AreEqual_T1_T22("JerryC", score.Music);
        alphaTab.test.Assert.AreEqual_T1_T22("", score.Copyright);
        alphaTab.test.Assert.AreEqual_T1_T22("", score.Tab);
        alphaTab.test.Assert.AreEqual_T1_T22("", score.Instructions);
        alphaTab.test.Assert.AreEqual_T1_T22("", score.Notices);
        alphaTab.test.Assert.AreEqual_T1_T22(224, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(9, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22("Guitar Player", score.Tracks.get_Item(0).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("Low Bassy Sound", score.Tracks.get_Item(1).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("High Soundy Thing", score.Tracks.get_Item(2).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("Second Guitar", score.Tracks.get_Item(3).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("Drums", score.Tracks.get_Item(4).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("Harmonizer", score.Tracks.get_Item(5).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("The clean guitar", score.Tracks.get_Item(6).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("Track 8", score.Tracks.get_Item(7).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("Percussion", score.Tracks.get_Item(8).Name);
    }

    public function new() 
    {
        super();
    }

}
