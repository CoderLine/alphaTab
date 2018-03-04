package alphaTab.test.audio;

using system.HaxeExtensions;
@:testClass
class MidiFileGeneratorTest
{
    private function ParseTex(tex : system.CsString) : alphaTab.model.Score 
    {
        var importer : alphaTab.importer.AlphaTexImporter = new alphaTab.importer.AlphaTexImporter();
        importer.Init(alphaTab.test.TestPlatform.CreateStringReader(tex));
        return importer.ReadScore();

    }

    @:testMethod
    public function TestCorrectMidiOrder() : Void 
    {
        var midiFile : alphaTab.audio.synth.midi.MidiFile = new alphaTab.audio.synth.midi.MidiFile();
        midiFile.AddEvent(new alphaTab.audio.synth.midi.event.MidiEvent(0, 0, 0, 0));
        midiFile.AddEvent(new alphaTab.audio.synth.midi.event.MidiEvent(0, 0, 1, 0));
        midiFile.AddEvent(new alphaTab.audio.synth.midi.event.MidiEvent(100, 0, 2, 0));
        midiFile.AddEvent(new alphaTab.audio.synth.midi.event.MidiEvent(50, 0, 3, 0));
        midiFile.AddEvent(new alphaTab.audio.synth.midi.event.MidiEvent(50, 0, 4, 0));
        alphaTab.test.Assert.AreEqual_T1_T22(0, midiFile.Events.get_Item(0).Data1);
        alphaTab.test.Assert.AreEqual_T1_T22(1, midiFile.Events.get_Item(1).Data1);
        alphaTab.test.Assert.AreEqual_T1_T22(3, midiFile.Events.get_Item(2).Data1);
        alphaTab.test.Assert.AreEqual_T1_T22(4, midiFile.Events.get_Item(3).Data1);
        alphaTab.test.Assert.AreEqual_T1_T22(2, midiFile.Events.get_Item(4).Data1);
    }

    @:testMethod
    public function TestBend() : Void 
    {
        var tex : system.CsString = ":4 15.6{b(0 4)} 15.6";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.Count);
        var handler : alphaTab.test.audio.FlatMidiEventGenerator = new alphaTab.test.audio.FlatMidiEventGenerator();
        var generator : alphaTab.audio.generator.MidiFileGenerator = new alphaTab.audio.generator.MidiFileGenerator(score, handler);
        generator.Generate();
        var info : alphaTab.model.PlaybackInformation = score.Tracks.get_Item(0).PlaybackInfo;
        var note : alphaTab.model.Note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        var expectedEvents : system.FixedArray<alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent> = [(function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.VolumeCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 120;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.PanCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 64;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.ExpressionControllerCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 127;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.RegisteredParameterFine).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.RegisteredParameterCourse).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.DataEntryFine).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.DataEntryCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 12;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Program = (info.Program).ToByte_IFormatProvider(null);
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.VolumeCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 120;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.PanCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 64;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.ExpressionControllerCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 127;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.RegisteredParameterFine).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.RegisteredParameterCourse).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.DataEntryFine).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.DataEntryCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 12;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Program = (info.Program).ToByte_IFormatProvider(null);
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_TimeSignatureEvent();
            _tmp.Tick = 0;
            _tmp.Numerator = 4;
            _tmp.Denominator = 4;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_TempoEvent();
            _tmp.Tick = 0;
            _tmp.Tempo = 120;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 64;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 87;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 65;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 174;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 66;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 261;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 67;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 349;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 68;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 436;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 69;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 523;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 70;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 610;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 71;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 698;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 72;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 785;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 73;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 872;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 74;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 959;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 75;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.DynamicValue = note.Dynamic;
            _tmp.Key = (note.RealValue).ToByte_IFormatProvider(null);
            _tmp.Length = alphaTab.audio.MidiUtils.ToTicks(note.Beat.Duration);
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 960;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 64;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent();
            _tmp.Tick = 960;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.DynamicValue = note.Dynamic;
            _tmp.Key = (note.RealValue).ToByte_IFormatProvider(null);
            _tmp.Length = alphaTab.audio.MidiUtils.ToTicks(note.Beat.Duration);
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_TrackEndEvent();
            _tmp.Tick = 3840;
            _tmp.Track = 0;
            return _tmp;
        })()];
        {
            var i: system.Int32 = 0;
            while (i < handler.MidiEvents.Count)
            {
                alphaTab.util.Logger.Info("Test", system.CsString.Format("i[{0}] {1}", [i, handler.MidiEvents.get_Item(i)]), null);
                if (i < expectedEvents.Length)
                {
                    alphaTab.test.Assert.AreEqual_T1_T22(expectedEvents[i], handler.MidiEvents.get_Item(i));
                }
                i++;
            }
        }
        alphaTab.test.Assert.AreEqual_T1_T22(expectedEvents.Length, handler.MidiEvents.Count);
    }

    @:testMethod
    public function TestBendMultiPoint() : Void 
    {
        var tex : system.CsString = ":4 15.6{b(0 4 0)} 15.6";
        var score : alphaTab.model.Score = ParseTex(tex);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(2, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(1, score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(1).Notes.Count);
        var handler : alphaTab.test.audio.FlatMidiEventGenerator = new alphaTab.test.audio.FlatMidiEventGenerator();
        var generator : alphaTab.audio.generator.MidiFileGenerator = new alphaTab.audio.generator.MidiFileGenerator(score, handler);
        generator.Generate();
        var info : alphaTab.model.PlaybackInformation = score.Tracks.get_Item(0).PlaybackInfo;
        var note : alphaTab.model.Note = score.Tracks.get_Item(0).Staves.get_Item(0).Bars.get_Item(0).Voices.get_Item(0).Beats.get_Item(0).Notes.get_Item(0);
        var expectedEvents : system.FixedArray<alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent> = [(function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.VolumeCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 120;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.PanCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 64;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.ExpressionControllerCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 127;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.RegisteredParameterFine).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.RegisteredParameterCourse).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.DataEntryFine).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.DataEntryCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 12;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Program = (info.Program).ToByte_IFormatProvider(null);
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.VolumeCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 120;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.PanCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 64;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.ExpressionControllerCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 127;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.RegisteredParameterFine).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.RegisteredParameterCourse).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.DataEntryFine).ToByte_IFormatProvider(null);
            _tmp.Value = 0;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Controller = (alphaTab.audio.synth.midi.event.ControllerTypeEnum.DataEntryCoarse).ToByte_IFormatProvider(null);
            _tmp.Value = 12;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.SecondaryChannel;
            _tmp.Program = (info.Program).ToByte_IFormatProvider(null);
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_TimeSignatureEvent();
            _tmp.Tick = 0;
            _tmp.Numerator = 4;
            _tmp.Denominator = 4;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_TempoEvent();
            _tmp.Tick = 0;
            _tmp.Tempo = 120;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 64;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 43;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 65;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 87;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 66;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 130;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 67;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 174;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 68;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 218;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 69;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 261;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 70;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 305;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 71;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 349;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 72;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 392;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 73;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 436;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 74;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 479;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 75;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 480;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 75;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 523;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 74;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 567;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 73;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 610;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 72;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 654;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 71;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 698;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 70;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 741;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 69;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 785;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 68;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 829;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 67;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 872;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 66;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 916;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 65;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 959;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 64;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent();
            _tmp.Tick = 0;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.DynamicValue = note.Dynamic;
            _tmp.Key = (note.RealValue).ToByte_IFormatProvider(null);
            _tmp.Length = alphaTab.audio.MidiUtils.ToTicks(note.Beat.Duration);
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_BendEvent();
            _tmp.Tick = 960;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.Value = 64;
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent();
            _tmp.Tick = 960;
            _tmp.Track = 0;
            _tmp.Channel = info.PrimaryChannel;
            _tmp.DynamicValue = note.Dynamic;
            _tmp.Key = (note.RealValue).ToByte_IFormatProvider(null);
            _tmp.Length = alphaTab.audio.MidiUtils.ToTicks(note.Beat.Duration);
            return _tmp;
        })(), (function (){
            var _tmp = new alphaTab.test.audio.FlatMidiEventGenerator_TrackEndEvent();
            _tmp.Tick = 3840;
            _tmp.Track = 0;
            return _tmp;
        })()];
        {
            var i: system.Int32 = 0;
            while (i < handler.MidiEvents.Count)
            {
                alphaTab.util.Logger.Info("Test", system.CsString.Format("i[{0}] {1}", [i, handler.MidiEvents.get_Item(i)]), null);
                if (i < expectedEvents.Length)
                {
                    alphaTab.test.Assert.AreEqual_T1_T22(expectedEvents[i], handler.MidiEvents.get_Item(i));
                }
                i++;
            }
        }
        alphaTab.test.Assert.AreEqual_T1_T22(expectedEvents.Length, handler.MidiEvents.Count);
    }

    public function new() 
    {
    }

}
