package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_ChannelMidiEvent extends alphaTab.test.audio.FlatMidiEventGenerator_TrackMidiEvent
{
    public var Channel(default, default) : system.Int32;

    public override function ToString() : system.CsString 
    {
        return super.ToString() + " Channel[" + Channel + "]";

    }

    private function Equals_FlatMidiEventGenerator_ChannelMidiEvent(other : alphaTab.test.audio.FlatMidiEventGenerator_ChannelMidiEvent) : system.Boolean 
    {
        return super.Equals_FlatMidiEventGenerator_TrackMidiEvent(other) && Channel == other.Channel;

    }

    public override function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_ChannelMidiEvent(cast(obj));

    }

    public override function GetHashCode() : system.Int32 
    {
        {
            return (super.GetHashCode() * 397) ^ Channel;

        }
    }

    private function new() 
    {
        super();
    }

}
