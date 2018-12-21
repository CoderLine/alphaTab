using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.Rendering;

namespace AlphaTab.Test.VisualTests
{
    public class VisualTestBase
    {
        protected void RunVisualTest(Settings settings, int[] tracks, string inputFileName, string referenceImage)
        {
            TestPlatform.LoadFile(inputFileName, inputFileData =>
            {
                TestPlatform.LoadFile(referenceImage, referenceFileData =>
                {
                    var score = ScoreLoader.LoadScoreFromBytes(inputFileData, settings);
                    var renderer = new ScoreRenderer(settings);

                    var result = new FastList<object>();

                    renderer.PartialRenderFinished += e => { result.Add(e.RenderResult); };
                    renderer.RenderFinished += e =>
                    {
                        result.Add(e.RenderResult);
                        TestPlatform.CompareVisualResult(result, referenceFileData);
                        TestPlatform.Done();
                    };

                    renderer.Render(score, tracks);
                }, false);
            }, false);
        }
    }
}
