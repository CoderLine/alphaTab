using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlphaTab.Audio.Generator;
using AlphaTab.Model;
using AlphaTab.Test.Importer;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Audio
{
    [TestClass]
    public class MidiPlaybackControllerTest : GpImporterTestBase
    {
        [TestMethod]
        public void TestRepeatClose()
        {
            var reader = PrepareImporterWithFile("RepeatClose.gp5");
            var score = reader.ReadScore();
            var expectedIndexes = new[]
            {
                0, 1, 0, 1, 2
            };

            TestRepeat(score, expectedIndexes);
        }

        [TestMethod]
        public void TestRepeatCloseMulti()
        {
            var reader = PrepareImporterWithFile("RepeatCloseMulti.gp5");
            var score = reader.ReadScore();
            var expectedIndexes = new[]
            {
                0,1,0,1,0,1,0,1,2
            };
            TestRepeat(score, expectedIndexes);
        }

        [TestMethod]
        public void TestRepeatCloseWithoutStartAtBeginning()
        {
            var reader = PrepareImporterWithFile("RepeatCloseWithoutStartAtBeginning.gp5");
            var score = reader.ReadScore();
            var expectedIndexes = new[]
            {
                0,1,0,1
            };

            TestRepeat(score, expectedIndexes);
        }

        [TestMethod]
        public void TestRepeatCloseAlternateEndings()
        {
            var reader = PrepareImporterWithFile("RepeatCloseAlternateEndings.gp5");
            var score = reader.ReadScore();
            var expectedIndexes = new[]
            {
                0,1,0,2,3,0,1,0,4
            };

            TestRepeat(score, expectedIndexes);
        }

        private void TestRepeat(Score score, int[] expectedIndexes)
        {
            var controller = new MidiPlaybackController(score);
            int i = 0;
            while (!controller.Finished)
            {
                var index = controller.Index;
                controller.ProcessCurrent();
                if (controller.ShouldPlay)
                {
                    Trace.WriteLine(string.Format("Checking index {0}, expected[{1}]", i, expectedIndexes[i]));
                    Assert.AreEqual(expectedIndexes[i], index);
                    i++;
                }
                controller.MoveNext();
            }

            Assert.AreEqual(expectedIndexes.Length, i);
            Assert.IsTrue(controller.Finished);
        }
    }
}
