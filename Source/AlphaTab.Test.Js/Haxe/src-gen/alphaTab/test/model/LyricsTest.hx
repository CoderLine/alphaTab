package alphaTab.test.model;

using system.HaxeExtensions;
class LyricsTest
{
    public function LoadLyricsTemplateFile() : alphaTab.model.Score 
    {
        var path : system.CsString = "TestFiles/GuitarPro6/LyricsTemplate.gpx";
        var buffer : alphaTab.io.ByteBuffer = alphaTab.io.ByteBuffer.FromBuffer(alphaTab.test.TestPlatform.LoadFile(path));
        var importer : alphaTab.importer.GpxImporter = new alphaTab.importer.GpxImporter();
        importer.Init(buffer);
        return importer.ReadScore();

    }

    @Test
    public function TestApplySingleLineFirstBar() : Void 
    {
        var score : alphaTab.model.Score = LoadLyricsTemplateFile();
        score.Tracks.get_Item(0).ApplyLyrics(new alphaTab.collections.FastList<alphaTab.model.Lyrics>());
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        massive.munit.Assert.areEqual("AAA", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        massive.munit.Assert.areEqual("BBB", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        massive.munit.Assert.areEqual(null, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        massive.munit.Assert.areEqual("CCC", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        massive.munit.Assert.areEqual("DDD", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        massive.munit.Assert.areEqual("EEE", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
    }

    @Test
    public function TestApplySingleLineBarOffset() : Void 
    {
        var score : alphaTab.model.Score = LoadLyricsTemplateFile();
        score.Tracks.get_Item(0).ApplyLyrics(new alphaTab.collections.FastList<alphaTab.model.Lyrics>());
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        massive.munit.Assert.areEqual("AAA", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        massive.munit.Assert.areEqual("BBB", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        massive.munit.Assert.areEqual(null, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        massive.munit.Assert.areEqual("CCC", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        massive.munit.Assert.areEqual("DDD", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        massive.munit.Assert.areEqual("EEE", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
    }

    @Test
    public function TestApplyMultiLineFirstBar() : Void 
    {
        var score : alphaTab.model.Score = LoadLyricsTemplateFile();
        score.Tracks.get_Item(0).ApplyLyrics(new alphaTab.collections.FastList<alphaTab.model.Lyrics>());
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        massive.munit.Assert.areEqual("AAA", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        massive.munit.Assert.areEqual("111", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics[1]);
        massive.munit.Assert.areEqual("BBB", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        massive.munit.Assert.areEqual("222", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Lyrics[1]);
        massive.munit.Assert.areEqual(null, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        massive.munit.Assert.areEqual("CCC", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        massive.munit.Assert.areEqual("333", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Lyrics[1]);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        massive.munit.Assert.areEqual("DDD", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        massive.munit.Assert.areEqual("444", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[1]);
        massive.munit.Assert.areEqual("EEE", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        massive.munit.Assert.areEqual("555", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[1]);
    }

    @Test
    public function TestApplyMultiLineBarOffset() : Void 
    {
        var score : alphaTab.model.Score = LoadLyricsTemplateFile();
        score.Tracks.get_Item(0).ApplyLyrics(new alphaTab.collections.FastList<alphaTab.model.Lyrics>());
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        massive.munit.Assert.areEqual(null, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        massive.munit.Assert.areEqual("111", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[1]);
        massive.munit.Assert.areEqual(null, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        massive.munit.Assert.areEqual("222", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[1]);
        massive.munit.Assert.areEqual(null, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        massive.munit.Assert.areEqual(null, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        massive.munit.Assert.areEqual("333", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Lyrics[1]);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        massive.munit.Assert.areEqual("AAA", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        massive.munit.Assert.areEqual("444", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics[1]);
        massive.munit.Assert.areEqual("BBB", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        massive.munit.Assert.areEqual("555", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(1).Lyrics[1]);
        massive.munit.Assert.areEqual(null, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        massive.munit.Assert.areEqual("CCC", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        massive.munit.Assert.areEqual(null, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(3).Lyrics[1]);
    }

    @Test
    public function TestSpaces() : Void 
    {
        TestLyrics("AAA BBB CCC DDD EEE", ["AAA", "BBB", "CCC", "DDD", "EEE"]);
        TestLyrics("AAA  BBB   CCC", ["AAA", "", "BBB", "", "", "CCC"]);
    }

    @Test
    public function TestNewLines() : Void 
    {
        TestLyrics("AAA\r\nBBB\rCCC\nDDD\r\nEEE", ["AAA", "BBB", "CCC", "DDD", "EEE"]);
    }

    @Test
    public function TestDash() : Void 
    {
        TestLyrics("AAA-BBB CCC- DDD EEE--FFF", ["AAA-", "BBB", "CCC-", "DDD", "EEE--", "FFF"]);
    }

    @Test
    public function TestPlus() : Void 
    {
        TestLyrics("AAA+BBB CCC++DDD EEE+ FFF", ["AAA BBB", "CCC  DDD", "EEE ", "FFF"]);
    }

    @Test
    public function TestComments() : Void 
    {
        TestLyrics("[ABCD]AAA BBB", ["AAA", "BBB"]);
        TestLyrics("[ABCD] AAA BBB", ["", "AAA", "BBB"]);
        TestLyrics("[AAA BBB\r\nCCC DDD]AAA BBB", ["AAA", "BBB"]);
        TestLyrics("[AAA BBB\r\nCCC DDD] AAA BBB", ["", "AAA", "BBB"]);
        TestLyrics("[AAA] AAA [BBB] BBB [CCC] CCC [DDD] DDD", ["", "AAA", "", "BBB", "", "CCC", "", "DDD"]);
    }

    private function TestLyrics(text : system.CsString, chunks : system.FixedArray<system.CsString>) : Void 
    {
        var lyrics : alphaTab.model.Lyrics = new alphaTab.model.Lyrics();
        lyrics.Text = text;
        lyrics.Finish();
        massive.munit.Assert.areEqual(system.CsString.Join_CsString_CsStringArray(", ", chunks), system.CsString.Join_CsString_CsStringArray(", ", lyrics.Chunks));
    }

    public function new() 
    {
    }

}
