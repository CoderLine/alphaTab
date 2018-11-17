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
        [TestMethod, AsyncTestMethod]
        public void Test_BeetAnGeSample()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Binchois()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_BrahWiMeSample()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_BrookeWestSample()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Chant()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_DebuMandSample()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Dichterliebe01()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Echigo()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_FaurReveSample()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MahlFaGe4Sample()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MozaChloSample()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MozartPianoSonata()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MozartTrio()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MozaVeilSample()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Saltarello()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_SchbAvMaSample()
        {
            TestReference();
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Telemann()
        {
            TestReference();
        }

        private void TestReference([CallerMemberName] string caller = null, string renderLayout = "page", bool renderAllTracks = true)
        {
            var fileId = caller.Split('_')[1];
            const string path = "TestFiles/MusicXmlSamples/";
            var file = path + fileId + ".xml";
            TestReferenceFile(file, score => { }, renderLayout, renderAllTracks);
        }
    }
}
