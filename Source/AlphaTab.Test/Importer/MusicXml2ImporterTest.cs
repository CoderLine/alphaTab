using System.IO;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class MusicXml2ImporterTest 
    {
        internal MusicXml2Importer PrepareImporterWithFile(string name)
        {
            const string path = "TestFiles/MusicXml";
            var buffer = Environment.FileLoaders["default"]().LoadBinary(Path.Combine(path, name));
            return PrepareImporterWithBytes(buffer);
        }

        internal MusicXml2Importer PrepareImporterWithBytes(byte[] buffer)
        {
            var readerBase = new MusicXml2Importer();
            readerBase.Init(new StreamWrapper(new MemoryStream(buffer)));
            return readerBase;
        }


        [TestMethod]
        public void TestPitchesPitches()
        {
            var reader = PrepareImporterWithFile("01a-Pitches-Pitches.xml");
            var score = reader.ReadScore();

            Assert.AreEqual(1, score.Tracks.Count);
            Assert.AreEqual(32, score.MasterBars.Count);
            Assert.AreEqual(32, score.Tracks[0].Bars.Count);

            // Bar 1
            var bar = score.Tracks[0].Bars[0];
            var masterBar = score.MasterBars[0];
            Assert.AreEqual(0, masterBar.KeySignature);
            Assert.AreEqual(4, masterBar.TimeSignatureDenominator);
            Assert.AreEqual(4, masterBar.TimeSignatureNumerator);
            Assert.AreEqual(Clef.G2, bar.Clef);
            Assert.AreEqual(1, bar.Voices.Count);
            Assert.AreEqual(4, bar.Voices[0].Beats.Count);
            Assert.AreEqual(Duration.Quarter, bar.Voices[0].Beats[0].Duration);
            Assert.AreEqual(1, bar.Voices[0].Beats[0].Notes.Count);
            Assert.AreEqual(1, bar.Voices[0].Beats[0].Notes[0].RealValue);
        }
    }
}
