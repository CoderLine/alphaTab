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
        MidiEvents.Add((function (){
    var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_TimeSignatureEvent();
    _tmp.Tick = tick;
    _tmp.Numerator = timeSignatureNumerator;
    _tmp.Denominator = timeSignatureDenominator;
    return _tmp;
})());
    }

    public function AddRest(track : system.Int32, tick : system.Int32, channel : system.Int32) : Void 
    {
        MidiEvents.Add((function (){
    var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_RestEvent();
    _tmp.Tick = tick;
    _tmp.Track = track;
    _tmp.Channel = channel;
    return _tmp;
})());
    }

    public function AddNote(track : system.Int32, start : system.Int32, length : system.Int32, key : system.Byte, dynamicValue : alphaTab.model.DynamicValue, channel : system.Byte) : Void 
    {
        MidiEvents.Add((function (){
    var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent();
    _tmp.Channel = channel.ToInt32_IFormatProvider(null);
    _tmp.DynamicValue = dynamicValue;
    _tmp.Key = key;
    _tmp.Length = length;
    _tmp.Tick = start;
    _tmp.Track = track;
    return _tmp;
})());
    }

    public function AddControlChange(track : system.Int32, tick : system.Int32, channel : system.Byte, controller : system.Byte, value : system.Byte) : Void 
    {
        MidiEvents.Add((function (){
    var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
    _tmp.Track = track;
    _tmp.Tick = tick;
    _tmp.Channel = channel.ToInt32_IFormatProvider(null);
    _tmp.Controller = controller;
    _tmp.Value = value;
    return _tmp;
})());
    }

    public function AddProgramChange(track : system.Int32, tick : system.Int32, channel : system.Byte, program : system.Byte) : Void 
    {
        MidiEvents.Add((function (){
    var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent();
    _tmp.Channel = channel.ToInt32_IFormatProvider(null);
    _tmp.Program = program;
    _tmp.Tick = tick;
    _tmp.Track = track;
    return _tmp;
})());
    }

    public function AddTempo(tick : system.Int32, tempo : system.Int32) : Void 
    {
        MidiEvents.Add((function (){
    var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_TempoEvent();
    _tmp.Tick = tick;
    _tmp.Tempo = tempo;
    return _tmp;
})());
    }

    public function AddBend(track : system.Int32, tick : system.Int32, channel : system.Byte, value : system.Byte) : Void 
    {
        MidiEvents.Add((function (){
    var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
    _tmp.Tick = tick;
    _tmp.Track = track;
    _tmp.Channel = channel.ToInt32_IFormatProvider(null);
    _tmp.Value = value;
    return _tmp;
})());
    }

    public function FinishTrack(track : system.Int32, tick : system.Int32) : Void 
    {
        MidiEvents.Add((function (){
    var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_TrackEndEvent();
    _tmp.Track = track;
    _tmp.Tick = tick;
    return _tmp;
})());
    }

}
