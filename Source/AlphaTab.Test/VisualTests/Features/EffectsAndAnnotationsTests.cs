using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.VisualTests.Features
{
    [TestClass]
    public class EffectsAndAnnotationsTests : VisualTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void Markers()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Markers.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Markers.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Tempo()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Tempo.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Tempo.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Text()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Text.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Text.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Chords()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Chords.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Chords.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Vibrato()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Vibrato.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Vibrato.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Dynamics()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Dynamics.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Dynamics.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Tap()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Tap.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Tap.png");
        }
        [TestMethod, AsyncTestMethod]
        public void FadeIn()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/FadeIn.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/FadeIn.png");
        }
        [TestMethod, AsyncTestMethod]
        public void LetRing()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/LetRing.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/LetRing.png");
        }
        [TestMethod, AsyncTestMethod]
        public void PalmMute()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/PalmMute.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/PalmMute.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Bends()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Bends.gp", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Bends.png");
        }
        [TestMethod, AsyncTestMethod]
        public void TremoloBar()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Whammy.gp", "TestFiles/VisualTests/Features/EffectsAndAnnotations/TremoloBar.png");
        }
        [TestMethod, AsyncTestMethod]
        public void TremoloPicking()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/TremoloPicking.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/TremoloPicking.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Brush()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Brush.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Brush.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Slides()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Slides.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Slides.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Trill()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Trill.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Trill.png");
        }
        [TestMethod, AsyncTestMethod]
        public void PickStroke()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/PickStroke.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/PickStroke.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Tuplets()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Tuplets.gp5", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Tuplets.png");
        }
        [TestMethod, AsyncTestMethod]
        public void Fingering()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/Fingering.gpx", "TestFiles/VisualTests/Features/EffectsAndAnnotations/Fingering.png");
        }
        [TestMethod, AsyncTestMethod]
        public void TripletFeel()
        {
            var settings = new Settings();
            RunVisualTest(settings, new[] { 0 }, "TestFiles/Docs/Features/TripletFeel.gpx", "TestFiles/VisualTests/Features/EffectsAndAnnotations/TripletFeel.png");
        }
    }
}
