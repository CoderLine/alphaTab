package alphaTab.test.importer;

using system.HaxeExtensions;
@:testClass
class Gp7ImporterTest extends alphaTab.test.importer.GpImporterTestBase
{
    public function Load(name : system.CsString) : system.ByteArray 
    {
        var path : system.CsString = "TestFiles/";
        return alphaTab.test.TestPlatform.LoadFile(path + name);

    }

    public function PrepareGp7ImporterWithBytes_CsString(name : system.CsString) : alphaTab.importer.Gp7Importer 
    {
        return PrepareGp7ImporterWithBytes_ByteArray(Load(name));

    }

    public function PrepareGp7ImporterWithBytes_ByteArray(buffer : system.ByteArray) : alphaTab.importer.Gp7Importer 
    {
        var readerBase : alphaTab.importer.Gp7Importer = new alphaTab.importer.Gp7Importer();
        readerBase.Init(alphaTab.io.ByteBuffer.FromBuffer(buffer), null);
        return readerBase;

    }

    @:testMethod
    public function TestScoreInfo() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/Test01.gp");
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
        alphaTab.test.Assert.AreEqual_T1_T22("Notice1\nNotice2", score.Notices);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22("Track 1", score.Tracks.get_Item(0).Name);
        alphaTab.test.Assert.AreEqual_T1_T22("Track 2", score.Tracks.get_Item(1).Name);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestScoreInfo");
    }

    @:testMethod
    public function TestNotes() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/Test02.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest02Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestNotes");
    }

    @:testMethod
    public function TestTimeSignatures() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/Test03.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest03Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestTimeSignatures");
    }

    @:testMethod
    public function TestDead() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestDead.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckDead(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestDead");
    }

    @:testMethod
    public function TestGrace() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestGrace.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckGrace(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestGrace");
    }

    @:testMethod
    public function TestAccentuation() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestAccentuations.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckAccentuation(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestAccentuation");
    }

    @:testMethod
    public function TestHarmonics() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestHarmonics.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHarmonics(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestHarmonics");
    }

    @:testMethod
    public function TestHammer() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestHammer.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHammer(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestHammer");
    }

    @:testMethod
    public function TestBend() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestBends.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.BendRelease, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(12, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(12, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(3).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(6, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(3).Value);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestBend");
    }

    @:testMethod
    public function TestBendAdvanced() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/BendsAdvanced.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        var note : alphaTab.model.Note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.BendRelease, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(10, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(20, note.BendPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, note.BendPoints.get_Item(3).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(3).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(59, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.BendRelease, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(10, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(45, note.BendPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(59, note.BendPoints.get_Item(3).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(3).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Prebend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.PrebendBend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(6, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.PrebendRelease, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(14, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(8, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(4).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.BendRelease, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(9, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(8, note.BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(20, note.BendPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(8, note.BendPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(31, note.BendPoints.get_Item(3).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(3).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(5).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Prebend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(8, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(8, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(5).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.PrebendBend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(8, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(16, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(12, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(6).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.PrebendRelease, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(8, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(14, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(7).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(8).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.BendRelease, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(10, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(20, note.BendPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, note.BendPoints.get_Item(3).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(3).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(9).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(9).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Release, note.BendType);
        alphaTab.test.Assert.IsTrue(note.IsContinuedBend);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(9).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.IsFalse(note.IsContinuedBend);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(10).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(10).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.IsTrue(note.IsContinuedBend);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(8, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(10).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Release, note.BendType);
        alphaTab.test.Assert.IsTrue(note.IsContinuedBend);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(8, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(10).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Release, note.BendType);
        alphaTab.test.Assert.IsTrue(note.IsContinuedBend);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(11).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.GraceType.BeforeBeat, note.Beat.GraceType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(12).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.GraceType.BeforeBeat, note.Beat.GraceType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(12).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.IsTrue(note.IsContinuedBend);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Hold, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(13).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.GraceType.OnBeat, note.Beat.GraceType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(18, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(1, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(13).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.IsTrue(note.IsContinuedBend);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Hold, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(1, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(1, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(14).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.GraceType.BeforeBeat, note.Beat.GraceType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(14).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(12, note.Fret);
        alphaTab.test.Assert.IsTrue(note.IsTieDestination);
        alphaTab.test.Assert.IsTrue(note.IsContinuedBend);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Hold, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(14).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(1);
        alphaTab.test.Assert.AreEqual_T1_T22(10, note.Fret);
        alphaTab.test.Assert.IsFalse(note.IsContinuedBend);
        alphaTab.test.Assert.IsFalse(note.HasBend);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.None, note.BendType);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(15).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        alphaTab.test.Assert.AreEqual_T1_T22(10, note.Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.None, note.BendType);
        note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(15).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(1);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.BendType.Bend, note.BendType);
        alphaTab.test.Assert.AreEqual_T1_T22(2, note.BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, note.BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, note.BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, note.BendPoints.get_Item(1).Value);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestBendAdvanced");
    }

    @:testMethod
    public function TestTremolo() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestTremolo.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
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
        // in case of dive the middle point is already on an earlier position
        alphaTab.test.Assert.AreEqual_T1_T22(15, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(15, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-12, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-12, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(45, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(3).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(3).Value);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestTremolo");
    }

    @:testMethod
    public function TestSlides() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestSlides.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckSlides(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestSlides");
    }

    @:testMethod
    public function TestVibrato() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestVibrato.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckVibrato(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestVibrato");
    }

    @:testMethod
    public function TestTrills() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestTrills.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTrills(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestTrills");
    }

    @:testMethod
    public function TestOtherEffects() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestOtherEffects.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckOtherEffects(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestOtherEffects");
    }

    @:testMethod
    public function TestFingering() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestFingering.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckFingering(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestFingering");
    }

    @:testMethod
    public function TestStroke() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestStrokes.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStroke(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestStroke");
    }

    @:testMethod
    public function TestTuplets() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestTuplets.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTuplets(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestTuplets");
    }

    @:testMethod
    public function TestRanges() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestRanges.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckRanges(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestRanges");
    }

    @:testMethod
    public function TestEffects() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/Effects.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckEffects(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestEffects");
    }

    @:testMethod
    public function TestSerenade() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/Serenade.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        // only Check reading
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestSerenade");
    }

    @:testMethod
    public function TestStrings() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestStrings.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStrings(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestStrings");
    }

    @:testMethod
    public function TestKeySignatures() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestKeySignatures.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckKeySignatures(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestKeySignatures");
    }

    @:testMethod
    public function TestChords() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/TestChords.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckChords(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestChords");
    }

    @:testMethod
    public function TestColors() : Void 
    {
        var reader : alphaTab.importer.Gp7Importer = PrepareGp7ImporterWithBytes_CsString("GuitarPro7/Colors.gp");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckColors(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\Gp7ImporterTest.cs", "TestColors");
    }

    public function new() 
    {
        super();
    }

}
