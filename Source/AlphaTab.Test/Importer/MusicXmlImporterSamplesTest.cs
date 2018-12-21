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
            TestReferenceFile("TestFiles/MusicXmlSamples/BeetAnGeSample.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Binchois()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/Binchois.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_BrahWiMeSample()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/BrahWiMeSample.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_BrookeWestSample()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/BrookeWestSample.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Chant()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/Chant.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_DebuMandSample()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/DebuMandSample.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Dichterliebe01()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/Dichterliebe01.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Echigo()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/Echigo.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_FaurReveSample()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/FaurReveSample.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MahlFaGe4Sample()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/MahlFaGe4Sample.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MozaChloSample()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/MozaChloSample.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MozartPianoSonata()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/MozartPianoSonata.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MozartTrio()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/MozartTrio.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_MozaVeilSample()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/MozaVeilSample.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Saltarello()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/Saltarello.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_SchbAvMaSample()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/SchbAvMaSample.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_Telemann()
        {
            TestReferenceFile("TestFiles/MusicXmlSamples/Telemann.xml");
        }
    }
}
