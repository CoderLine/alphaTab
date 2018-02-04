package alphaTab.test.audio;

using system.HaxeExtensions;
class MidiFileGeneratorTest
{
    private function ParseTex(tex : system.CsString) : alphaTab.model.Score 
    {
        var importer : alphaTab.importer.AlphaTexImporter = new alphaTab.importer.AlphaTexImporter();
        importer.Init(alphaTab.test.TestPlatform.CreateStringReader(tex));
        return importer.ReadScore();

    }

    @Test
    public function TestBend() : Void 
    {
        var tex : system.CsString = ":4 15.6{b(0 4)} 15.6";
        var score : alphaTab.model.Score = ParseTex(tex);
        massive.munit.Assert.areEqual(1, score.Tracks.Count);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.Count);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.Count);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.Count);
        var handler : alphaTab.test.audio.FlatMidiEventGenerator = new alphaTab.test.audio.FlatMidiEventGenerator();
        var generator : alphaTab.audio.generator.MidiFileGenerator = new alphaTab.audio.generator.MidiFileGenerator(score, handler);
        generator.Generate();
        var info : alphaTab.model.PlaybackInformation = score.Tracks.get_Item(0).PlaybackInfo;
        var note : alphaTab.model.Note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        var expectedEvents : system.FixedArray<alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent> = [new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_TimeSignatureEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_TempoEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_TrackEndEvent()];
        {
            var i: system.Int32 = 0;
            while (i < handler.MidiEvents.Count)
            {
                alphaTab.util.Logger.Info("Test", system.CsString.Format("i[{0}] {1}", [i, handler.MidiEvents.get_Item(i)]), null);
                if (i < expectedEvents.Length)
                {
                    massive.munit.Assert.areEqual(expectedEvents[i], handler.MidiEvents.get_Item(i));
                }
                i++;
            }
        }
        massive.munit.Assert.areEqual(expectedEvents.Length, handler.MidiEvents.Count);
    }

    @Test
    public function TestBendMultiPoint() : Void 
    {
        var tex : system.CsString = ":4 15.6{b(0 4 0)} 15.6";
        var score : alphaTab.model.Score = ParseTex(tex);
        massive.munit.Assert.areEqual(1, score.Tracks.Count);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.Count);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.Count);
        massive.munit.Assert.areEqual(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
        massive.munit.Assert.areEqual(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.Count);
        var handler : alphaTab.test.audio.FlatMidiEventGenerator = new alphaTab.test.audio.FlatMidiEventGenerator();
        var generator : alphaTab.audio.generator.MidiFileGenerator = new alphaTab.audio.generator.MidiFileGenerator(score, handler);
        generator.Generate();
        var info : alphaTab.model.PlaybackInformation = score.Tracks.get_Item(0).PlaybackInfo;
        var note : alphaTab.model.Note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        var expectedEvents : system.FixedArray<alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent> = [new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_TimeSignatureEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_TempoEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent(), new alphaTab.test.audio.FlatMidiEventGenerator_TrackEndEvent()];
        {
            var i: system.Int32 = 0;
            while (i < handler.MidiEvents.Count)
            {
                alphaTab.util.Logger.Info("Test", system.CsString.Format("i[{0}] {1}", [i, handler.MidiEvents.get_Item(i)]), null);
                if (i < expectedEvents.Length)
                {
                    massive.munit.Assert.areEqual(expectedEvents[i], handler.MidiEvents.get_Item(i));
                }
                i++;
            }
        }
        massive.munit.Assert.areEqual(expectedEvents.Length, handler.MidiEvents.Count);
    }

    public function new() 
    {
    }

}
