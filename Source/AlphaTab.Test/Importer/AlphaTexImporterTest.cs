using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlphaTab.Importer;
using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class AlphaTexImporterTest
    {
        [TestMethod]
        public void EnsureMetadataParsing_Issue73()
        {
            var tex = @"\title Test
                        \words test
                        \music alphaTab
                        \copyright test
                        \tempo 200
                        \instrument 30
                        \capo 2
                        \tuning G4 D3 G3 B3 D4 A5
                        .
                        0.5.2 1.5.4 3.4.4 | 5.3.8 5.3.8 5.3.8 5.3.8 r.2";

            var score = ScoreLoader.LoadScoreFromBytes(Encoding.UTF8.GetBytes(tex));

            Assert.AreEqual("Test", score.Title);
            Assert.AreEqual("test", score.Words);
            Assert.AreEqual("alphaTab", score.Music);
            Assert.AreEqual("test", score.Copyright);
            Assert.AreEqual(200, score.Tempo);

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(30, score.Tracks[0].PlaybackInfo.Program);
            Assert.AreEqual(2, score.Tracks[0].Capo);
            Assert.AreEqual("55,38,43,47,50,69", string.Join(",", score.Tracks[0].Tuning));

            Assert.AreEqual(2, score.MasterBars.Count);

            Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats.Count);
            {
                Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes.Count);
                Assert.AreEqual(Duration.Half, score.Tracks[0].Bars[0].Voices[0].Beats[0].Duration);
                Assert.AreEqual(0, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].Fret);
                Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[0].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes.Count);
                Assert.AreEqual(Duration.Quarter, score.Tracks[0].Bars[0].Voices[0].Beats[1].Duration);
                Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].Fret);
                Assert.AreEqual(2, score.Tracks[0].Bars[0].Voices[0].Beats[1].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes.Count);
                Assert.AreEqual(Duration.Quarter, score.Tracks[0].Bars[0].Voices[0].Beats[2].Duration);
                Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes[0].Fret);
                Assert.AreEqual(3, score.Tracks[0].Bars[0].Voices[0].Beats[2].Notes[0].String);
            }

            Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats.Count);
            {
                Assert.AreEqual(1, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes.Count);
                Assert.AreEqual(Duration.Eighth, score.Tracks[0].Bars[1].Voices[0].Beats[0].Duration);
                Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].Fret);
                Assert.AreEqual(4, score.Tracks[0].Bars[1].Voices[0].Beats[0].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Bars[1].Voices[0].Beats[1].Notes.Count);
                Assert.AreEqual(Duration.Eighth, score.Tracks[0].Bars[1].Voices[0].Beats[1].Duration);
                Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats[1].Notes[0].Fret);
                Assert.AreEqual(4, score.Tracks[0].Bars[1].Voices[0].Beats[1].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Bars[1].Voices[0].Beats[2].Notes.Count);
                Assert.AreEqual(Duration.Eighth, score.Tracks[0].Bars[1].Voices[0].Beats[2].Duration);
                Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats[2].Notes[0].Fret);
                Assert.AreEqual(4, score.Tracks[0].Bars[1].Voices[0].Beats[2].Notes[0].String);

                Assert.AreEqual(1, score.Tracks[0].Bars[1].Voices[0].Beats[3].Notes.Count);
                Assert.AreEqual(Duration.Eighth, score.Tracks[0].Bars[1].Voices[0].Beats[3].Duration);
                Assert.AreEqual(5, score.Tracks[0].Bars[1].Voices[0].Beats[3].Notes[0].Fret);
                Assert.AreEqual(4, score.Tracks[0].Bars[1].Voices[0].Beats[3].Notes[0].String);

                Assert.AreEqual(0, score.Tracks[0].Bars[1].Voices[0].Beats[4].Notes.Count);
                Assert.AreEqual(Duration.Half, score.Tracks[0].Bars[1].Voices[0].Beats[4].Duration);
                Assert.AreEqual(true, score.Tracks[0].Bars[1].Voices[0].Beats[4].IsRest);
            }

        }
    }
}
