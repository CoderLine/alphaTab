package alphaTab.test.importer;

using system.HaxeExtensions;
@:testClass
class GpxImporterTest extends alphaTab.test.importer.GpImporterTestBase
{
    public function Load(name : system.CsString) : system.ByteArray 
    {
        var path : system.CsString = "TestFiles/";
        return alphaTab.test.TestPlatform.LoadFile(path + name);

    }

    public function PrepareGpxImporterWithFile(name : system.CsString) : alphaTab.importer.GpxImporter 
    {
        return PrepareGpxImporterWithBytes(Load(name));

    }

    public function PrepareGpxImporterWithBytes(buffer : system.ByteArray) : alphaTab.importer.GpxImporter 
    {
        var readerBase : alphaTab.importer.GpxImporter = new alphaTab.importer.GpxImporter();
        readerBase.Init(alphaTab.io.ByteBuffer.FromBuffer(buffer), null);
        return readerBase;

    }

    @:testMethod
    public function TestFileSystemCompressed() : Void 
    {
        var fileSystem : alphaTab.importer.GpxFileSystem = new alphaTab.importer.GpxFileSystem();
        fileSystem.Load(alphaTab.io.ByteBuffer.FromBuffer(Load("GuitarPro6/Compressed.gpx")));
        var names : system.FixedArray<system.CsString> = ["score.gpif", "misc.xml", "BinaryStylesheet", "PartConfiguration", "LayoutConfiguration"];
        var sizes : system.Int32Array = [8488, 130, 12204, 20, 12];
        {
            var i: system.Int32 = 0;
            while (i < fileSystem.Files.Count)
            {
                var file : alphaTab.importer.GpxFile = fileSystem.Files.get_Item(i);
                alphaTab.util.Logger.Info("Test", system.CsString.Format("{0} - {1}", [file.FileName, file.FileSize]), null);
                alphaTab.test.Assert.AreEqual_T1_T22(names[i], file.FileName);
                alphaTab.test.Assert.AreEqual_T1_T22(sizes[i], file.FileSize);
                i++;
            }
        }
    }

    @:testMethod
    public function TestScoreInfo() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/Test01.gpx");
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
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestScoreInfo");
    }

    @:testMethod
    public function TestNotes() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/Test02.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest02Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestNotes");
    }

    @:testMethod
    public function TestTimeSignatures() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/Test03.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest03Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestTimeSignatures");
    }

    @:testMethod
    public function TestDead() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestDead.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckDead(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestDead");
    }

    @:testMethod
    public function TestGrace() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestGrace.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckGrace(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestGrace");
    }

    @:testMethod
    public function TestAccentuation() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestAccentuations.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckAccentuation(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestAccentuation");
    }

    @:testMethod
    public function TestHarmonics() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestHarmonics.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHarmonics(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestHarmonics");
    }

    @:testMethod
    public function TestHammer() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestHammer.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHammer(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestHammer");
    }

    @:testMethod
    @:testIgnore("appveyor fails for some reason, locally everything is fine?")
    public function TestBend() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestBends.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(12, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(6, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Value);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestBend");
    }

    @:testMethod
    @:testIgnore("appveyor fails for some reason, locally everything is fine?")
    public function TestTremolo() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestTremolo.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
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
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestTremolo");
    }

    @:testMethod
    public function TestSlides() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestSlides.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckSlides(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestSlides");
    }

    @:testMethod
    public function TestVibrato() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestVibrato.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckVibrato(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestVibrato");
    }

    @:testMethod
    public function TestTrills() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestTrills.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTrills(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestTrills");
    }

    @:testMethod
    public function TestOtherEffects() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestOtherEffects.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckOtherEffects(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestOtherEffects");
    }

    @:testMethod
    public function TestFingering() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestFingering.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckFingering(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestFingering");
    }

    @:testMethod
    public function TestStroke() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestStrokes.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStroke(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestStroke");
    }

    @:testMethod
    public function TestTuplets() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestTuplets.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTuplets(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestTuplets");
    }

    @:testMethod
    public function TestRanges() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestRanges.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckRanges(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestRanges");
    }

    @:testMethod
    public function TestEffects() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/Effects.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckEffects(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestEffects");
    }

    @:testMethod
    public function TestSerenade() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/Serenade.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        // only Check reading
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestSerenade");
    }

    @:testMethod
    public function TestStrings() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestStrings.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStrings(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestStrings");
    }

    @:testMethod
    public function TestKeySignatures() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestKeySignatures.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckKeySignatures(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestKeySignatures");
    }

    @:testMethod
    public function TestChords() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/TestChords.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckChords(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestChords");
    }

    @:testMethod
    public function TestColors() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareGpxImporterWithFile("GuitarPro6/Colors.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckColors(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestColors");
    }

    public function new() 
    {
        super();
    }

}
