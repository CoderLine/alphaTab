package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_MidiEvent
{
    public var Tick(default, default) : system.Int32;

    public function ToString() : system.CsString 
    {
        return "Tick[" + Tick + "]";

    }

    private function Equals_FlatMidiEventGenerator_MidiEvent(other : alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent) : system.Boolean 
    {
        return Tick == other.Tick;

    }

    public function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_MidiEvent(cast(obj));

    }

    public function GetHashCode() : system.Int32 
    {
        return Tick;

    }

    private function new() 
    {
        Tick = 0;
    }

}
