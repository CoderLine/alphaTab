using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class MusicXmlImporterSamplesTests : MusicXmlImporterTestBase
    {
        [TestMethod]
        public void Test_ActorPreludeSample()
        {
            TestReference(renderLayout:"horizontal");
        }

        [TestMethod]
        public void Test_BeetAnGeSample()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_Binchois()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_BrahWiMeSample()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_BrookeWestSample()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_Chant()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_DebuMandSample()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_Dichterliebe01()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_Echigo()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_FaurReveSample()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_MahlFaGe4Sample()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_MozaChloSample()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_MozartPianoSonata()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_MozartTrio()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_MozaVeilSample()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_Saltarello()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_SchbAvMaSample()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_Telemann()
        {
            TestReference();
        }

        private Score TestReference([CallerMemberName] string caller = null, string renderLayout = "page", bool renderAllTracks = true)
        {
            var fileId = caller.Split('_')[1];
            const string path = "TestFiles/MusicXmlSamples";
            var file = Directory.EnumerateFiles(path, "*.xml").FirstOrDefault(f => f.Contains(fileId));
            return TestReferenceFile(file, renderLayout, renderAllTracks);
        }
    }
}
