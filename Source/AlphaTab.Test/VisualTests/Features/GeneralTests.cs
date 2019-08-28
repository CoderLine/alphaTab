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
            var settings = new Settings();
            RunVisualTest(settings, new []{0}, "TestFiles/Docs/features/SongDetails.gp5", "TestFiles/VisualTests/Features/General/SongDetails.png");
        }

        [TestMethod, AsyncTestMethod]
        public void Repeats()
        {
            var settings = new Settings();
            settings.Display.StaveProfile = StaveProfile.Score;
            RunVisualTest(settings, new []{0}, "TestFiles/Docs/features/Repeats.gp5", "TestFiles/VisualTests/Features/General/Repeats.png");
        }

        [TestMethod, AsyncTestMethod]
        public void AlternateEndings()
        {
            var settings = new Settings();
            settings.Display.StaveProfile = StaveProfile.Score;
            RunVisualTest(settings, new []{0}, "TestFiles/Docs/features/AlternateEndings.gp5", "TestFiles/VisualTests/Features/General/AlternateEndings.png");
        }

        [TestMethod, AsyncTestMethod]
        public void Tuning()
        {
            var settings = new Settings();
            RunVisualTest(settings, new []{0}, "TestFiles/Docs/features/Tuning.gp5", "TestFiles/VisualTests/Features/General/Tuning.png");
        }
    }
}
