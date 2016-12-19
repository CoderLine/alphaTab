using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Model
{
    [TestClass]
    public class TuningParserTest
    {
        [TestMethod]
        public void TestStandard()
        {
            var standard = Tuning.GetDefaultTuningFor(6);
            var tuningText = new[] {"E4", "B3", "G3", "D3", "A2", "E2"};

            var tuning = new int[tuningText.Length];
            var tuningText2 = new string[tuningText.Length];
            for (int i = 0; i < tuningText.Length; i++)
            {
                tuning[i] = TuningParser.GetTuningForText(tuningText[i]);
                tuningText2[i] = Tuning.GetTextForTuning(tuning[i], true);
            }

            Assert.AreEqual(string.Join(",", standard.Tunings), string.Join(",", tuning));
            Assert.AreEqual(string.Join(",", tuningText), string.Join(",", tuningText2));
        }
    }
}
