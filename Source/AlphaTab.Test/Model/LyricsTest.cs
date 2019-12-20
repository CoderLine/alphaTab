using System;
using System.IO;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Model
{
    [TestClass]
    public class LyricsTest
    {
        internal void LoadLyricsTemplateFile(Action<Score> loaded)
        {
            const string path = "TestFiles/GuitarPro6/LyricsTemplate.gpx";
            TestPlatform.LoadFile(path, data =>
            {
                var buffer = ByteBuffer.FromBuffer(data);
                var importer = new GpxImporter();
                importer.Init(buffer, new Settings());
                loaded(importer.ReadScore());
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestApplySingleLineFirstBar()
        {
            LoadLyricsTemplateFile(score =>
            {
                score.Tracks[0].ApplyLyrics(new FastList<Lyrics>
                {
                    new Lyrics {Text = "AAA BBB CCC DDD EEE", StartBar = 0}
                });
                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Lyrics.Length);
                Assert.AreEqual("AAA", score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Lyrics[0]);
                Assert.AreEqual("BBB", score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Lyrics[0]);
                Assert.IsNull(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Lyrics);
                Assert.AreEqual("CCC", score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Lyrics[0]);

                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Lyrics.Length);
                Assert.AreEqual("DDD", score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Lyrics[0]);
                Assert.AreEqual("EEE", score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Lyrics[0]);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestApplySingleLineBarOffset()
        {
            LoadLyricsTemplateFile(score =>
            {
                score.Tracks[0].ApplyLyrics(new FastList<Lyrics>
            {
                new Lyrics { Text = "AAA BBB CCC DDD EEE", StartBar = 2 }
            });

                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Lyrics.Length);
                Assert.AreEqual("AAA", score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Lyrics[0]);
                Assert.AreEqual("BBB", score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[1].Lyrics[0]);
                Assert.IsNull(score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[2].Lyrics);
                Assert.AreEqual("CCC", score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[3].Lyrics[0]);

                Assert.AreEqual(1, score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].Lyrics.Length);
                Assert.AreEqual("DDD", score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[0].Lyrics[0]);
                Assert.AreEqual("EEE", score.Tracks[0].Staves[0].Bars[3].Voices[0].Beats[1].Lyrics[0]);
            });
        }


        [TestMethod, AsyncTestMethod]
        public void TestApplyMultiLineFirstBar()
        {
            LoadLyricsTemplateFile(score =>
            {
                score.Tracks[0].ApplyLyrics(new FastList<Lyrics>
            {
                new Lyrics { Text = "AAA BBB CCC DDD EEE", StartBar = 0 },
                new Lyrics { Text = "111 222 333 444 555", StartBar = 0 }
            });
                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Lyrics.Length);
                Assert.AreEqual("AAA", score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Lyrics[0]);
                Assert.AreEqual("111", score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Lyrics[1]);
                Assert.AreEqual("BBB", score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Lyrics[0]);
                Assert.AreEqual("222", score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[1].Lyrics[1]);
                Assert.IsNull(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[2].Lyrics);
                Assert.AreEqual("CCC", score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Lyrics[0]);
                Assert.AreEqual("333", score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[3].Lyrics[1]);

                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Lyrics.Length);
                Assert.AreEqual("DDD", score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Lyrics[0]);
                Assert.AreEqual("444", score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Lyrics[1]);
                Assert.AreEqual("EEE", score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Lyrics[0]);
                Assert.AreEqual("555", score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Lyrics[1]);
            });
        }

        [TestMethod, AsyncTestMethod]
        public void TestApplyMultiLineBarOffset()
        {
            LoadLyricsTemplateFile(score =>
            {
                score.Tracks[0].ApplyLyrics(new FastList<Lyrics>
            {
                new Lyrics { Text = "AAA BBB CCC DDD EEE", StartBar = 2 },
                new Lyrics { Text = "111 222 333 444 555", StartBar = 1 }
            });

                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Lyrics.Length);

                Assert.IsNull(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Lyrics[0]);
                Assert.AreEqual("111", score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[0].Lyrics[1]);
                Assert.IsNull(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Lyrics[0]);
                Assert.AreEqual("222", score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[1].Lyrics[1]);
                Assert.IsNull(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[2].Lyrics);
                Assert.IsNull(score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[3].Lyrics[0]);
                Assert.AreEqual("333", score.Tracks[0].Staves[0].Bars[1].Voices[0].Beats[3].Lyrics[1]);

                Assert.AreEqual(2, score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Lyrics.Length);
                Assert.AreEqual("AAA", score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Lyrics[0]);
                Assert.AreEqual("444", score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[0].Lyrics[1]);
                Assert.AreEqual("BBB", score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[1].Lyrics[0]);
                Assert.AreEqual("555", score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[1].Lyrics[1]);
                Assert.IsNull(score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[2].Lyrics);
                Assert.AreEqual("CCC", score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[3].Lyrics[0]);
                Assert.IsNull(score.Tracks[0].Staves[0].Bars[2].Voices[0].Beats[3].Lyrics[1]);
            });
        }

        [TestMethod]
        public void TestSpaces()
        {
            TestLyrics("AAA BBB CCC DDD EEE", new[]
            {
                "AAA",
                "BBB",
                "CCC",
                "DDD",
                "EEE"
            });
            TestLyrics("AAA  BBB   CCC", new[]
            {
                "AAA",
                "",
                "BBB",
                "",
                "",
                "CCC"
            });
        }

        [TestMethod]
        public void TestNewLines()
        {
            TestLyrics("AAA\r\nBBB\rCCC\nDDD\r\nEEE", new[]
            {
                "AAA",
                "BBB",
                "CCC",
                "DDD",
                "EEE"
            });
        }

        [TestMethod]
        public void TestDash()
        {
            TestLyrics("AAA-BBB CCC- DDD EEE--FFF", new[]
            {
                "AAA-",
                "BBB",
                "CCC-",
                "DDD",
                "EEE--",
                "FFF"
            });
        }

        [TestMethod]
        public void TestPlus()
        {
            TestLyrics("AAA+BBB CCC++DDD EEE+ FFF", new[]
            {
                "AAA BBB",
                "CCC  DDD",
                "EEE ",
                "FFF"
            });
        }

        [TestMethod]
        public void TestComments()
        {
            TestLyrics("[ABCD]AAA BBB", new[]
            {
                "AAA",
                "BBB"
            });

            TestLyrics("[ABCD] AAA BBB", new[]
            {
                "",
                "AAA",
                "BBB"
            });

            TestLyrics("[AAA BBB\r\nCCC DDD]AAA BBB", new[]
            {
                "AAA",
                "BBB"
            });

            TestLyrics("[AAA BBB\r\nCCC DDD] AAA BBB", new[]
            {
                "",
                "AAA",
                "BBB"
            });

            TestLyrics("[AAA] AAA [BBB] BBB [CCC] CCC [DDD] DDD", new[]
            {
                "",
                "AAA",
                "",
                "BBB",
                "",
                "CCC",
                "",
                "DDD",
            });
        }

        private void TestLyrics(string text, string[] chunks)
        {
            var lyrics = new Lyrics();
            lyrics.Text = text;
            lyrics.Finish();
            Assert.AreEqual(string.Join(", ", chunks), string.Join(", ", lyrics.Chunks));
        }
    }
}
