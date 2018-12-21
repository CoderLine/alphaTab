using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.VisualTests.Features
{
    [TestClass]
    public class GeneralTests : VisualTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void SongDetails()
        {
            var settings = Settings.Defaults;
            RunVisualTest(settings, new []{0}, "VisualTests/Features/SongDetails.gp5", "VisualTests/Features/SongDetails.png");
        }

        [TestMethod, AsyncTestMethod]
        public void Repeats()
        {
            var settings = Settings.Defaults;
            RunVisualTest(settings, new []{0}, "VisualTests/Features/Repeats.gp5", "VisualTests/Features/Repeats.png");
        }
    }
}
