
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.VisualTests.Features
{
    [TestClass]
    public class LayoutTests : VisualTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void PageLayout()
        {
            var settings = Settings.Defaults;
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/features/Skillet.gp5", "TestFiles/VisualTests/Features/Layout/PageLayout.png");
        }

        [TestMethod, AsyncTestMethod]
        public void MultiTrack()
        {
            var settings = Settings.Defaults;
            RunVisualTest(settings, new[] { 0, 3 }, "TestFiles/Docs/features/Skillet.gp5", "TestFiles/VisualTests/Features/Layout/MultiTrack.png");
        }


        [TestMethod, AsyncTestMethod]
        public void PageLayout5BarsPerRow()
        {
            var settings = Settings.Defaults;
            settings.Layout.Mode = "page";
            settings.Layout.AdditionalSettings["barsPerRow"] = 5;
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/features/Skillet.gp5", "TestFiles/VisualTests/Features/Layout/PageLayout5BarsPerRow.png");
        }

        [TestMethod, AsyncTestMethod]
        public void PageLayoutBar5To8()
        {
            var settings = Settings.Defaults;
            settings.Layout.Mode = "page";
            settings.Layout.AdditionalSettings["start"] = 5;
            settings.Layout.AdditionalSettings["count"] = 4;
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/features/Skillet.gp5", "TestFiles/VisualTests/Features/Layout/PageLayoutBar5To8.png");
        }

        [TestMethod, AsyncTestMethod]
        public void HorizontalLayout()
        {
            var settings = Settings.Defaults;
            settings.Layout.Mode = "horizontal";
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/features/Skillet.gp5", "TestFiles/VisualTests/Features/Layout/HorizontalLayout.png");
        }

        [TestMethod, AsyncTestMethod]
        public void HorizontalLayoutBar5To8()
        {
            var settings = Settings.Defaults;
            settings.Layout.Mode = "horizontal";
            settings.Layout.AdditionalSettings["start"] = 5;
            settings.Layout.AdditionalSettings["count"] = 4;
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/features/Skillet.gp5", "TestFiles/VisualTests/Features/Layout/HorizontalLayoutBar5To8.png");
        }


    }
}
