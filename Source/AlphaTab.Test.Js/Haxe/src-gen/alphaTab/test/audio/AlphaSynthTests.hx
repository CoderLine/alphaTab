package alphaTab.test.audio;

using system.HaxeExtensions;
@:testClass
class AlphaSynthTests
{
    @:testMethod
    public function TestLoadSf2PatchBank() : Void 
    {
        var data : system.ByteArray = alphaTab.test.TestPlatform.LoadFile("TestFiles/Audio/default.sf2");
        var patchBank : alphaTab.audio.synth.bank.PatchBank = new alphaTab.audio.synth.bank.PatchBank();
        var input : alphaTab.io.ByteBuffer = alphaTab.io.ByteBuffer.FromBuffer(data);
        patchBank.LoadSf2(input);
        alphaTab.test.Assert.AreEqual_T1_T22("GS sound set (16 bit)", patchBank.Name);
        alphaTab.test.Assert.AreEqual_T1_T22("960920 ver. 1.00.16", patchBank.Comments);
        alphaTab.test.Assert.AreEqual_T1_T22("0,1,2,3,4,5,6,7,8,9,16,24,32,128", system.CsString.Join_CsString_IEnumerable_T1(",", patchBank.LoadedBanks));
        var gmBank : system.FixedArray<alphaTab.audio.synth.bank.patch.Patch> = patchBank.GetBank(0);
        var expectedPatches : system.FixedArray<system.CsString> = ["Piano 1", "Piano 2", "Piano 3", "Honky-tonk", "E.Piano 1", "E.Piano 2", "Harpsichord", "Clav.", "Celesta", "Glockenspiel", "Music Box", "Vibraphone", "Marimba", "Xylophone", "Tubular-bell", "Santur", "Organ 1", "Organ 2", "Organ 3", "Church Org.1", "Reed Organ", "Accordion Fr", "Harmonica", "Bandoneon", "Nylon-str.Gt", "Steel-str.Gt", "Jazz Gt.", "Clean Gt.", "Muted Gt.", "Overdrive Gt", "DistortionGt", "Gt.Harmonics", "Acoustic Bs.", "Fingered Bs.", "Picked Bs.", "Fretless Bs.", "Slap Bass 1", "Slap Bass 2", "Synth Bass 1", "Synth Bass 2", "Violin", "Viola", "Cello", "Contrabass", "Tremolo Str", "PizzicatoStr", "Harp", "Timpani", "Strings", "Slow Strings", "Syn.Strings1", "Syn.Strings2", "Choir Aahs", "Voice Oohs", "SynVox", "OrchestraHit", "Trumpet", "Trombone", "Tuba", "MutedTrumpet", "French Horns", "Brass 1", "Synth Brass1", "Synth Brass2", "Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax", "Oboe", "English Horn", "Bassoon", "Clarinet", "Piccolo", "Flute", "Recorder", "Pan Flute", "Bottle Blow", "Shakuhachi", "Whistle", "Ocarina", "Square Wave", "Saw Wave", "Syn.Calliope", "Chiffer Lead", "Charang", "Solo Vox", "5th Saw Wave", "Bass & Lead", "Fantasia", "Warm Pad", "Polysynth", "Space Voice", "Bowed Glass", "Metal Pad", "Halo Pad", "Sweep Pad", "Ice Rain", "Soundtrack", "Crystal", "Atmosphere", "Brightness", "Goblin", "Echo Drops", "Star Theme", "Sitar", "Banjo", "Shamisen", "Koto", "Kalimba", "Bagpipe", "Fiddle", "Shanai", "Tinkle Bell", "Agogo", "Steel Drums", "Woodblock", "Taiko", "Melo. Tom 1", "Synth Drum", "Reverse Cym.", "Gt.FretNoise", "Breath Noise", "Seashore", "Bird", "Telephone 1", "Helicopter", "Applause", "Gun Shot"];
        var actualPatches : alphaTab.collections.FastList<system.CsString> = new alphaTab.collections.FastList<system.CsString>();
        for (patch in gmBank)
        {
            if (patch != null)
            {
                actualPatches.Add(patch.Name);
            }
        }
        alphaTab.test.Assert.AreEqual_T1_T22(system.CsString.Join_CsString_CsStringArray(",", expectedPatches), system.CsString.Join_CsString_IEnumerable_CsString(",", actualPatches.ToEnumerable()));
    }

    @:testMethod
    public function TestPcmGeneration() : Void 
    {
        var tex : system.CsString = "\\tempo 102 \\tuning E4 B3 G3 D3 A2 E2 \\instrument 25 . r.8 (0.4 0.3 ).8 " + "(-.3 -.4 ).2 {d } | (0.4 0.3 ).8 r.8 (3.3 3.4 ).8 r.8 (5.4 5.3 ).4 r.8 (0.4 0.3 ).8 |" + " r.8 (3.4 3.3 ).8 r.8 (6.3 6.4 ).8 (5.4 5.3 ).4 {d }r.8 |" + " (0.4 0.3).8 r.8(3.4 3.3).8 r.8(5.4 5.3).4 r.8(3.4 3.3).8 | " + "r.8(0.4 0.3).8(-.3 - .4).2 { d } | ";
        var importer : alphaTab.importer.AlphaTexImporter = new alphaTab.importer.AlphaTexImporter();
        importer.Init(alphaTab.test.TestPlatform.CreateStringReader(tex), null);
        var score : alphaTab.model.Score = importer.ReadScore();
        var midi : alphaTab.audio.synth.midi.MidiFile = new alphaTab.audio.synth.midi.MidiFile();
        var gen : alphaTab.audio.generator.MidiFileGenerator = new alphaTab.audio.generator.MidiFileGenerator(score, new alphaTab.audio.generator.AlphaSynthMidiFileHandler(midi));
        gen.Generate();
        var testOutput : alphaTab.test.audio.TestOutput = new alphaTab.test.audio.TestOutput();
        var synth : alphaTab.audio.synth.AlphaSynth = new alphaTab.audio.synth.AlphaSynth(testOutput);
        synth.LoadSoundFont(alphaTab.test.TestPlatform.LoadFile("TestFiles/Audio/default.sf2"));
        synth.LoadMidi(midi);
        synth.Play();
        var finished : system.Boolean = false;
        synth.Finished += function (b){
    finished = true;
}
;
        while (!finished)
        {
            testOutput.Continue();
        }
    }

    public function new() 
    {
    }

}
