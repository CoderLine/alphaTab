using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering.Utils;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Rendering
{
    [TestClass]
    public class AccidentalHelperTest
    {
        [TestMethod]
        public void TestDisplayTranspositionPitchResultsInAccidental()
        {
            var import = new AlphaTexImporter();
            import.Init(ByteBuffer.FromBuffer(Encoding.UTF8.GetBytes("\\tuning none . e3.8")));
            var score = import.ReadScore();

            var settings = Settings.Defaults;

            // no transposition
            settings.TranspositionPitches = new [] {0};
            ModelUtils.ApplyPitchOffsets(settings, score);
            var helper = new AccidentalHelper();
            var accidental = helper.ApplyAccidental(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0]);
            var line = helper.GetNoteLine(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0]);
            Assert.AreEqual(AccidentalType.None, accidental);
            Assert.AreEqual(17, line);

            // one semitone up => one line up
            settings.TranspositionPitches = new[] { 1 };
            ModelUtils.ApplyPitchOffsets(settings, score);
            helper = new AccidentalHelper();
            accidental = helper.ApplyAccidental(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0]);
            line = helper.GetNoteLine(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0]);
            Assert.AreEqual(AccidentalType.None, accidental);
            Assert.AreEqual(16, line);

            // two semitones up => one line up + sharp
            settings.TranspositionPitches = new[] { 2 };
            ModelUtils.ApplyPitchOffsets(settings, score);
            helper = new AccidentalHelper();
            accidental = helper.ApplyAccidental(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0]);
            line = helper.GetNoteLine(score.Tracks[0].Staves[0].Bars[0].Voices[0].Beats[0].Notes[0]);
            Assert.AreEqual(AccidentalType.Sharp, accidental);
            Assert.AreEqual(16, line);
        }
    }
}
