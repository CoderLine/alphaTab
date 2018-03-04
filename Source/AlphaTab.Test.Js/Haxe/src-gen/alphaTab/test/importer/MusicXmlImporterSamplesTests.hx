package alphaTab.test.importer;

using system.HaxeExtensions;
@:testClass
@:testIgnore
class MusicXmlImporterSamplesTests extends alphaTab.test.importer.MusicXmlImporterTestBase
{
    @:testMethod
    public function Test_ActorPreludeSample() : Void 
    {
        TestReference("Test_ActorPreludeSample", "horizontal", true);
    }

    @:testMethod
    public function Test_BeetAnGeSample() : Void 
    {
        TestReference("Test_BeetAnGeSample", "page", true);
    }

    @:testMethod
    public function Test_Binchois() : Void 
    {
        TestReference("Test_Binchois", "page", true);
    }

    @:testMethod
    public function Test_BrahWiMeSample() : Void 
    {
        TestReference("Test_BrahWiMeSample", "page", true);
    }

    @:testMethod
    public function Test_BrookeWestSample() : Void 
    {
        TestReference("Test_BrookeWestSample", "page", true);
    }

    @:testMethod
    public function Test_Chant() : Void 
    {
        TestReference("Test_Chant", "page", true);
    }

    @:testMethod
    public function Test_DebuMandSample() : Void 
    {
        TestReference("Test_DebuMandSample", "page", true);
    }

    @:testMethod
    public function Test_Dichterliebe01() : Void 
    {
        TestReference("Test_Dichterliebe01", "page", true);
    }

    @:testMethod
    public function Test_Echigo() : Void 
    {
        TestReference("Test_Echigo", "page", true);
    }

    @:testMethod
    public function Test_FaurReveSample() : Void 
    {
        TestReference("Test_FaurReveSample", "page", true);
    }

    @:testMethod
    public function Test_MahlFaGe4Sample() : Void 
    {
        TestReference("Test_MahlFaGe4Sample", "page", true);
    }

    @:testMethod
    public function Test_MozaChloSample() : Void 
    {
        TestReference("Test_MozaChloSample", "page", true);
    }

    @:testMethod
    public function Test_MozartPianoSonata() : Void 
    {
        TestReference("Test_MozartPianoSonata", "page", true);
    }

    @:testMethod
    public function Test_MozartTrio() : Void 
    {
        TestReference("Test_MozartTrio", "page", true);
    }

    @:testMethod
    public function Test_MozaVeilSample() : Void 
    {
        TestReference("Test_MozaVeilSample", "page", true);
    }

    @:testMethod
    public function Test_Saltarello() : Void 
    {
        TestReference("Test_Saltarello", "page", true);
    }

    @:testMethod
    public function Test_SchbAvMaSample() : Void 
    {
        TestReference("Test_SchbAvMaSample", "page", true);
    }

    @:testMethod
    public function Test_Telemann() : Void 
    {
        TestReference("Test_Telemann", "page", true);
    }

    private function TestReference(caller : system.CsString = null, renderLayout : system.CsString = "page", renderAllTracks : system.Boolean = true) : alphaTab.model.Score 
    {
        var fileId : system.CsString = caller.Split_CharArray([system.Char.fromCode(95)])[1];
        var path : system.CsString = "TestFiles/MusicXmlSamples";
        var file : system.CsString = path + fileId + ".xml";
        return TestReferenceFile(file, renderLayout, renderAllTracks);

    }

    public function new() 
    {
        super();
    }

}
