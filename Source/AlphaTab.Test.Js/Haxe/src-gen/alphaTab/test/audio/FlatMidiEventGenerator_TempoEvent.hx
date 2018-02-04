package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_TempoEvent extends alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent
{
    public var Tempo(default, default) : system.Int32;

    public override function ToString() : system.CsString 
    {
        return "Tempo: " + super.ToString() + " Tempo[" + Tempo + "]";

    }

    private function Equals_FlatMidiEventGenerator_TempoEvent(other : alphaTab.test.audio.FlatMidiEventGenerator_TempoEvent) : system.Boolean 
    {
        return super.Equals_FlatMidiEventGenerator_MidiEvent(other) && Tempo == other.Tempo;

    }

    public override function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_TempoEvent(cast(obj));

    }

    public override function GetHashCode() : system.Int32 
    {
        {
            return (super.GetHashCode() * 397) ^ Tempo;

        }
    }

    public function new() 
    {
        super();
    }

}
