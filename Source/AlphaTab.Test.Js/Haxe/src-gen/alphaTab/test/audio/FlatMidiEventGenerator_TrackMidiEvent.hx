package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_TrackMidiEvent extends alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent
{
    public var Track(default, default) : system.Int32;

    public override function ToString() : system.CsString 
    {
        return super.ToString() + " Track[" + Track + "]";

    }

    private function Equals_FlatMidiEventGenerator_TrackMidiEvent(other : alphaTab.test.audio.FlatMidiEventGenerator_TrackMidiEvent) : system.Boolean 
    {
        return super.Equals_FlatMidiEventGenerator_MidiEvent(other) && Track == other.Track;

    }

    public override function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_TrackMidiEvent(cast(obj));

    }

    public override function GetHashCode() : system.Int32 
    {
        {
            return (super.GetHashCode() * 397) ^ Track;

        }
    }

    private function new() 
    {
        super();
    }

}
