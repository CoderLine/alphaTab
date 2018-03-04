package alphaTab.test.importer;

using system.HaxeExtensions;
@:testClass
class AlphaTexImporterTest
{
    private function ParseTex(tex : system.CsString) : alphaTab.model.Score 
    {
        var importer : alphaTab.importer.AlphaTexImporter = new alphaTab.importer.AlphaTexImporter();
        importer.Init(alphaTab.test.TestPlatform.CreateStringReader(tex));
        return importer.ReadScore();

    }

    @:testMethod
    public function EnsureMetadataParsing_Issue73() : Void 
    {
        var tex : system.CsString = "\\title Test\r\n                        \\words test\r\n                        \\music alphaTab\r\n                        \\copyright test\r\n                        \\tempo 200\r\n                        \\instrument 30\r\n                        \\capo 2\r\n                        \\tuning G3 D2 G2 B2 D3 A4\r\n                        .\r\n                        0.5.2 1.5.4 3.4.4 | 5.3.8 5.3.8 5.3.8 5.3.8 r.2";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22("Test", score.Title);
        alphaTab.test.Assert.AreEqual_T1_T22("test", score.Words);
        alphaTab.test.Assert.AreEqual_T1_T22("alphaTab", score.Music);
        alphaTab.test.Assert.AreEqual_T1_T22("test", score.Copyright);
        alphaTab.test.Assert.AreEqual_T1_T22(200, score.Tempo);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(30, score.Tracks.get_Item(0).PlaybackInfo.Program);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Capo);
        alphaTab.test.Assert.AreEqual_T1_T22("55,38,43,47,50,69", system.CsString.Join_CsString_IEnumerable_T1(",", score.Tracks.get_Item(0).Tuning));
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        {
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Half, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Duration);
            alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.Count);
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Quarter, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Duration);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.Count);
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Quarter, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Duration);
            alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).String);
        }
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.Count);
        {
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Eighth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Duration);
            alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.Count);
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Eighth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Duration);
            alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Notes.Count);
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Eighth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Duration);
            alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Notes.Count);
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Eighth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Duration);
            alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).Fret);
            alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).String);
            alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(4).Notes.Count);
            alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Half, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(4).Duration);
            alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(4).IsRest);
        }
    }

    @:testMethod
    public function TestTuning() : Void 
    {
        var tex : system.CsString = "\\tuning E4 B3 G3 D3 A2 E2\r\n                        .\r\n                        0.5.1";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(system.CsString.Join_CsString_IEnumerable_T1(",", alphaTab.model.Tuning.GetDefaultTuningFor(6).Tunings), system.CsString.Join_CsString_IEnumerable_T1(",", score.Tracks.get_Item(0).Tuning));
    }

    @:testMethod
    public function DeadNotes1_Issue79() : Void 
    {
        var tex : system.CsString = ":4 x.3";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsDead);
    }

    @:testMethod
    public function DeadNotes2_Issue79() : Void 
    {
        var tex : system.CsString = ":4 3.3{x}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(0, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsDead);
    }

    @:testMethod
    public function Trill_Issue79() : Void 
    {
        var tex : system.CsString = ":4 3.3{tr 5 16}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsTrill);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Sixteenth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).TrillSpeed);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).TrillFret);
    }

    @:testMethod
    public function Tremolo_Issue79() : Void 
    {
        var tex : system.CsString = ":4 3.3{tr 5 16}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsTrill);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Sixteenth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).TrillSpeed);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).TrillFret);
    }

    @:testMethod
    public function TremoloPicking_Issue79() : Void 
    {
        var tex : system.CsString = ":4 3.3{tp 16}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(3, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).Fret);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).IsTremolo);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Duration.Sixteenth, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).TremoloSpeed.Value);
    }

    @:testMethod
    public function Hamonics_Issue79() : Void 
    {
        var tex : system.CsString = ":8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Natural, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).HarmonicType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Artificial, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).HarmonicType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Tap, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).HarmonicType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Pinch, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).HarmonicType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.HarmonicType.Semi, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(4).Notes.get_Item(0).HarmonicType);
    }

    @:testMethod
    public function HamonicsRenderingText_Issue79() : Void 
    {
        var tex : system.CsString = ":8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.Environment.StaveProfiles.set_Item("harmonics", [new alphaTab.rendering.EffectBarRendererFactory("harmonics", [new alphaTab.rendering.effects.HarmonicsEffectInfo()])]);
        var settings : alphaTab.Settings = alphaTab.Settings.Defaults;
        settings.Engine = "svg";
        settings.Staves = new alphaTab.StaveSettings("harmonics");
        var renderer : alphaTab.rendering.ScoreRenderer = new alphaTab.rendering.ScoreRenderer(settings);
        var svg : system.CsString = "";
        renderer.PartialRenderFinished += function (r){
    svg = svg + (system.ObjectExtensions.ToString(r.RenderResult));
}
;
        renderer.Render(score, [0]);
        var regexTemplate : system.CsString = "<text[^>]+>\\s*{0}\\s*</text>";
        alphaTab.test.Assert.IsTrue(alphaTab.test.TestPlatform.IsMatch(svg, system.CsString.Format_CsString_Object(regexTemplate, alphaTab.rendering.effects.HarmonicsEffectInfo.HarmonicToString(alphaTab.model.HarmonicType.Natural))));
        alphaTab.test.Assert.IsTrue(alphaTab.test.TestPlatform.IsMatch(svg, system.CsString.Format_CsString_Object(regexTemplate, alphaTab.rendering.effects.HarmonicsEffectInfo.HarmonicToString(alphaTab.model.HarmonicType.Artificial))));
        alphaTab.test.Assert.IsTrue(alphaTab.test.TestPlatform.IsMatch(svg, system.CsString.Format_CsString_Object(regexTemplate, alphaTab.rendering.effects.HarmonicsEffectInfo.HarmonicToString(alphaTab.model.HarmonicType.Tap))));
        alphaTab.test.Assert.IsTrue(alphaTab.test.TestPlatform.IsMatch(svg, system.CsString.Format_CsString_Object(regexTemplate, alphaTab.rendering.effects.HarmonicsEffectInfo.HarmonicToString(alphaTab.model.HarmonicType.Pinch))));
        alphaTab.test.Assert.IsTrue(alphaTab.test.TestPlatform.IsMatch(svg, system.CsString.Format_CsString_Object(regexTemplate, alphaTab.rendering.effects.HarmonicsEffectInfo.HarmonicToString(alphaTab.model.HarmonicType.Semi))));
    }

    @:testMethod
    public function Grace_Issue79() : Void 
    {
        var tex : system.CsString = ":8 3.3{gr} 3.3{gr ob}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.GraceType.BeforeBeat, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).GraceType);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.GraceType.OnBeat, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).GraceType);
    }

    @:testMethod
    public function BendRendering_Issue79() : Void 
    {
        var tex : system.CsString = ":4 15.6{b(0 4)} 18.6{b(0 6)} 17.6{b(0 8)} 16.6{b(0 3 0)} | 15.6{b(0 8 4)} 14.6{b(4 4)} 13.6{b(4 6)} 14.6{b(4 0)}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.Environment.StaveProfiles.set_Item("tabOnly", [new alphaTab.rendering.TabBarRendererFactory(false, false, false)]);
        var settings : alphaTab.Settings = alphaTab.Settings.Defaults;
        settings.Engine = "svg";
        settings.Layout.Mode = "horizontal";
        settings.Staves = new alphaTab.StaveSettings("tabOnly");
        var renderer : alphaTab.rendering.ScoreRenderer = new alphaTab.rendering.ScoreRenderer(settings);
        var partials : alphaTab.collections.FastList<system.CsString> = new alphaTab.collections.FastList<system.CsString>();
        renderer.PartialRenderFinished += function (r){
    partials.Add(system.ObjectExtensions.ToString(r.RenderResult));
}
;
        renderer.Render(score, [0]);
        var tab : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(partials.get_Item(0));
        var texts : system.FixedArray<alphaTab.xml.XmlNode> = tab.GetElementsByTagName("text", true);
        var expectedTexts : system.FixedArray<system.CsString> = [alphaTab.platform.Platform.StringFromCharCode((alphaTab.rendering.glyphs.MusicFontSymbol.ClefTab).ToInt32_IFormatProvider(null)), "1", "15", "full", "18", "1½", "17", "2", "16", "¾", "2", "15", "2", "-1", "14", "full", "13", "full", "1½", "14", "full"];
        {
            var i: system.Int32 = 0;
            while (i < expectedTexts.Length)
            {
                var text : system.CsString = texts[i].InnerText.Trim();
                alphaTab.test.Assert.AreEqual_T1_T2_CsString_ObjectArray2(expectedTexts[i], text, "Mismatch at index {0}", [i]);
                i++;
            }
        }
    }

    @:testMethod
    public function TestLeftHandFingerSingleNote() : Void 
    {
        var tex : system.CsString = ":8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.Thumb, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.IndexFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.MiddleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.AnnularFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.LittleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(4).Notes.get_Item(0).LeftHandFinger);
    }

    @:testMethod
    public function TestRightHandFingerSingleNote() : Void 
    {
        var tex : system.CsString = ":8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{rf 5}";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.Thumb, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.IndexFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.MiddleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.AnnularFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.LittleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(4).Notes.get_Item(0).RightHandFinger);
    }

    @:testMethod
    public function TestLeftHandFingerChord() : Void 
    {
        var tex : system.CsString = ":8 (3.1{lf 1} 3.2{lf 2} 3.3{lf 3} 3.4{lf 4} 3.5{lf 5})";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.Thumb, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.IndexFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(1).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.MiddleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(2).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.AnnularFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(3).LeftHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.LittleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(4).LeftHandFinger);
    }

    @:testMethod
    public function TestRightHandFingerChord() : Void 
    {
        var tex : system.CsString = ":8 (3.1{rf 1} 3.2{rf 2} 3.3{rf 3} 3.4{rf 4} 3.5{rf 5})";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(5, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.Thumb, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.IndexFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(1).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.MiddleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(2).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.AnnularFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(3).RightHandFinger);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.model.Fingers.LittleFinger, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(4).RightHandFinger);
    }

    @:testMethod
    public function TestUnstringed() : Void 
    {
        var tex : system.CsString = "\\tuning piano . c4 c#4 d4 d#4 | c4 db4 d4 eb4";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.MasterBars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPiano);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).RealValue);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPiano);
        alphaTab.test.Assert.AreEqual_T1_T22(61, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).RealValue);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPiano);
        alphaTab.test.Assert.AreEqual_T1_T22(62, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).RealValue);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPiano);
        alphaTab.test.Assert.AreEqual_T1_T22(63, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).RealValue);
        alphaTab.test.Assert.AreEqual_T1_T22(4, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPiano);
        alphaTab.test.Assert.AreEqual_T1_T22(60, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).RealValue);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPiano);
        alphaTab.test.Assert.AreEqual_T1_T22(61, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(1).Notes.get_Item(0).RealValue);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPiano);
        alphaTab.test.Assert.AreEqual_T1_T22(62, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(2).Notes.get_Item(0).RealValue);
        alphaTab.test.Assert.AreEqual_T1_T22(true, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0).IsPiano);
        alphaTab.test.Assert.AreEqual_T1_T22(63, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(1).Voices.get_Item(0).Beats.get_Item(3).Notes.get_Item(0).RealValue);
    }

    public function new() 
    {
    }

}
