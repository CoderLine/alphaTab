package alphaTab.test.model;

using system.HaxeExtensions;
@:testClass
class LyricsTest
{
    public function LoadLyricsTemplateFile() : alphaTab.model.Score 
    {
        var path : system.CsString = "TestFiles/GuitarPro6/LyricsTemplate.gpx";
        var buffer : alphaTab.io.ByteBuffer = alphaTab.io.ByteBuffer.FromBuffer(alphaTab.test.TestPlatform.LoadFile(path));
        var importer : alphaTab.importer.GpxImporter = new alphaTab.importer.GpxImporter();
        importer.Init(buffer, null);
        return importer.ReadScore();

    }

    @:testMethod
    public function TestApplySingleLineFirstBar() : Void 
    {
        var score : alphaTab.model.Score = LoadLyricsTemplateFile();
        score.Tracks.get_Item(0).ApplyLyrics((function (){
    var _tmp = new alphaTab.collections.FastList<alphaTab.model.Lyrics>();
    _tmp.Add((function (){
        var _tmp1 = new alphaTab.model.Lyrics();
        _tmp1.Text = "AAA BBB CCC DDD EEE";
        _tmp1.StartBar = 0;
        return _tmp1;
    })());
    return _tmp;
})());
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        alphaTab.test.Assert.AreEqual_T1_T22("AAA", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("BBB", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        alphaTab.test.Assert.AreEqual_T1_T22("CCC", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        alphaTab.test.Assert.AreEqual_T1_T22("DDD", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("EEE", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
    }

    @:testMethod
    public function TestApplySingleLineBarOffset() : Void 
    {
        var score : alphaTab.model.Score = LoadLyricsTemplateFile();
        score.Tracks.get_Item(0).ApplyLyrics((function (){
    var _tmp = new alphaTab.collections.FastList<alphaTab.model.Lyrics>();
    _tmp.Add((function (){
        var _tmp1 = new alphaTab.model.Lyrics();
        _tmp1.Text = "AAA BBB CCC DDD EEE";
        _tmp1.StartBar = 2;
        return _tmp1;
    })());
    return _tmp;
})());
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        alphaTab.test.Assert.AreEqual_T1_T22("AAA", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("BBB", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        alphaTab.test.Assert.AreEqual_T1_T22("CCC", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        alphaTab.test.Assert.AreEqual_T1_T22("DDD", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("EEE", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(3).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
    }

    @:testMethod
    public function TestApplyMultiLineFirstBar() : Void 
    {
        var score : alphaTab.model.Score = LoadLyricsTemplateFile();
        score.Tracks.get_Item(0).ApplyLyrics((function (){
    var _tmp = new alphaTab.collections.FastList<alphaTab.model.Lyrics>();
    _tmp.Add((function (){
        var _tmp1 = new alphaTab.model.Lyrics();
        _tmp1.Text = "AAA BBB CCC DDD EEE";
        _tmp1.StartBar = 0;
        return _tmp1;
    })());
    _tmp.Add((function (){
        var _tmp1 = new alphaTab.model.Lyrics();
        _tmp1.Text = "111 222 333 444 555";
        _tmp1.StartBar = 0;
        return _tmp1;
    })());
    return _tmp;
})());
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        alphaTab.test.Assert.AreEqual_T1_T22("AAA", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("111", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Lyrics[1]);
        alphaTab.test.Assert.AreEqual_T1_T22("BBB", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("222", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Lyrics[1]);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        alphaTab.test.Assert.AreEqual_T1_T22("CCC", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("333", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Lyrics[1]);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        alphaTab.test.Assert.AreEqual_T1_T22("DDD", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("444", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[1]);
        alphaTab.test.Assert.AreEqual_T1_T22("EEE", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("555", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[1]);
    }

    @:testMethod
    public function TestApplyMultiLineBarOffset() : Void 
    {
        var score : alphaTab.model.Score = LoadLyricsTemplateFile();
        score.Tracks.get_Item(0).ApplyLyrics((function (){
    var _tmp = new alphaTab.collections.FastList<alphaTab.model.Lyrics>();
    _tmp.Add((function (){
        var _tmp1 = new alphaTab.model.Lyrics();
        _tmp1.Text = "AAA BBB CCC DDD EEE";
        _tmp1.StartBar = 2;
        return _tmp1;
    })());
    _tmp.Add((function (){
        var _tmp1 = new alphaTab.model.Lyrics();
        _tmp1.Text = "111 222 333 444 555";
        _tmp1.StartBar = 1;
        return _tmp1;
    })());
    return _tmp;
})());
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("111", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Lyrics[1]);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("222", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Lyrics[1]);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("333", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Lyrics[1]);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics.Length);
        alphaTab.test.Assert.AreEqual_T1_T22("AAA", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("444", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(0).Lyrics[1]);
        alphaTab.test.Assert.AreEqual_T1_T22("BBB", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(1).Lyrics[0]);
        alphaTab.test.Assert.AreEqual_T1_T22("555", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(1).Lyrics[1]);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(2).Lyrics);
        alphaTab.test.Assert.AreEqual_T1_T22("CCC", score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(3).Lyrics[0]);
        alphaTab.test.Assert.IsNull(score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(2).Voices.get_Item(0).Beats.get_Item(3).Lyrics[1]);
    }

    @:testMethod
    public function TestSpaces() : Void 
    {
        TestLyrics("AAA BBB CCC DDD EEE", ["AAA", "BBB", "CCC", "DDD", "EEE"]);
        TestLyrics("AAA  BBB   CCC", ["AAA", "", "BBB", "", "", "CCC"]);
    }

    @:testMethod
    public function TestNewLines() : Void 
    {
        TestLyrics("AAA\r\nBBB\rCCC\nDDD\r\nEEE", ["AAA", "BBB", "CCC", "DDD", "EEE"]);
    }

    @:testMethod
    public function TestDash() : Void 
    {
        TestLyrics("AAA-BBB CCC- DDD EEE--FFF", ["AAA-", "BBB", "CCC-", "DDD", "EEE--", "FFF"]);
    }

    @:testMethod
    public function TestPlus() : Void 
    {
        TestLyrics("AAA+BBB CCC++DDD EEE+ FFF", ["AAA BBB", "CCC  DDD", "EEE ", "FFF"]);
    }

    @:testMethod
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
        alphaTab.test.Assert.AreEqual_T1_T22(system.CsString.Join_CsString_CsStringArray(", ", chunks), system.CsString.Join_CsString_CsStringArray(", ", lyrics.Chunks));
    }

    public function new() 
    {
    }

}
