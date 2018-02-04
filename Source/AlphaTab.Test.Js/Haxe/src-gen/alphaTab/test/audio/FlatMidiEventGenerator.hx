package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator implements alphaTab.audio.generator.IMidiFileHandler
{
    public var MidiEvents(default, default) : alphaTab.collections.FastList<alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent>;

    public function new() 
    {
        MidiEvents = null;
        MidiEvents = new alphaTab.collections.FastList<alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent>();
    }

    public function AddTimeSignature(tick : system.Int32, timeSignatureNumerator : system.Int32, timeSignatureDenominator : system.Int32) : Void 
    {
        MidiEvents.Add(new alphaTab.test.audio.FlatMidiEventGenerator_TimeSignatureEvent());
    }

    public function AddRest(track : system.Int32, tick : system.Int32, channel : system.Int32) : Void 
    {
        MidiEvents.Add(new alphaTab.test.audio.FlatMidiEventGenerator_RestEvent());
    }

    public function AddNote(track : system.Int32, start : system.Int32, length : system.Int32, key : system.Byte, dynamicValue : alphaTab.model.DynamicValue, channel : system.Byte) : Void 
    {
        MidiEvents.Add(new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent());
    }

    public function AddControlChange(track : system.Int32, tick : system.Int32, channel : system.Byte, controller : system.Byte, value : system.Byte) : Void 
    {
        MidiEvents.Add(new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent());
    }

    public function AddProgramChange(track : system.Int32, tick : system.Int32, channel : system.Byte, program : system.Byte) : Void 
    {
        MidiEvents.Add(new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent());
    }

    public function AddTempo(tick : system.Int32, tempo : system.Int32) : Void 
    {
        MidiEvents.Add(new alphaTab.test.audio.FlatMidiEventGenerator_TempoEvent());
    }

    public function AddBend(track : system.Int32, tick : system.Int32, channel : system.Byte, value : system.Byte) : Void 
    {
        MidiEvents.Add(new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent());
    }

    public function FinishTrack(track : system.Int32, tick : system.Int32) : Void 
    {
        MidiEvents.Add(new alphaTab.test.audio.FlatMidiEventGenerator_TrackEndEvent());
    }

}
