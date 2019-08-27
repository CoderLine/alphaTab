using System.Text;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;

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
                    renderer.Width = 1300;

                    var result = new FastList<object>();

                    float totalWidth = 0;
                    float totalHeight = 0;

                    renderer.PartialRenderFinished += e => { if(e != null) { result.Add(e.RenderResult);} };
                    renderer.RenderFinished += e =>
                    {
                        totalWidth = e.TotalWidth;
                        totalHeight = e.TotalHeight;
                        result.Add(e.RenderResult);
                    };

                    renderer.Error += (s, e) =>
                    {
                        Assert.Fail("Failed to render image: " + s + "," + e);
                    };

                    renderer.RenderScore(score, tracks);

                    TestPlatform.CompareVisualResult(totalWidth, totalHeight, result, referenceImage, referenceFileData);
                    TestPlatform.Done();

                }, false);
            }, false);
        }
        protected void RunVisualTestTex(Settings settings, int[] tracks, string alphaTex, string referenceImage)
        {
            TestPlatform.LoadFile(referenceImage, referenceFileData =>
            {
                var importer = new AlphaTexImporter();
                importer.Init(TestPlatform.CreateStringReader(alphaTex), settings);
                var score = importer.ReadScore();
                var renderer = new ScoreRenderer(settings);
                renderer.Width = 1300;

                var result = new FastList<object>();

                float totalWidth = 0;
                float totalHeight = 0;

                renderer.PartialRenderFinished += e => { if(e != null) { result.Add(e.RenderResult);} };
                renderer.RenderFinished += e =>
                {
                    totalWidth = e.TotalWidth;
                    totalHeight = e.TotalHeight;
                    result.Add(e.RenderResult);
                };

                renderer.Error += (s, e) =>
                {
                    Assert.Fail("Failed to render image: " + s + "," + e);
                };

                renderer.RenderScore(score, tracks);

                TestPlatform.CompareVisualResult(totalWidth, totalHeight, result, referenceImage, referenceFileData);
            });
        }
    }
}
