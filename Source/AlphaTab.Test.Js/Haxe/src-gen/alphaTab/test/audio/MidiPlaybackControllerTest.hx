package alphaTab.test.audio;

using system.HaxeExtensions;
class MidiPlaybackControllerTest extends alphaTab.test.importer.GpImporterTestBase
{
    @Test
    public function TestRepeatClose() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5\\RepeatClose.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        var expectedIndexes : system.Int32Array = [0, 1, 0, 1, 2];
        TestRepeat(score, expectedIndexes);
    }

    @Test
    public function TestRepeatCloseMulti() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5\\RepeatCloseMulti.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        var expectedIndexes : system.Int32Array = [0, 1, 0, 1, 0, 1, 0, 1, 2];
        TestRepeat(score, expectedIndexes);
    }

    @Test
    public function TestRepeatCloseWithoutStartAtBeginning() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5\\RepeatCloseWithoutStartAtBeginning.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        var expectedIndexes : system.Int32Array = [0, 1, 0, 1];
        TestRepeat(score, expectedIndexes);
    }

    @Test
    public function TestRepeatCloseAlternateEndings() : Void 
    {
        var reader : alphaTab.importer.Gp3To5Importer = PrepareImporterWithFile("GuitarPro5\\RepeatCloseAlternateEndings.gp5");
        var score : alphaTab.model.Score = reader.ReadScore();
        var expectedIndexes : system.Int32Array = [0, 1, 0, 2, 3, 0, 1, 0, 4];
        TestRepeat(score, expectedIndexes);
    }

    private function TestRepeat(score : alphaTab.model.Score, expectedIndexes : system.Int32Array) : Void 
    {
        var controller : alphaTab.audio.generator.MidiPlaybackController = new alphaTab.audio.generator.MidiPlaybackController(score);
        var i : system.Int32 = 0;
        while (!controller.Finished)
        {
            var index : system.Int32 = controller.Index;
            controller.ProcessCurrent();
            if (controller.ShouldPlay)
            {
                alphaTab.util.Logger.Debug("Test", system.CsString.Format("Checking index {0}, expected[{1}]", [i, expectedIndexes[i]]), null);
                alphaTab.test.Assert.AreEqual_T1_T22(expectedIndexes[i], index);
                i++;
            }
            controller.MoveNext();
        }
        alphaTab.test.Assert.AreEqual_T1_T22(expectedIndexes.Length, i);
        massive.munit.Assert.isTrue(controller.Finished);
    }

    public function new() 
    {
        super();
    }

}
