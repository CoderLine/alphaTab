package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_BendEvent extends alphaTab.test.audio.FlatMidiEventGenerator_ChannelMidiEvent
{
    public var Value(default, default) : system.Byte;

    public override function ToString() : system.CsString 
    {
        return "Bend: " + super.ToString() + " Value[" + Value + "]";

    }

    private function Equals_FlatMidiEventGenerator_BendEvent(other : alphaTab.test.audio.FlatMidiEventGenerator_BendEvent) : system.Boolean 
    {
        return super.Equals_FlatMidiEventGenerator_ChannelMidiEvent(other) && Value.ToInt32_IFormatProvider(null) == other.Value.ToInt32_IFormatProvider(null);

    }

    public override function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_BendEvent(cast(obj));

    }

    public override function GetHashCode() : system.Int32 
    {
        {
            return (super.GetHashCode() * 397) ^ Value.GetHashCode();

        }
    }

    public function new() 
    {
        super();
    }

}
