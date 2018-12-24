
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.VisualTests.Features
{
    [TestClass]
    public class GuitarTabsTests : VisualTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void Rhythm()
        {
            var settings = Settings.Defaults;
            settings.Staves.Id = "tab";
            settings.Staves.AdditionalSettings["rhythm"] = true;
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Rhythm.gp5", "TestFiles/VisualTests/Features/GuitarTabs/Rhythm.png");
        }

        [TestMethod, AsyncTestMethod]
        public void RhythmWithBeams()
        {
            var settings = Settings.Defaults;
            settings.Staves.Id = "tab";
            settings.Staves.AdditionalSettings["rhythm"] = true;
            settings.Staves.AdditionalSettings["rhythmBeams"] = true;
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Rhythm.gp5", "TestFiles/VisualTests/Features/GuitarTabs/RhythmWithBeams.png");
        }

        [TestMethod, AsyncTestMethod]
        public void StringVariations()
        {
            var settings = Settings.Defaults;
            settings.Staves.Id = "tab";
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Tabs.gp5", "TestFiles/VisualTests/Features/GuitarTabs/StringVariations.png");
        }



    }
}
