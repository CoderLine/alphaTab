package alphaTab.test.importer;

using system.HaxeExtensions;
class GpxImporterTest extends alphaTab.test.importer.GpImporterTestBase
{
    public function Load(name : system.CsString) : system.FixedArray<system.Byte> 
    {
        var path : system.CsString = "TestFiles/";
        return system.io.File.ReadAllBytes(system.io.Path.Combine_CsString_CsString(path, name));

    }

    public function PrepareImporterWithFile(name : system.CsString) : alphaTab.importer.GpxImporter 
    {
        return PrepareImporterWithBytes(Load(name));

    }

    public function PrepareImporterWithBytes(buffer : system.FixedArray<system.Byte>) : alphaTab.importer.GpxImporter 
    {
        var readerBase : alphaTab.importer.GpxImporter = new alphaTab.importer.GpxImporter();
        readerBase.Init(alphaTab.io.ByteBuffer.FromBuffer(buffer));
        return readerBase;

    }

    @Test
    public function TestFileSystemCompressed() : Void 
    {
        var fileSystem : alphaTab.importer.GpxFileSystem = new alphaTab.importer.GpxFileSystem();
        fileSystem.Load(alphaTab.io.ByteBuffer.FromBuffer(Load("GuitarPro6/Compressed.gpx")));
        var names : system.FixedArray<system.CsString> = ["score.gpif", "misc.xml", "BinaryStylesheet", "PartConfiguration", "LayoutConfiguration"];
        var sizes : system.FixedArray<system.Int32> = [8488, 130, 12204, 20, 12];
        {
            var i: system.Int32 = 0;
            while (i < fileSystem.Files.Count)
            {
                var file : alphaTab.importer.GpxFile = fileSystem.Files.get_Item(i);
                alphaTab.util.Logger.Info("Test", system.CsString.Format("{0} - {1}", [file.FileName, file.FileSize]), null);
                massive.munit.Assert.areEqual(names[i], file.FileName);
                massive.munit.Assert.areEqual(sizes[i], file.FileSize);
                i++;
            }
        }
    }

    @Test
    public function TestScoreInfo() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/Test01.gpx");
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
        massive.munit.Assert.areEqual("Notice1\nNotice2", score.Notices);
        massive.munit.Assert.areEqual(5, score.MasterBars.Count);
        massive.munit.Assert.areEqual(2, score.Tracks.Count);
        massive.munit.Assert.areEqual("Track 1", score.Tracks.get_Item(0).Name);
        massive.munit.Assert.areEqual("Track 2", score.Tracks.get_Item(1).Name);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestScoreInfo");
    }

    @Test
    public function TestNotes() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/Test02.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest02Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestNotes");
    }

    @Test
    public function TestTimeSignatures() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/Test03.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTest03Score(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestTimeSignatures");
    }

    @Test
    public function TestDead() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestDead.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckDead(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestDead");
    }

    @Test
    public function TestGrace() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestGrace.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckGrace(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestGrace");
    }

    @Test
    public function TestAccentuation() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestAccentuations.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckAccentuation(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestAccentuation");
    }

    @Test
    public function TestHarmonics() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestHarmonics.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHarmonics(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestHarmonics");
    }

    @Test
    public function TestHammer() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestHammer.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckHammer(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestHammer");
    }

    @Test
    public function TestBend() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestBends.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(12, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Offset);
        massive.munit.Assert.areEqual(6, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).BendPoints.get_Item(2).Value);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestBend");
    }

    @Test
    public function TestTremolo() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestTremolo.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        massive.munit.Assert.areEqual(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.Count);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Offset);
        massive.munit.Assert.areEqual(-4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(0).Value);
        massive.munit.Assert.areEqual(15, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Offset);
        massive.munit.Assert.areEqual(-12, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(1).Value);
        massive.munit.Assert.areEqual(30, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Offset);
        massive.munit.Assert.areEqual(-12, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(2).Value);
        massive.munit.Assert.areEqual(45, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(3).Offset);
        massive.munit.Assert.areEqual(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).WhammyBarPoints.get_Item(3).Value);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestTremolo");
    }

    @Test
    public function TestSlides() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestSlides.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckSlides(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestSlides");
    }

    @Test
    public function TestVibrato() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestVibrato.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckVibrato(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestVibrato");
    }

    @Test
    public function TestTrills() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestTrills.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTrills(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestTrills");
    }

    @Test
    public function TestOtherEffects() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestOtherEffects.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckOtherEffects(score, true);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestOtherEffects");
    }

    @Test
    public function TestFingering() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestFingering.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckFingering(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestFingering");
    }

    @Test
    public function TestStroke() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestStrokes.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStroke(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestStroke");
    }

    @Test
    public function TestTuplets() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestTuplets.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckTuplets(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestTuplets");
    }

    @Test
    public function TestRanges() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestRanges.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckRanges(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestRanges");
    }

    @Test
    public function TestEffects() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/Effects.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckEffects(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestEffects");
    }

    @Test
    public function TestSerenade() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/Serenade.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        // only Check reading
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestSerenade");
    }

    @Test
    public function TestStrings() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestStrings.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckStrings(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestStrings");
    }

    @Test
    public function TestKeySignatures() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestKeySignatures.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckKeySignatures(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestKeySignatures");
    }

    @Test
    public function TestChords() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/TestChords.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckChords(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestChords");
    }

    @Test
    public function TestColors() : Void 
    {
        var reader : alphaTab.importer.GpxImporter = PrepareImporterWithFile("GuitarPro6/Colors.gpx");
        var score : alphaTab.model.Score = reader.ReadScore();
        CheckColors(score);
        Render(score, "D:\\Dev\\AlphaTab\\AlphaTab2\\Source\\AlphaTab.Test\\Importer\\GpxImporterTest.cs", "TestColors");
    }

    public function new() 
    {
        super();
    }

}
