﻿using System.Diagnostics;
using AlphaTab.Audio.Generator;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Test.Importer;
using AlphaTab.Util;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Audio
{
    [TestClass]
    public class MidiPlaybackControllerTest : GpImporterTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void TestRepeatClose()
        {
            PrepareImporterWithFile("GuitarPro5\\RepeatClose.gp5",
                reader =>
                {
                    var score = reader.ReadScore();
                    var expectedIndexes = new[]
                    {
                        0, 1, 0, 1, 2
                    };

                    TestRepeat(score, expectedIndexes);
                });
        }

        [TestMethod, AsyncTestMethod]
        public void TestRepeatCloseMulti()
        {
            PrepareImporterWithFile("GuitarPro5\\RepeatCloseMulti.gp5",
                reader =>
                {
                    var score = reader.ReadScore();
                    var expectedIndexes = new[]
                    {
                        0, 1, 0, 1, 0, 1, 0, 1, 2
                    };
                    TestRepeat(score, expectedIndexes);
                });
        }

        [TestMethod, AsyncTestMethod]
        public void TestRepeatCloseWithoutStartAtBeginning()
        {
            PrepareImporterWithFile("GuitarPro5\\RepeatCloseWithoutStartAtBeginning.gp5",
                reader =>
                {
                    var score = reader.ReadScore();
                    var expectedIndexes = new[]
                    {
                        0, 1, 0, 1
                    };

                    TestRepeat(score, expectedIndexes);
                });
        }

        [TestMethod, AsyncTestMethod]
        public void TestRepeatCloseAlternateEndings()
        {
            PrepareImporterWithFile("GuitarPro5\\RepeatCloseAlternateEndings.gp5",
                reader =>
                {
                    var score = reader.ReadScore();
                    var expectedIndexes = new[]
                    {
                        0, 1, 0, 2, 3, 0, 1, 0, 4
                    };

                    TestRepeat(score, expectedIndexes);
                });
        }

        private void TestRepeat(Score score, int[] expectedIndexes)
        {
            var controller = new MidiPlaybackController(score);
            var i = 0;
            while (!controller.Finished)
            {
                var index = controller.Index;
                controller.ProcessCurrent();
                if (controller.ShouldPlay)
                {
                    Logger.Debug("Test", $"Checking index {i}, expected[{expectedIndexes[i]}]");
                    Assert.AreEqual(expectedIndexes[i], index);
                    i++;
                }

                controller.MoveNext();
            }

            Assert.AreEqual(expectedIndexes.Length, i);
            Assert.IsTrue(controller.Finished);
        }

        [TestMethod]
        public void TestRepeatWithAlphaTex()
        {
            var tex = @"\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \rc 2 1.3 2.3 3.3 4.3 | \ro \rc 3 1.3 2.3 3.3 4.3";
            var importer = new AlphaTexImporter();
            importer.Init(TestPlatform.CreateStringReader(tex), new Settings());
            var score = importer.ReadScore();

            var playedBars = new FastList<int>();
            var controller = new MidiPlaybackController(score);
            while (!controller.Finished)
            {
                var index = controller.Index;
                playedBars.Add(index);
                controller.ProcessCurrent();
                controller.MoveNext();

                if (playedBars.Count > 50)
                {
                    Assert.Fail("Too many bars generated");
                }
            }

            var expectedBars = new FastList<int>
            {
                0,
                1,
                2,
                0,
                1,
                2,
                3,
                3,
                3
            };

            Assert.AreEqual(string.Join(",", expectedBars), string.Join(",", playedBars));
        }
    }
}
