
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.VisualTests.Features
{
    [TestClass]
    public class SpecialNotesTests : VisualTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void TiedNotes()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/TiedNotes.gp5", "TestFiles/VisualTests/Features/SpecialNotes/TiedNotes.png");
        }

        [TestMethod, AsyncTestMethod]
        public void GraceNotes()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/GraceNotes.gp5", "TestFiles/VisualTests/Features/SpecialNotes/GraceNotes.png");
        }

        [TestMethod, AsyncTestMethod]
        public void DeadNotes()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/DeadNotes.gp5", "TestFiles/VisualTests/Features/SpecialNotes/DeadNotes.png");
        }

        [TestMethod, AsyncTestMethod]
        public void GhostNotes()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/GhostNotes.gp5", "TestFiles/VisualTests/Features/SpecialNotes/GhostNotes.png");
        }

    }
}
