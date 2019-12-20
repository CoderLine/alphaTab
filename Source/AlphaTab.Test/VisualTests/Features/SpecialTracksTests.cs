
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.VisualTests.Features
{
    [TestClass]
    public class SpecialTracksTests : VisualTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void DrumTabs()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Drums.gp5", "TestFiles/VisualTests/Features/SpecialTracks/DrumTabs.png");
        }
        [TestMethod, AsyncTestMethod]
        public void GrandStaff()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Piano.gpx", "TestFiles/VisualTests/Features/SpecialTracks/GrandStaff.png");
        }
    }
}
